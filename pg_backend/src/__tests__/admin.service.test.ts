import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prismaMock } from './setup';
import * as admin from '../services/admin.service';

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  (prismaMock.$transaction as any).mockRestore();
});

describe('getStats', () => {
  it('returns admin stats', async () => {
    prismaMock.studente.count.mockResolvedValue(10);
    prismaMock.docente.count.mockResolvedValue(5);
    prismaMock.prenotazione.count.mockResolvedValueOnce(50).mockResolvedValueOnce(3);
    prismaMock.slotRicevimento.count.mockResolvedValue(20);

    const result = await admin.getStats();
    expect(result).toEqual({
      totaleStudenti: 10,
      totaleDocenti: 5,
      totalePrenotazioni: 50,
      slotAttivi: 20,
      prenotazioniOggi: 3,
    });
  });
});

describe('getAllAccounts', () => {
  it('returns all students when ruolo is studente', async () => {
    prismaMock.studente.findMany.mockResolvedValue([
      {
        matricola: 'STU001', nome: 'Mario', cognome: 'Rossi',
        email: 'mario@test.it',
        corso_di_studi: { nome: 'Informatica' },
      },
    ]);

    const result = await admin.getAllAccounts('studente');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ ruolo: 'studente', matricola: 'STU001' });
  });

  it('returns all accounts when no ruolo filter', async () => {
    prismaMock.studente.findMany.mockResolvedValue([
      {
        matricola: 'STU001', nome: 'Mario', cognome: 'Rossi',
        email: 'mario@test.it',
        corso_di_studi: { nome: 'Informatica' },
      },
    ]);
    prismaMock.docente.findMany.mockResolvedValue([]);
    prismaMock.amministratore.findMany.mockResolvedValue([]);

    const result = await admin.getAllAccounts();
    expect(result).toHaveLength(1);
  });

  it('includes docente corsi', async () => {
    prismaMock.studente.findMany.mockResolvedValue([]);
    prismaMock.docente.findMany.mockResolvedValue([
      {
        id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi',
        email: 'anna@test.it', ufficio: 'A101',
        corsi: [{ id_corso: 'corso-1', nome_corso: 'Matematica' }],
        corsi_di_studi: [{
          corso_di_studi: { id_corso_di_studi: 'cds-1', nome: 'Informatica' },
        }],
      },
    ]);
    prismaMock.amministratore.findMany.mockResolvedValue([]);

    const result = await admin.getAllAccounts();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      ruolo: 'docente',
      corsi: [{ id: 'corso-1', nome: 'Matematica' }],
    });
  });
});

describe('createAccount', () => {
  it('creates a student account', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    prismaMock.corsoDiStudi.findUnique.mockResolvedValue({
      id_corso_di_studi: 'cds-1', nome: 'Informatica',
    });
    prismaMock.studente.create.mockResolvedValue({
      matricola: 'STU001', nome: 'Mario', cognome: 'Rossi',
      email: 'mario@test.it', id_corso_di_studi: 'cds-1',
      corso_di_studi: { nome: 'Informatica' },
    });

    const result = await admin.createAccount({
      ruolo: 'studente', matricola: 'STU001', nome: 'Mario',
      cognome: 'Rossi', email: 'mario@test.it', password: 'pass123',
      corsoDiStudi: 'Informatica',
    });

    expect(result).toMatchObject({
      ruolo: 'studente', matricola: 'STU001',
      corsoDiStudi: 'Informatica',
    });
  });

  it('creates a docente account with corsi', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(null);
    prismaMock.docente.create.mockResolvedValue({
      id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi',
      email: 'anna@test.it', ufficio: 'A101', password: 'hashed_pass',
    });
    prismaMock.corso.findUnique.mockResolvedValue({
      id_corso: 'corso-1', nome_corso: 'Matematica',
      id_corso_di_studi: 'cds-1',
    });
    prismaMock.corso.update.mockResolvedValue({});
    prismaMock.docenteCorsoDiStudi.upsert.mockResolvedValue({});

    const result = await admin.createAccount({
      ruolo: 'docente', nome: 'Anna', cognome: 'Verdi',
      email: 'anna@test.it', password: 'pass123', ufficio: 'A101',
      corsi: ['corso-1'],
    });

    expect(result.ruolo).toBe('docente');
  });

  it('creates an admin account', async () => {
    prismaMock.amministratore.findUnique.mockResolvedValue(null);
    prismaMock.amministratore.create.mockResolvedValue({
      id_admin: 'admin-1', nome: 'Admin', email: 'admin@test.it',
    });

    const result = await admin.createAccount({
      ruolo: 'amministratore', nome: 'Admin',
      email: 'admin@test.it', password: 'pass123',
    });

    expect(result).toMatchObject({ ruolo: 'amministratore' });
  });

  it('throws on duplicate email for student', async () => {
    prismaMock.studente.findUnique.mockResolvedValue({ email: 'mario@test.it' } as any);

    await expect(
      admin.createAccount({
        ruolo: 'studente', matricola: 'STU001', nome: 'Mario',
        cognome: 'Rossi', email: 'mario@test.it', password: 'pass123',
      })
    ).rejects.toThrow('Email already in use');
  });
});

