import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from './setup';
import * as segnalazioni from '../services/segnalazioni.service';

beforeEach(() => vi.clearAllMocks());

const mockStudente = {
  matricola: 'STU001',
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario@test.it',
};

const mockDocente = {
  id_docente: 'doc-1',
  nome: 'Anna',
  cognome: 'Verdi',
  email: 'anna@test.it',
};

const mockSegnalazione = {
  id_segnalazione: 'seg-1',
  oggetto: 'Problema tecnico',
  descrizione: 'Non funziona',
  data_invio: new Date('2024-01-15T10:00:00Z'),
  stato: 'APERTA',
  matricola_studente: 'STU001',
  id_docente: null,
  allegato: null,
  note_admin: null,
};

describe('createSegnalazione', () => {
  it('creates a segnalazione by studente', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente as any);
    prismaMock.segnalazione.create.mockResolvedValue(mockSegnalazione);
    prismaMock.amministratore.findMany.mockResolvedValue([]);

    const result = await segnalazioni.createSegnalazione({
      oggetto: 'Problema tecnico',
      descrizione: 'Non funziona',
      matricola_studente: 'STU001',
    });

    expect(result).toMatchObject({
      id_segnalazione: 'seg-1',
      oggetto: 'Problema tecnico',
      stato: 'APERTA',
    });
  });

  it('throws when studente not found', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);

    await expect(
      segnalazioni.createSegnalazione({
        oggetto: 'Test',
        descrizione: 'Test',
        matricola_studente: 'INVALID',
      })
    ).rejects.toThrow('Studente not found');
  });
});

describe('getSegnalazioniByStudente', () => {
  it('returns segnalazioni for a student', async () => {
    prismaMock.segnalazione.findMany.mockResolvedValue([mockSegnalazione]);

    const result = await segnalazioni.getSegnalazioniByStudente('STU001');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id_segnalazione: 'seg-1',
      stato: 'APERTA',
    });
  });

  it('returns empty array', async () => {
    prismaMock.segnalazione.findMany.mockResolvedValue([]);
    const result = await segnalazioni.getSegnalazioniByStudente('STU001');
    expect(result).toEqual([]);
  });
});

describe('getAllSegnalazioni', () => {
  it('returns all segnalazioni', async () => {
    const mockFull = {
      ...mockSegnalazione,
      studente: { nome: 'Mario', cognome: 'Rossi', email: 'mario@test.it' },
      docente: null,
    };

    prismaMock.segnalazione.findMany.mockResolvedValue([mockFull]);

    const result = await segnalazioni.getAllSegnalazioni();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id_segnalazione: 'seg-1',
      studente: { nome: 'Mario' },
    });
  });

  it('filters by stato', async () => {
    prismaMock.segnalazione.findMany.mockResolvedValue([]);

    await segnalazioni.getAllSegnalazioni('APERTA');
    expect(prismaMock.segnalazione.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stato: 'APERTA' },
      })
    );
  });
});

describe('aggiornaStatoSegnalazione', () => {
  it('updates segnalazione stato', async () => {
    prismaMock.segnalazione.findUnique.mockResolvedValue(mockSegnalazione);
    prismaMock.segnalazione.update.mockResolvedValue({
      ...mockSegnalazione,
      stato: 'IN_LAVORAZIONE',
      studente: { nome: 'Mario', cognome: 'Rossi', email: 'mario@test.it' },
      docente: null,
    });
    prismaMock.notifica.create.mockResolvedValue({});

    const result = await segnalazioni.aggiornaStatoSegnalazione('seg-1', 'IN_LAVORAZIONE');
    expect(result).toMatchObject({
      id_segnalazione: 'seg-1',
      stato: 'IN_LAVORAZIONE',
    });
  });

  it('throws on invalid stato', async () => {
    await expect(
      segnalazioni.aggiornaStatoSegnalazione('seg-1', 'INVALIDO')
    ).rejects.toThrow('Stato non valido');
  });

  it('throws on non-existent segnalazione', async () => {
    prismaMock.segnalazione.findUnique.mockResolvedValue(null);

    await expect(
      segnalazioni.aggiornaStatoSegnalazione('invalid', 'CHIUSA')
    ).rejects.toThrow('Segnalazione not found');
  });
});

describe('getSegnalazioneById', () => {
  it('returns segnalazione by id', async () => {
    prismaMock.segnalazione.findUnique.mockResolvedValue(mockSegnalazione);

    const result = await segnalazioni.getSegnalazioneById('seg-1');
    expect(result).toMatchObject({
      id_segnalazione: 'seg-1',
    });
  });

  it('returns null for non-existent', async () => {
    prismaMock.segnalazione.findUnique.mockResolvedValue(null);
    const result = await segnalazioni.getSegnalazioneById('invalid');
    expect(result).toBeNull();
  });
});

describe('eliminaSegnalazione', () => {
  it('deletes a segnalazione', async () => {
    prismaMock.segnalazione.findUnique.mockResolvedValue(mockSegnalazione);
    prismaMock.segnalazione.delete.mockResolvedValue(mockSegnalazione);

    await expect(segnalazioni.eliminaSegnalazione('seg-1')).resolves.not.toThrow();
  });

  it('throws on non-existent', async () => {
    prismaMock.segnalazione.findUnique.mockResolvedValue(null);
    await expect(segnalazioni.eliminaSegnalazione('invalid')).rejects.toThrow('Segnalazione not found');
  });
});

describe('createSegnalazioneDocente', () => {
  it('creates a segnalazione by docente', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(mockDocente as any);
    prismaMock.segnalazione.create.mockResolvedValue({
      ...mockSegnalazione,
      matricola_studente: null,
      id_docente: 'doc-1',
    } as any);
    prismaMock.amministratore.findMany.mockResolvedValue([]);

    const result = await segnalazioni.createSegnalazioneDocente({
      oggetto: 'Problema',
      descrizione: 'Descrizione',
      id_docente: 'doc-1',
    });

    expect(result).toMatchObject({
      oggetto: 'Problema tecnico',
      id_docente: 'doc-1',
    });
  });

  it('throws when docente not found', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(null);

    await expect(
      segnalazioni.createSegnalazioneDocente({
        oggetto: 'Test',
        descrizione: 'Test',
        id_docente: 'invalid',
      })
    ).rejects.toThrow('Docente not found');
  });
});

describe('getSegnalazioniByDocente', () => {
  it('returns segnalazioni for a docente', async () => {
    const mockSegnDoc = { ...mockSegnalazione, matricola_studente: null, id_docente: 'doc-1' };
    prismaMock.segnalazione.findMany.mockResolvedValue([mockSegnDoc]);

    const result = await segnalazioni.getSegnalazioniByDocente('doc-1');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id_docente: 'doc-1',
    });
  });
});
