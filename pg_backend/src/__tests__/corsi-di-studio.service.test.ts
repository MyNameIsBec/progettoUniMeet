import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from './setup';
import * as corsiDiStudio from '../services/corsi-di-studio.service';

beforeEach(() => vi.clearAllMocks());

describe('getAll', () => {
  it('returns all corsi di studio', async () => {
    const mockData = [
      { id_corso_di_studi: 'cds-1', nome: 'Informatica' },
      { id_corso_di_studi: 'cds-2', nome: 'Matematica' },
    ];
    prismaMock.corsoDiStudi.findMany.mockResolvedValue(mockData);

    const result = await corsiDiStudio.getAll();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id_corso_di_studi: 'cds-1', nome: 'Informatica' });
  });

  it('returns empty array', async () => {
    prismaMock.corsoDiStudi.findMany.mockResolvedValue([]);

    const result = await corsiDiStudio.getAll();
    expect(result).toEqual([]);
  });
});