describe('deleteAccount', () => {
  it('deletes a student account', async () => {
    prismaMock.studente.findUnique.mockResolvedValue({
      matricola: 'STU001', nome: 'Mario',
    } as any);

    const mockTx: any = {
      documento: { deleteMany: vi.fn().mockResolvedValue({}) },
      prenotazione: { deleteMany: vi.fn().mockResolvedValue({}) },
      segnalazione: { deleteMany: vi.fn().mockResolvedValue({}) },
      notifica: { deleteMany: vi.fn().mockResolvedValue({}) },
      studente: { delete: vi.fn().mockResolvedValue({}) },
    };

    (prismaMock.$transaction as any).mockImplementation(async (fn: any) => fn(mockTx));

    await expect(admin.deleteAccount('STU001')).resolves.not.toThrow();
    expect(mockTx.studente.delete).toHaveBeenCalled();
  });

  it('throws on non-existent account', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    prismaMock.docente.findUnique.mockResolvedValue(null);
    prismaMock.amministratore.findUnique.mockResolvedValue(null);

    await expect(admin.deleteAccount('INVALID')).rejects.toThrow('User not found');
  });

  it('prevents deleting own admin account', async () => {
    prismaMock.amministratore.findUnique.mockResolvedValue({
      id_admin: 'admin-1',
    } as any);

    await expect(admin.deleteAccount('admin-1', 'admin-1')).rejects.toThrow(
      'Cannot delete your own account'
    );
  });
});

describe('getSlotDate', () => {
  it('returns grouped slot dates', async () => {
    prismaMock.slotRicevimento.groupBy.mockResolvedValue([
      { data: new Date('2024-01-15'), _count: { id_slot: 3 } },
      { data: new Date('2024-01-16'), _count: { id_slot: 5 } },
    ]);

    const result = await admin.getSlotDate();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ data: '2024-01-15', conteggio: 3 });
  });
});

describe('creaSlot', () => {
  it('creates a slot successfully', async () => {
    const mockSlot = {
      id_slot: 'slot-1',
      data: new Date('2027-01-15'),
      ora_inizio: new Date('2027-01-15T09:00:00.000Z'),
      ora_fine: new Date('2027-01-15T10:00:00.000Z'),
      disponibilita: true,
      id_docente: 'doc-1',
      docente: { id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi', email: 'anna@test.it' },
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

    const result = await admin.creaSlot({
      docenteId: 'doc-1',
      data: '2027-01-15',
      oraInizio: '09:00',
      oraFine: '10:00',
    });

    expect(result).toMatchObject({
      id: 'slot-1',
      data: '2027-01-15',
      oraInizio: '09:00',
      oraFine: '10:00',
    });
  });

  it('throws on blocked day', async () => {
    prismaMock.giornoBloccato.findUnique.mockResolvedValue({
      id_giorno: 'g-1', data: new Date('2027-01-15'), motivo: 'Festivo',
    } as any);

    await expect(
      admin.creaSlot({
        docenteId: 'doc-1', data: '2027-01-15',
        oraInizio: '09:00', oraFine: '10:00',
      })
    ).rejects.toThrow('Giorno bloccato');
  });

  it('throws on overlapping slot', async () => {
    const mockTx = {
      slotRicevimento: {
        findFirst: vi.fn().mockResolvedValue({ id_slot: 'existing' } as any),
      },
    };
    (prismaMock.$transaction as any).mockImplementation(async (fn: any) => fn(mockTx));

    prismaMock.giornoBloccato.findUnique.mockResolvedValue(null);

    await expect(
      admin.creaSlot({
        docenteId: 'doc-1', data: '2027-01-15',
        oraInizio: '09:00', oraFine: '10:00',
      })
    ).rejects.toThrow('Slot già esistente in questa fascia oraria');
  });
});

describe('bloccaGiorno', () => {
  it('blocks a day', async () => {
    prismaMock.giornoBloccato.findUnique.mockResolvedValue(null);

    const mockTx: any = {
      slotRicevimento: { findMany: vi.fn().mockResolvedValue([]) },
      documento: { deleteMany: vi.fn().mockResolvedValue({}) },
      prenotazione: { deleteMany: vi.fn().mockResolvedValue({}) },
      luogoRicevimento: { deleteMany: vi.fn().mockResolvedValue({}) },
      notifica: { create: vi.fn().mockResolvedValue({}) },
      giornoBloccato: {
        create: vi.fn().mockResolvedValue({
          id_giorno: 'g-1',
          data: new Date('2024-01-15'),
          motivo: 'Festivo',
          creato_il: new Date(),
        }),
      },
    };

    (prismaMock.$transaction as any).mockImplementation(async (fn: any) => fn(mockTx));

    const result = await admin.bloccaGiorno('2024-01-15');
    expect(result).toMatchObject({
      data: '2024-01-15',
      motivo: 'Festivo',
    });
  });

  it('throws on already blocked day', async () => {
    prismaMock.giornoBloccato.findUnique.mockResolvedValue({
      id_giorno: 'g-1',
    } as any);

    await expect(admin.bloccaGiorno('2024-01-15')).rejects.toThrow('Giorno già bloccato');
  });
});

describe('getAllPrenotazioni', () => {
  it('returns all prenotazioni', async () => {
    prismaMock.prenotazione.findMany.mockResolvedValue([
      {
        id_prenotazione: 'p-1',
        matricola_studente: 'STU001',
        id_slot: 'slot-1',
        argomento: 'Test',
        descrizione: 'Desc',
        stato_prenotazione: 'IN_ATTESA',
        data_prenotazione: new Date('2024-01-10T10:00:00Z'),
        studente: { matricola: 'STU001', nome: 'Mario', cognome: 'Rossi', email: 'mario@test.it' },
        slot: {
          id_slot: 'slot-1',
          data: new Date('2024-01-15'),
          ora_inizio: new Date('2024-01-15T09:00:00.000Z'),
          ora_fine: new Date('2024-01-15T10:00:00.000Z'),
          docente: { id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi', email: 'anna@test.it' },
        },
        documenti: [{ id_documento: 'd-1' }],
      },
    ]);

    const result = await admin.getAllPrenotazioni();
    expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'p-1',
        argomento: 'Test',
        stato: 'in_attesa',
    });
  });
});

describe('getSlotGlobali', () => {
  it('returns all slots', async () => {
    prismaMock.slotRicevimento.findMany.mockResolvedValue([
      {
        id_slot: 'slot-1',
        id_docente: 'doc-1',
        data: new Date('2024-01-15'),
        ora_inizio: new Date('2024-01-15T09:00:00.000Z'),
        ora_fine: new Date('2024-01-15T10:00:00.000Z'),
        disponibilita: true,
        docente: { id_docente: 'doc-1', nome: 'Anna', cognome: 'Verdi', email: 'anna@test.it' },
        luogo: null,
        prenotazioni: [],
      },
    ]);

    const result = await admin.getSlotGlobali();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'slot-1',
      disponibilita: true,
      prenotazioniCount: 0,
    });
  });
});

