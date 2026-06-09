import { vi } from 'vitest';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn((s: string) => Promise.resolve(`hashed_${s}`)),
    compare: vi.fn((s: string, hash: string) => Promise.resolve(hash === `hashed_${s}`)),
  },
  hash: vi.fn((s: string) => Promise.resolve(`hashed_${s}`)),
  compare: vi.fn((s: string, hash: string) => Promise.resolve(hash === `hashed_${s}`)),
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-token'),
    verify: vi.fn((token: string) => {
      if (token === 'valid-refresh-token') {
        return { id: 'mock-id', email: 'test@test.it', ruolo: 'STUDENTE' };
      }
      throw new Error('Invalid token');
    }),
  },
  sign: vi.fn(() => 'mock-token'),
  verify: vi.fn((token: string) => {
    if (token === 'valid-refresh-token') {
      return { id: 'mock-id', email: 'test@test.it', ruolo: 'STUDENTE' };
    }
    throw new Error('Invalid token');
  }),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      verify: vi.fn().mockResolvedValue(true),
      sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-id' }),
    })),
  },
  createTransport: vi.fn(() => ({
    verify: vi.fn().mockResolvedValue(true),
    sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-id' }),
  })),
}));

vi.mock('node-cron', () => ({
  schedule: vi.fn(),
}));

vi.mock('crypto', () => ({
  default: {
    randomInt: vi.fn(() => 123456),
  },
  randomInt: vi.fn(() => 123456),
}));

const modelNames = [
  'studente', 'docente', 'amministratore', 'corsoDiStudi',
  'corso', 'docenteCorsoDiStudi', 'bacheca', 'fAQ',
  'slotRicevimento', 'luogoRicevimento', 'prenotazione',
  'documento', 'notifica', 'giornoBloccato', 'codiceVerifica', 'segnalazione',
];

const txMethods = [
  'findUnique', 'findMany', 'findFirst', 'create', 'update',
  'delete', 'count', 'deleteMany', 'updateMany', 'createMany',
  'upsert', 'groupBy',
];

function createPrismaMock() {
  const models: Record<string, any> = {};
  for (const name of modelNames) {
    const methods: Record<string, any> = {};
    for (const fn of txMethods) {
      methods[fn] = vi.fn();
    }
    models[name] = methods;
  }

  const tx: Record<string, any> = {};
  for (const fn of txMethods) {
    tx[fn] = vi.fn();
  }

  for (const name of modelNames) {
    tx[name] = {};
    for (const fn of txMethods) {
      tx[name][fn] = vi.fn();
    }
  }

  const $transaction = vi.fn(async (fn: any) => {
    if (typeof fn === 'function') {
      return fn(tx);
    }
    return fn;
  });

  return {
    ...models,
    $transaction,
    $disconnect: vi.fn(),
  };
}

export const prismaMock = createPrismaMock();

vi.mock('../prisma/client', () => ({
  prisma: prismaMock,
}));

process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test-db';
