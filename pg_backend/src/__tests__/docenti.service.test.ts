import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prismaMock } from './setup';
import * as docenti from '../services/docenti.service';

beforeEach(() => vi.clearAllMocks());

afterEach(() => {
  (prismaMock.$transaction as any).mockRestore();
});

const mockDocente = {
  id_docente: 'doc-1',
  nome: 'Anna',
  cognome: 'Verdi',
  email: 'anna@test.it',
  ufficio: 'A101',
  password: 'hashed_pass',
  notifiche_app: true,
  notifiche_email: true,
  reminder_ore: 24,
  tema: 'light',
  lingua: 'it',
  corsi: [{ id_corso: 'corso-1', nome_corso: 'Matematica' }],
  corsi_di_studi: [{
    corso_di_studi: { id_corso_di_studi: 'cds-1', nome: 'Informatica' },
  }],
};

describe('getElencoDocenti', () => {
  it('returns all docenti', async () => {
    prismaMock.docente.findMany.mockResolvedValue([mockDocente]);

    const result = await docenti.getElencoDocenti();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'doc-1',
      nome: 'Anna',
      cognome: 'Verdi',
      email: 'anna@test.it',
      materia: 'Matematica',
      corsoDiStudi: ['Informatica'],
    });
  });

  it('filters by corso', async () => {
    prismaMock.docente.findMany.mockResolvedValue([mockDocente]);

    await docenti.getElencoDocenti({ corso: 'Informatica' });
    expect(prismaMock.docente.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          corsi_di_studi: {
            some: { corso_di_studi: { nome: { contains: 'Informatica', mode: 'insensitive' } } },
          },
        },
      })
    );
  });

  it('filters by search term', async () => {
    prismaMock.docente.findMany.mockResolvedValue([mockDocente]);

    await docenti.getElencoDocenti({ search: 'Anna' });
    expect(prismaMock.docente.findMany).toHaveBeenCalled();
  });

  it('returns empty array', async () => {
    prismaMock.docente.findMany.mockResolvedValue([]);
    const result = await docenti.getElencoDocenti();
    expect(result).toEqual([]);
  });
});

describe('getDettagliDocente', () => {
  it('returns docente details', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(mockDocente as any);

    const result = await docenti.getDettagliDocente('doc-1');
    expect(result).toMatchObject({
      id: 'doc-1',
      nome: 'Anna',
      cognome: 'Verdi',
      materia: 'Matematica',
      corsi: [{ id: 'corso-1', nome: 'Matematica' }],
      corsoDiStudi: ['Informatica'],
    });
  });

  it('throws on non-existent docente', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(null);
    await expect(docenti.getDettagliDocente('invalid')).rejects.toThrow('Docente not found');
  });
});

describe('getSlots', () => {
  it('returns slots for a docente', async () => {
    prismaMock.slotRicevimento.findMany.mockResolvedValue([
      {
        id_slot: 'slot-1',
        id_docente: 'doc-1',
        data: new Date('2027-01-15'),
        ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
        ora_fine: new Date('2027-01-15T10:00:00.000Z'),
        disponibilita: true,
        luogo: null,
        prenotazioni: [],
      },
    ]);

    const result = await docenti.getSlots('doc-1');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'slot-1',
      disponibilita: true,
      stato: 'disponibile',
      prenotazioniCount: 0,
    });
  });

  it('filters by month', async () => {
    prismaMock.slotRicevimento.findMany.mockResolvedValue([]);

    await docenti.getSlots('doc-1', '2024-01');
    expect(prismaMock.slotRicevimento.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id_docente: 'doc-1',
          data: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
      })
    );
  });
});