describe('sbloccaGiorno', () => {
  it('unblocks a day', async () => {
    prismaMock.giornoBloccato.findUnique.mockResolvedValue({
      id_giorno: 'g-1', data: new Date('2024-01-15'), motivo: 'Festivo',
    } as any);
    prismaMock.giornoBloccato.delete.mockResolvedValue({} as any);

    await expect(admin.sbloccaGiorno('g-1')).resolves.not.toThrow();
  });

  it('throws on non-existent day', async () => {
    prismaMock.giornoBloccato.findUnique.mockResolvedValue(null);
    await expect(admin.sbloccaGiorno('invalid')).rejects.toThrow('Giorno non trovato');
  });
});

describe('modificaSlot', () => {
  it('modifies a slot', async () => {
    prismaMock.slotRicevimento.findUnique.mockResolvedValue({
      id_slot: 'slot-1',
      data: new Date('2024-01-15'),
      ora_inizio: new Date('2024-01-15T09:00:00.000Z'),
      ora_fine: new Date('2024-01-15T10:00:00.000Z'),
      disponibilita: true,
      luogo: null,
    } as any);
    prismaMock.slotRicevimento.update.mockResolvedValue({} as any);

    await expect(admin.modificaSlot('slot-1', { disponibilita: false })).resolves.not.toThrow();
  });

  it('throws on non-existent slot', async () => {
    prismaMock.slotRicevimento.findUnique.mockResolvedValue(null);
    await expect(admin.modificaSlot('invalid', { disponibilita: false })).rejects.toThrow('Slot not found');
  });
});

describe('eliminaSlot', () => {
  it('deletes a slot', async () => {
    prismaMock.slotRicevimento.findUnique.mockResolvedValue({
      id_slot: 'slot-1',
      data: new Date('2024-01-15'),
      id_docente: 'doc-1',
      docente: { id_docente: 'doc-1', notifiche_app: false },
    } as any);
    prismaMock.prenotazione.findMany.mockResolvedValue([]);
    prismaMock.documento.deleteMany.mockResolvedValue({});
    prismaMock.luogoRicevimento.deleteMany.mockResolvedValue({});
    prismaMock.prenotazione.deleteMany.mockResolvedValue({});
    prismaMock.slotRicevimento.delete.mockResolvedValue({} as any);

    await expect(admin.eliminaSlot('slot-1')).resolves.not.toThrow();
  });

  it('throws on non-existent slot', async () => {
    prismaMock.slotRicevimento.findUnique.mockResolvedValue(null);
    await expect(admin.eliminaSlot('invalid')).rejects.toThrow('Slot not found');
  });
});

describe('getGiorniBloccati', () => {
  it('returns blocked days', async () => {
    prismaMock.giornoBloccato.findMany.mockResolvedValue([
      { id_giorno: 'g-1', data: new Date('2024-01-15'), motivo: 'Festivo', creato_il: new Date() },
    ]);

    const result = await admin.getGiorniBloccati();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ data: '2024-01-15', motivo: 'Festivo' });
  });
});
