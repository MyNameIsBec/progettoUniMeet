import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from './setup';
import * as corsi from '../services/corsi.service';

beforeEach(() => vi.clearAllMocks());

const mockCorso = {
  id_corso: 'corso-1',
  nome_corso: 'Matematica',
  anno: 1,
  cfu: 12,
  id_docente: 'doc-1',
  id_corso_di_studi: 'cds-1',
  docente: {
    id_docente: 'doc-1',
    nome: 'Anna',
    cognome: 'Verdi',
    email: 'anna@test.it',
  },
  corso_di_studi: { nome: 'Informatica' },
};

describe('getCorsi', () => {
  it('returns all corsi', async () => {
    prismaMock.corso.findMany.mockResolvedValue([mockCorso]);

    const result = await corsi.getCorsi();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'corso-1',
      nomeCorso: 'Matematica',
      anno: 1,
      cfu: 12,
      docente: { id: 'doc-1', nome: 'Anna' },
    });
  });

  it('filters by docenteId', async () => {
    prismaMock.corso.findMany.mockResolvedValue([]);

    await corsi.getCorsi('doc-1');
    expect(prismaMock.corso.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_docente: 'doc-1' },
      })
    );
  });

  it('filters by corsoDiStudiId', async () => {
    prismaMock.corso.findMany.mockResolvedValue([]);

    await corsi.getCorsi(undefined, 'cds-1');
    expect(prismaMock.corso.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_corso_di_studi: 'cds-1' },
      })
    );
  });
});

describe('getCorsoById', () => {
  it('returns a corso by id', async () => {
    prismaMock.corso.findUnique.mockResolvedValue(mockCorso);

    const result = await corsi.getCorsoById('corso-1');
    expect(result).toMatchObject({
      id: 'corso-1',
      nomeCorso: 'Matematica',
    });
  });

  it('throws on non-existent corso', async () => {
    prismaMock.corso.findUnique.mockResolvedValue(null);
    await expect(corsi.getCorsoById('invalid')).rejects.toThrow('Corso not found');
  });
});

describe('createCorso', () => {
  it('creates a corso', async () => {
    prismaMock.corso.create.mockResolvedValue(mockCorso);

    const result = await corsi.createCorso({
      nomeCorso: 'Matematica',
      anno: 1,
      cfu: 12,
      idDocente: 'doc-1',
    });

    expect(result).toMatchObject({
      id: 'corso-1',
      nomeCorso: 'Matematica',
    });
  });
});

describe('updateCorso', () => {
  it('updates a corso', async () => {
    prismaMock.corso.findUnique.mockResolvedValue(mockCorso);
    prismaMock.corso.update.mockResolvedValue({ ...mockCorso, nome_corso: 'Fisica' });

    const result = await corsi.updateCorso('corso-1', { nomeCorso: 'Fisica' });
    expect(result).toMatchObject({ nomeCorso: 'Fisica' });
  });

  it('throws on non-existent corso', async () => {
    prismaMock.corso.findUnique.mockResolvedValue(null);
    await expect(corsi.updateCorso('invalid', { nomeCorso: 'Test' })).rejects.toThrow('Corso not found');
  });
});

describe('deleteCorso', () => {
  it('deletes a corso', async () => {
    prismaMock.corso.findUnique.mockResolvedValue(mockCorso);
    prismaMock.corso.delete.mockResolvedValue(mockCorso);

    await expect(corsi.deleteCorso('corso-1')).resolves.not.toThrow();
  });

  it('throws on non-existent corso', async () => {
    prismaMock.corso.findUnique.mockResolvedValue(null);
    await expect(corsi.deleteCorso('invalid')).rejects.toThrow('Corso not found');
  });
});
