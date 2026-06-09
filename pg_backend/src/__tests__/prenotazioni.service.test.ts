import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prismaMock } from './setup';
import * as prenotazioni from '../services/prenotazioni.service';

beforeEach(() => vi.clearAllMocks());

afterEach(() => {
  (prismaMock.$transaction as any).mockRestore();
});

const mockStudente = {
  matricola: 'STU001',
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario@test.it',
  password: 'hashed_pass',
  id_corso_di_studi: 'cds-1',
  notifiche_app: true,
  notifiche_email: false,
  reminder_ore: 24,
  tema: 'light',
  lingua: 'it',
};

const mockSlot = {
  id_slot: 'slot-1',
  data: new Date('2027-01-15'),
  ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
  ora_fine: new Date('2027-01-15T10:00:00.000Z'),
  disponibilita: true,
  id_docente: 'doc-1',
  docente: {
    id_docente: 'doc-1',
    nome: 'Anna',
    cognome: 'Verdi',
    corsi: [{ nome_corso: 'Matematica' }],
  },
  luogo: null,
};

describe('createPrenotazione', () => {
  it('creates a prenotazione successfully', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);

    const mockTx: any = {
      slotRicevimento: {
        findUnique: vi.fn().mockResolvedValue(mockSlot as any),
        update: vi.fn().mockResolvedValue({}),
      },
      prenotazione: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id_prenotazione: 'p-1',
          matricola_studente: 'STU001',
          id_slot: 'slot-1',
          argomento: 'Tesi',
          descrizione: 'Discussione tesi',
          stato_prenotazione: 'IN_ATTESA',
          data_prenotazione: new Date('2024-01-10T10:00:00Z'),
          studente: { matricola: 'STU001', nome: 'Mario', cognome: 'Rossi' },
            slot: {
              id_slot: 'slot-1',
              data: new Date('2027-01-15'),
              ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
              ora_fine: new Date('2027-01-15T10:00:00.000Z'),
              docente: {
                id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi',
                corsi: [{ nome_corso: 'Matematica' }],
              },
              luogo: null,
            },
          documenti: [],
        }),
      },
    };

    (prismaMock.$transaction as any).mockImplementation(async (fn: any) => fn(mockTx));
    prismaMock.notifica.create.mockResolvedValue({});

    const result = await prenotazioni.createPrenotazione({
      matricolaStudente: 'STU001',
      idSlot: 'slot-1',
      argomento: 'Tesi',
      descrizione: 'Discussione tesi',
    });

    expect(result).toMatchObject({
      id: 'p-1',
      studenteId: 'STU001',
      argomento: 'Tesi',
      stato: 'in_attesa',
    });
  });

  it('throws when student not found', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);

    await expect(
      prenotazioni.createPrenotazione({
        matricolaStudente: 'INVALID',
        idSlot: 'slot-1',
        argomento: 'Test',
      })
    ).rejects.toThrow('Studente non trovato');
  });
});

describe('annullaPrenotazione', () => {
  it('cancels a prenotazione', async () => {
    const mockTx = {
      prenotazione: { update: vi.fn().mockResolvedValue({} as any) },
      slotRicevimento: { update: vi.fn().mockResolvedValue({} as any) },
    };
    (prismaMock.$transaction as any).mockImplementation(async (fn: any) => fn(mockTx));

    prismaMock.prenotazione.findUnique.mockResolvedValue({
      id_prenotazione: 'p-1',
      id_slot: 'slot-1',
      matricola_studente: 'STU001',
      argomento: 'Test',
      slot: {
        id_slot: 'slot-1',
        data: new Date('2027-01-15'),
        ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
        docente: { id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi' },
      },
      studente: { nome: 'Mario', cognome: 'Rossi' },
    } as any);
    prismaMock.notifica.create.mockResolvedValue({});

    await expect(prenotazioni.annullaPrenotazione('p-1')).resolves.not.toThrow();
    expect(mockTx.prenotazione.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { stato_prenotazione: 'ANNULLATA' },
      })
    );
  });

  it('throws on non-existent prenotazione', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue(null);

    await expect(prenotazioni.annullaPrenotazione('invalid')).rejects.toThrow('Prenotazione not found');
  });
});

describe('eliminaPrenotazione', () => {
  it('deletes a prenotazione', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue({
      id_prenotazione: 'p-1',
      id_slot: 'slot-1',
    } as any);
    prismaMock.documento.deleteMany.mockResolvedValue({});
    prismaMock.slotRicevimento.update.mockResolvedValue({});
    prismaMock.prenotazione.delete.mockResolvedValue({} as any);

    await expect(prenotazioni.eliminaPrenotazione('p-1')).resolves.not.toThrow();
  });

  it('throws on non-existent prenotazione', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue(null);
    await expect(prenotazioni.eliminaPrenotazione('invalid')).rejects.toThrow('Prenotazione not found');
  });
});

describe('getPrenotazioniStudente', () => {
  it('returns prenotazioni for a student', async () => {
    prismaMock.prenotazione.findMany.mockResolvedValue([
      {
        id_prenotazione: 'p-1',
        matricola_studente: 'STU001',
        id_slot: 'slot-1',
        argomento: 'Tesi',
        descrizione: 'Desc',
        stato_prenotazione: 'IN_ATTESA',
        data_prenotazione: new Date('2024-01-10T10:00:00Z'),
        slot: {
          id_slot: 'slot-1',
          data: new Date('2027-01-15'),
          ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
          ora_fine: new Date('2027-01-15T10:00:00.000Z'),
          docente: {
            id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi',
            corsi: [{ nome_corso: 'Matematica' }],
          },
          luogo: null,
        },
      },
    ]);

    const result = await prenotazioni.getPrenotazioniStudente('STU001');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'p-1',
      docente: 'Anna Verdi',
      stato: 'in_attesa',
    });
  });
});

