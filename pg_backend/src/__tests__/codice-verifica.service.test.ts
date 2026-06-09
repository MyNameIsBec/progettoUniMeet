import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from './setup';
import * as cv from '../services/codice-verifica.service';

beforeEach(() => vi.clearAllMocks());

describe('generaCodice', () => {
  it('generates a 6-digit code', () => {
    const code = cv.generaCodice();
    expect(code).toBe('123456');
  });
});

describe('creaCodice', () => {
  it('creates a verification code', async () => {
    const mockTx = {
      codiceVerifica: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({ id: 'code-1' }),
      },
    };
    (prismaMock.$transaction as any).mockImplementation(async (fn: any) => fn(mockTx));

    const code = await cv.creaCodice('test@test.it', 'reset_password');
    expect(code).toBe('123456');
    expect(mockTx.codiceVerifica.create).toHaveBeenCalled();
  });
});

describe('verificaCodice', () => {
  it('returns true for valid code', async () => {
    prismaMock.codiceVerifica.findMany.mockResolvedValue([
      { id: 'code-1', codice: 'hashed_123456' },
    ]);

    const result = await cv.verificaCodice('test@test.it', '123456', 'reset_password');
    expect(result).toBe(true);
  });

  it('returns false for invalid code', async () => {
    prismaMock.codiceVerifica.findMany.mockResolvedValue([]);

    const result = await cv.verificaCodice('test@test.it', '000000', 'reset_password');
    expect(result).toBe(false);
  });
});

describe('consumaCodice', () => {
  it('consumes a valid code', async () => {
    prismaMock.codiceVerifica.findMany.mockResolvedValue([
      { id: 'code-1', codice: 'hashed_123456' },
    ]);
    prismaMock.codiceVerifica.update.mockResolvedValue({});

    const result = await cv.consumaCodice('test@test.it', '123456', 'reset_password');
    expect(result).toBe(true);
    expect(prismaMock.codiceVerifica.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'code-1' },
        data: { usato: true },
      })
    );
  });

  it('returns false for invalid code', async () => {
    prismaMock.codiceVerifica.findMany.mockResolvedValue([]);

    const result = await cv.consumaCodice('test@test.it', '000000', 'reset_password');
    expect(result).toBe(false);
  });
});
