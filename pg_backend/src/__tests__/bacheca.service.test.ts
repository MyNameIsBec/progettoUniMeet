import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from './setup';
import * as bacheca from '../services/bacheca.service';

beforeEach(() => vi.clearAllMocks());

const mockBacheca = {
  id_bacheca: 'b-1',
  titolo: 'Bacheca - Matematica',
  descrizione: 'Benvenuti',
  id_corso_di_studi: 'cds-1',
  id_corso: 'corso-1',
  data_ultimo_aggiornamento: new Date('2024-01-15T10:00:00Z'),
  corso_di_studi: { nome: 'Informatica' },
  corso: { nome_corso: 'Matematica' },
  faqs: [],
};

const mockFaq = {
  id_faq: 'faq-1',
  domanda: 'Come funziona?',
  risposta: 'Così.',
  data_pubblicazione: new Date('2024-01-10T10:00:00Z'),
  ultima_modifica: new Date('2024-01-10T10:00:00Z'),
  id_docente: 'doc-1',
  id_bacheca: 'b-1',
  docente: { nome: 'Anna', cognome: 'Verdi' },
};

describe('getBachecaByCorso', () => {
  it('returns existing bacheca', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(mockBacheca);

    const result = await bacheca.getBachecaByCorso('corso-1');
    expect(result).toMatchObject({
      id: 'b-1',
      titolo: 'Bacheca - Matematica',
      nomeCorso: 'Matematica',
    });
  });

  it('creates bacheca if not exists', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(null);
    prismaMock.corso.findUnique.mockResolvedValue({
      id_corso: 'corso-1',
      nome_corso: 'Matematica',
      id_corso_di_studi: 'cds-1',
      corso_di_studi: { nome: 'Informatica' },
    } as any);
    prismaMock.bacheca.create.mockResolvedValue(mockBacheca);

    const result = await bacheca.getBachecaByCorso('corso-1');
    expect(result).toMatchObject({
      id: 'b-1',
      titolo: 'Bacheca - Matematica',
    });
  });

  it('throws when corso not found', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(null);
    prismaMock.corso.findUnique.mockResolvedValue(null);

    await expect(bacheca.getBachecaByCorso('invalid')).rejects.toThrow('Corso not found');
  });
});

describe('getBachecheByCorsoDiStudi', () => {
  it('returns bacheche for a corso di studi', async () => {
    prismaMock.corsoDiStudi.findUnique.mockResolvedValue({ id_corso_di_studi: 'cds-1', nome: 'Informatica' });
    prismaMock.corso.findMany.mockResolvedValue([
      { id_corso: 'corso-1' },
      { id_corso: 'corso-2' },
    ] as any[]);

    prismaMock.bacheca.findUnique.mockResolvedValue(mockBacheca);
    prismaMock.corso.findUnique.mockResolvedValue({
      id_corso: 'corso-1',
      nome_corso: 'Matematica',
      id_corso_di_studi: 'cds-1',
      corso_di_studi: { nome: 'Informatica' },
    } as any);
    prismaMock.bacheca.create.mockResolvedValue(mockBacheca);

    const result = await bacheca.getBachecheByCorsoDiStudi('cds-1');
    expect(result).toHaveLength(2);
  });

  it('throws when cds not found', async () => {
    prismaMock.corsoDiStudi.findUnique.mockResolvedValue(null);

    await expect(bacheca.getBachecheByCorsoDiStudi('invalid')).rejects.toThrow('CorsoDiStudi not found');
  });
});

describe('getBachecheByDocente', () => {
  it('returns bacheche for a docente', async () => {
    prismaMock.corso.findMany.mockResolvedValue([
      { id_corso: 'corso-1', id_docente: 'doc-1' },
    ] as any[]);

    prismaMock.bacheca.findUnique.mockResolvedValue(mockBacheca);
    prismaMock.corso.findUnique.mockResolvedValue({
      id_corso: 'corso-1',
      nome_corso: 'Matematica',
      id_corso_di_studi: 'cds-1',
      corso_di_studi: { nome: 'Informatica' },
    } as any);
    prismaMock.bacheca.create.mockResolvedValue(mockBacheca);

    const result = await bacheca.getBachecheByDocente('doc-1');
    expect(result).toHaveLength(1);
  });

  it('returns empty when no corsi', async () => {
    prismaMock.corso.findMany.mockResolvedValue([]);
    const result = await bacheca.getBachecheByDocente('doc-1');
    expect(result).toEqual([]);
  });
});