describe('creaSlot', () => {
  it('creates a slot successfully', async () => {
    const mockSlot = {
      id_slot: 'slot-1',
      id_docente: 'doc-1',
      data: new Date('2027-01-15'),
      ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
      ora_fine: new Date('2027-01-15T09:30:00.000Z'),
      disponibilita: true,
      luogo: null,
    };
    const mockTx = {
      slotRicevimento: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(mockSlot),
      },
    };
    (prismaMock.$transaction as any).mockImplementation(async (fn: any) => fn(mockTx));

    prismaMock.giornoBloccato.findUnique.mockResolvedValue(null);
    prismaMock.notifica.create.mockResolvedValue({});

    const result = await docenti.creaSlot('doc-1', {
      data: '2027-01-15',
      oraInizio: '09:00',
      oraFine: '09:30',
    });

    expect(result).toMatchObject({
      id: 'slot-1',
      data: '2027-01-15',
      oraInizio: '09:00',
      oraFine: '09:30',
      disponibilita: true,
    });
  });

  it('throws on duplicate date', async () => {
    const mockTx = {
      slotRicevimento: {
        findFirst: vi.fn().mockResolvedValue({ id_slot: 'existing' } as any),
      },
    };
    (prismaMock.$transaction as any).mockImplementation(async (fn: any) => fn(mockTx));

    prismaMock.giornoBloccato.findUnique.mockResolvedValue(null);

    await expect(
      docenti.creaSlot('doc-1', {
        data: '2027-01-15',
        oraInizio: '09:00',
        oraFine: '09:30',
      })
    ).rejects.toThrow('Slot già esistente in questa fascia oraria');
  });

  it('throws on duration > 1 hour', async () => {
    prismaMock.giornoBloccato.findUnique.mockResolvedValue(null);

    await expect(
      docenti.creaSlot('doc-1', {
        data: '2027-01-15',
        oraInizio: '09:00',
        oraFine: '10:30',
      })
    ).rejects.toThrow('La durata dello slot non può superare 1 ora');
  });
});

describe('modificaSlot', () => {
  it('modifies a slot', async () => {
    prismaMock.slotRicevimento.findFirst.mockResolvedValue({
      id_slot: 'slot-1',
      data: new Date('2027-01-15'),
      ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
      ora_fine: new Date('2027-01-15T10:00:00.000Z'),
      id_docente: 'doc-1',
      luogo: null,
    } as any);
    prismaMock.slotRicevimento.update.mockResolvedValue({} as any);

    const result = await docenti.modificaSlot('doc-1', 'slot-1', { disponibilita: false });
    expect(result).toEqual({ messaggio: 'Slot aggiornato con successo.' });
  });

  it('throws on non-existent slot', async () => {
    prismaMock.slotRicevimento.findFirst.mockResolvedValue(null);

    await expect(docenti.modificaSlot('doc-1', 'invalid', { disponibilita: false })).rejects.toThrow('Slot not found');
  });
});

describe('eliminaSlot', () => {
  it('deletes a slot', async () => {
    prismaMock.slotRicevimento.findFirst.mockResolvedValue({
      id_slot: 'slot-1',
      data: new Date('2027-01-15'),
      id_docente: 'doc-1',
      docente: { id_docente: 'doc-1', notifiche_app: false },
    } as any);
    prismaMock.prenotazione.findMany.mockResolvedValue([]);
    prismaMock.documento.deleteMany.mockResolvedValue({});
    prismaMock.luogoRicevimento.deleteMany.mockResolvedValue({});
    prismaMock.prenotazione.deleteMany.mockResolvedValue({});
    prismaMock.slotRicevimento.delete.mockResolvedValue({} as any);
    prismaMock.notifica.create.mockResolvedValue({});

    await expect(docenti.eliminaSlot('doc-1', 'slot-1')).resolves.not.toThrow();
  });

  it('throws on non-existent slot', async () => {
    prismaMock.slotRicevimento.findFirst.mockResolvedValue(null);

    await expect(docenti.eliminaSlot('doc-1', 'invalid')).rejects.toThrow('Slot not found');
  });
});

describe('aggiornaProfilo', () => {
  it('updates docente profile', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(mockDocente as any);
    prismaMock.docente.update.mockResolvedValue(mockDocente as any);

    const result = await docenti.aggiornaProfilo('doc-1', { nome: 'Anna2' });
    expect(result).toEqual({ messaggio: 'Profilo aggiornato con successo.' });
  });

  it('throws on non-existent docente', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(null);

    await expect(docenti.aggiornaProfilo('invalid', { nome: 'Test' })).rejects.toThrow('Docente not found');
  });
});

describe('getStatistiche', () => {
  it('returns statistics by argomento', async () => {
    prismaMock.prenotazione.findMany.mockResolvedValue([
      { argomento: 'Tesi' },
      { argomento: 'Esame' },
      { argomento: 'Tesi' },
    ] as any[]);

    const result = await docenti.getStatistiche('doc-1');
    expect(result.argomenti).toHaveLength(2);
    expect(result.argomenti).toContainEqual({ nome: 'Tesi', conteggio: 2 });
    expect(result.argomenti).toContainEqual({ nome: 'Esame', conteggio: 1 });
  });

  it('returns empty array when no prenotazioni', async () => {
    prismaMock.prenotazione.findMany.mockResolvedValue([]);

    const result = await docenti.getStatistiche('doc-1');
    expect(result.argomenti).toEqual([]);
  });
});