describe('getPrenotazioniDocente', () => {
  it('returns prenotazioni for a docente', async () => {
    prismaMock.prenotazione.findMany.mockResolvedValue([
      {
        id_prenotazione: 'p-1',
        matricola_studente: 'STU001',
        id_slot: 'slot-1',
        argomento: 'Tesi',
        stato_prenotazione: 'CONFERMATA',
        data_prenotazione: new Date('2024-01-10T10:00:00Z'),
        studente: { matricola: 'STU001', nome: 'Mario', cognome: 'Rossi' },
        slot: {
          id_slot: 'slot-1',
          data: new Date('2027-01-15'),
          ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
          ora_fine: new Date('2027-01-15T10:00:00.000Z'),
          luogo: null,
        },
      },
    ]);

    const result = await prenotazioni.getPrenotazioniDocente('doc-1');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      studente: 'Mario Rossi',
      stato: 'confermata',
    });
  });
});

describe('aggiornaStatoPrenotazione', () => {
  it('confirms a prenotazione', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue({
      id_prenotazione: 'p-1',
      id_slot: 'slot-1',
      matricola_studente: 'STU001',
    } as any);

    prismaMock.prenotazione.update.mockResolvedValue({
      id_prenotazione: 'p-1',
      matricola_studente: 'STU001',
      id_slot: 'slot-1',
      argomento: 'Tesi',
      descrizione: 'Desc',
      stato_prenotazione: 'CONFERMATA',
      data_prenotazione: new Date('2024-01-10T10:00:00Z'),
      slot: {
        id_slot: 'slot-1',
        data: new Date('2027-01-15'),
        ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
        ora_fine: new Date('2027-01-15T10:00:00.000Z'),
        docente: { id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi' },
        luogo: null,
      },
    } as any);

    prismaMock.notifica.create.mockResolvedValue({});

    const result = await prenotazioni.aggiornaStatoPrenotazione('p-1', 'CONFERMATA');
    expect(result).toMatchObject({
      id: 'p-1',
      stato: 'confermata',
    });
  });

  it('throws on non-existent prenotazione', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue(null);
    await expect(prenotazioni.aggiornaStatoPrenotazione('invalid', 'CONFERMATA')).rejects.toThrow('Prenotazione not found');
  });
});

describe('aggiungiDocumenti', () => {
  it('adds documents to a prenotazione', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue({
      id_prenotazione: 'p-1',
    } as any);
    prismaMock.documento.createMany.mockResolvedValue({ count: 1 });

    prismaMock.prenotazione.findUnique.mockResolvedValue({
      id_prenotazione: 'p-1',
      matricola_studente: 'STU001',
      id_slot: 'slot-1',
      argomento: 'Tesi',
      descrizione: 'Desc',
      stato_prenotazione: 'IN_ATTESA',
      data_prenotazione: new Date('2024-01-10T10:00:00Z'),
      studente: { matricola: 'STU001', nome: 'Mario', cognome: 'Rossi', email: 'mario@test.it' },
      slot: {
        data: new Date('2027-01-15'),
        ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
        ora_fine: new Date('2027-01-15T10:00:00.000Z'),
        docente: { corsi: [{ nome_corso: 'Matematica' }] },
        luogo: null,
      },
      documenti: [],
    } as any);

    const files = [{ originalname: 'doc.pdf', mimetype: 'application/pdf', size: 1024, filename: 'uploads/doc.pdf' }] as Express.Multer.File[];

    const result = await prenotazioni.aggiungiDocumenti('p-1', files);
    expect(result).toMatchObject({
      id: 'p-1',
    });
  });

  it('throws on non-existent prenotazione', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue(null);
    await expect(prenotazioni.aggiungiDocumenti('invalid', [])).rejects.toThrow('Prenotazione not found');
  });
});

describe('getPrenotazioneById', () => {
  it('returns a prenotazione by id', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue({
      id_prenotazione: 'p-1',
      matricola_studente: 'STU001',
      id_slot: 'slot-1',
      argomento: 'Tesi',
      descrizione: 'Desc',
      stato_prenotazione: 'IN_ATTESA',
      data_prenotazione: new Date('2024-01-10T10:00:00Z'),
      studente: { matricola: 'STU001', nome: 'Mario', cognome: 'Rossi', email: 'mario@test.it' },
      slot: {
        id_slot: 'slot-1',
        data: new Date('2027-01-15'),
        ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
        ora_fine: new Date('2027-01-15T10:00:00.000Z'),
        docente: {
          id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi',
          corsi: [{ nome_corso: 'Matematica' }],
        },
        luogo: null,
      },
      documenti: [],
    } as any);

    const result = await prenotazioni.getPrenotazioneById('p-1');
    expect(result).toMatchObject({
      id: 'p-1',
      studente: 'Mario Rossi',
      docente: 'Anna Verdi',
      materia: 'Matematica',
    });
  });

  it('throws on non-existent prenotazione', async () => {
    prismaMock.prenotazione.findUnique.mockResolvedValue(null);
    await expect(prenotazioni.getPrenotazioneById('invalid')).rejects.toThrow('Prenotazione not found');
  });
});