describe('verificaDocenteCorso', () => {
  it('returns true when docente owns corso', async () => {
    prismaMock.corso.findUnique.mockResolvedValue({ id_corso: 'corso-1', id_docente: 'doc-1' } as any);
    const result = await bacheca.verificaDocenteCorso('doc-1', 'corso-1');
    expect(result).toBe(true);
  });

  it('returns false otherwise', async () => {
    prismaMock.corso.findUnique.mockResolvedValue({ id_corso: 'corso-1', id_docente: 'doc-2' } as any);
    const result = await bacheca.verificaDocenteCorso('doc-1', 'corso-1');
    expect(result).toBe(false);
  });

  it('returns false when corso not found', async () => {
    prismaMock.corso.findUnique.mockResolvedValue(null);
    const result = await bacheca.verificaDocenteCorso('doc-1', 'invalid');
    expect(result).toBe(false);
  });
});

describe('updateBacheca', () => {
  it('updates bacheca title', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(mockBacheca);
    prismaMock.bacheca.update.mockResolvedValue({ ...mockBacheca, titolo: 'Nuovo titolo' });

    const result = await bacheca.updateBacheca('corso-1', { titolo: 'Nuovo titolo' });
    expect(result).toMatchObject({ titolo: 'Nuovo titolo' });
  });

  it('throws on non-existent bacheca', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(null);
    await expect(bacheca.updateBacheca('invalid', { titolo: 'Test' })).rejects.toThrow('Bacheca not found');
  });
});

describe('getFaqByBacheca', () => {
  it('returns FAQs for a bacheca', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(mockBacheca);
    prismaMock.fAQ.findMany.mockResolvedValue([mockFaq]);

    const result = await bacheca.getFaqByBacheca('corso-1');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'faq-1',
      domanda: 'Come funziona?',
    });
  });

  it('throws on non-existent bacheca', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(null);
    await expect(bacheca.getFaqByBacheca('invalid')).rejects.toThrow('Bacheca not found');
  });
});

describe('createFaq', () => {
  it('creates a FAQ', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(mockBacheca);
    prismaMock.fAQ.create.mockResolvedValue(mockFaq);

    const result = await bacheca.createFaq('corso-1', {
      domanda: 'Come funziona?',
      risposta: 'Così.',
      idDocente: 'doc-1',
    });

    expect(result).toMatchObject({
      id: 'faq-1',
      domanda: 'Come funziona?',
      nomeDocente: 'Anna Verdi',
    });
  });

  it('throws on non-existent bacheca', async () => {
    prismaMock.bacheca.findUnique.mockResolvedValue(null);

    await expect(
      bacheca.createFaq('invalid', { domanda: 'Q?', risposta: 'A.' })
    ).rejects.toThrow('Bacheca not found');
  });
});

describe('updateFaq', () => {
  it('updates a FAQ', async () => {
    prismaMock.fAQ.findUnique.mockResolvedValue(mockFaq);
    prismaMock.fAQ.update.mockResolvedValue({ ...mockFaq, domanda: 'Aggiornata?' });

    const result = await bacheca.updateFaq('faq-1', { domanda: 'Aggiornata?' });
    expect(result).toMatchObject({ domanda: 'Aggiornata?' });
  });

  it('throws on non-existent FAQ', async () => {
    prismaMock.fAQ.findUnique.mockResolvedValue(null);
    await expect(bacheca.updateFaq('invalid', { domanda: 'Q?' })).rejects.toThrow('FAQ not found');
  });
});

describe('deleteFaq', () => {
  it('deletes a FAQ', async () => {
    prismaMock.fAQ.findUnique.mockResolvedValue(mockFaq);
    prismaMock.fAQ.delete.mockResolvedValue(mockFaq);

    await expect(bacheca.deleteFaq('faq-1')).resolves.not.toThrow();
  });

  it('throws on non-existent FAQ', async () => {
    prismaMock.fAQ.findUnique.mockResolvedValue(null);
    await expect(bacheca.deleteFaq('invalid')).rejects.toThrow('FAQ not found');
  });
});

describe('getFaqById', () => {
  it('returns FAQ info', async () => {
    prismaMock.fAQ.findUnique.mockResolvedValue({
      id_faq: 'faq-1',
      id_docente: 'doc-1',
      bacheca: { id_corso: 'corso-1' },
    } as any);

    const result = await bacheca.getFaqById('faq-1');
    expect(result).toMatchObject({
      idBacheca: 'corso-1',
      idDocente: 'doc-1',
    });
  });

  it('throws on non-existent FAQ', async () => {
    prismaMock.fAQ.findUnique.mockResolvedValue(null);
    await expect(bacheca.getFaqById('invalid')).rejects.toThrow('FAQ not found');
  });
});
