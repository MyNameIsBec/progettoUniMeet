import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from './setup';
import * as auth from '../services/auth.service';

const mockStudente = {
  matricola: 'STU001',
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario@test.it',
  password: 'hashed_password123',
  id_corso_di_studi: 'cds-1',
  notifiche_app: true,
  notifiche_email: true,
  reminder_ore: 24,
  tema: 'light',
  lingua: 'it',
};

const mockDocente = {
  id_docente: 'doc-1',
  nome: 'Anna',
  cognome: 'Verdi',
  email: 'anna@test.it',
  password: 'hashed_password123',
  ufficio: 'A101',
  notifiche_app: true,
  notifiche_email: true,
  reminder_ore: 24,
  tema: 'light',
  lingua: 'it',
};

const mockAdmin = {
  id_admin: 'admin-1',
  nome: 'Admin',
  email: 'admin@test.it',
  password: 'hashed_password123',
};

const mockCorsoDiStudi = {
  id_corso_di_studi: 'cds-1',
  nome: 'Informatica',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createStudente', () => {
  it('creates a student successfully', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    prismaMock.corsoDiStudi.findUnique.mockResolvedValue(mockCorsoDiStudi);
    prismaMock.studente.create.mockResolvedValue(mockStudente);

    const result = await auth.createStudente({
      matricola: 'STU001',
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario@test.it',
      password: 'password123',
      corsoDiStudi: 'Informatica',
    });

    expect(result).toMatchObject({
      id: 'STU001',
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario@test.it',
      role: 'STUDENTE',
      token: 'mock-token',
    });
  });

  it('throws on duplicate email', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);

    await expect(
      auth.createStudente({
        matricola: 'STU001',
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario@test.it',
        password: 'password123',
        corsoDiStudi: 'Informatica',
      })
    ).rejects.toThrow('Email already in use');
  });

  it('throws when corso di studi not found', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    prismaMock.corsoDiStudi.findUnique.mockResolvedValue(null);

    await expect(
      auth.createStudente({
        matricola: 'STU001',
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario@test.it',
        password: 'password123',
        corsoDiStudi: 'Inesistente',
      })
    ).rejects.toThrow('Corso di studi non trovato');
  });
});

describe('createDocente', () => {
  it('creates a docente successfully', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(null);
    prismaMock.docente.create.mockResolvedValue(mockDocente);

    const result = await auth.createDocente({
      nome: 'Anna',
      cognome: 'Verdi',
      email: 'anna@test.it',
      password: 'password123',
      ufficio: 'A101',
    });

    expect(result).toMatchObject({
      id_docente: 'doc-1',
      nome: 'Anna',
      cognome: 'Verdi',
      email: 'anna@test.it',
      ufficio: 'A101',
    });
  });

  it('throws on duplicate email', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(mockDocente);

    await expect(
      auth.createDocente({
        nome: 'Anna',
        cognome: 'Verdi',
        email: 'anna@test.it',
        password: 'password123',
        ufficio: 'A101',
      })
    ).rejects.toThrow('Email already in use');
  });
});

describe('registerAdmin', () => {
  it('creates an admin successfully', async () => {
    prismaMock.amministratore.findUnique.mockResolvedValue(null);
    prismaMock.amministratore.create.mockResolvedValue(mockAdmin);

    const result = await auth.registerAdmin({
      nome: 'Admin',
      email: 'admin@test.it',
      password: 'password123',
    });

    expect(result).toMatchObject({
      id_admin: 'admin-1',
      nome: 'Admin',
      email: 'admin@test.it',
    });
  });

  it('throws on duplicate email', async () => {
    prismaMock.amministratore.findUnique.mockResolvedValue(mockAdmin);

    await expect(
      auth.registerAdmin({
        nome: 'Admin',
        email: 'admin@test.it',
        password: 'password123',
      })
    ).rejects.toThrow('Email already in use');
  });
});

describe('login', () => {
  it('logs in a studente', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);

    const result = await auth.login('mario@test.it', 'password123');
    expect(result).toMatchObject({
      id: 'STU001',
      role: 'STUDENTE',
      token: 'mock-token',
    });
  });

  it('logs in a docente', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    prismaMock.docente.findUnique.mockResolvedValue(mockDocente);

    const result = await auth.login('anna@test.it', 'password123');
    expect(result).toMatchObject({
      id: 'doc-1',
      role: 'DOCENTE',
      token: 'mock-token',
    });
  });

  it('logs in an admin', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    prismaMock.docente.findUnique.mockResolvedValue(null);
    prismaMock.amministratore.findUnique.mockResolvedValue(mockAdmin);

    const result = await auth.login('admin@test.it', 'password123');
    expect(result).toMatchObject({
      id: 'admin-1',
      role: 'AMMINISTRATORE',
      token: 'mock-token',
    });
  });

  it('throws on wrong password', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);

    await expect(auth.login('mario@test.it', 'wrongpassword')).rejects.toThrow(
      'Invalid email or password'
    );
  });

  it('throws on non-existent user', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    prismaMock.docente.findUnique.mockResolvedValue(null);
    prismaMock.amministratore.findUnique.mockResolvedValue(null);

    await expect(auth.login('nobody@test.it', 'password123')).rejects.toThrow(
      'Invalid email or password'
    );
  });
});

describe('getProfile', () => {
  it('gets student profile', async () => {
    const mockStudenteWithCds = { ...mockStudente, corso_di_studi: { nome: 'Informatica' } };
    prismaMock.studente.findUnique.mockResolvedValue(mockStudenteWithCds);

    const result = await auth.getProfile('STU001', 'STUDENTE');
    expect(result).toMatchObject({
      id: 'STU001',
      nome: 'Mario',
      cognome: 'Rossi',
      role: 'STUDENTE',
      corsoDiStudi: 'Informatica',
    });
  });

  it('gets docente profile', async () => {
    prismaMock.docente.findUnique.mockResolvedValue(mockDocente);

    const result = await auth.getProfile('doc-1', 'DOCENTE');
    expect(result).toMatchObject({
      id: 'doc-1',
      nome: 'Anna',
      cognome: 'Verdi',
      role: 'DOCENTE',
      ufficio: 'A101',
    });
  });

  it('gets admin profile', async () => {
    prismaMock.amministratore.findUnique.mockResolvedValue(mockAdmin);

    const result = await auth.getProfile('admin-1', 'AMMINISTRATORE');
    expect(result).toMatchObject({
      id: 'admin-1',
      nome: 'Admin',
      role: 'AMMINISTRATORE',
    });
  });

  it('throws for non-existent student', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    await expect(auth.getProfile('INVALID', 'STUDENTE')).rejects.toThrow('User not found');
  });
});

describe('refreshToken', () => {
  it('refreshes token successfully', async () => {
    const result = await auth.refreshToken('valid-refresh-token');
    expect(result).toEqual({ token: 'mock-token' });
  });

  it('throws on invalid refresh token', async () => {
    await expect(auth.refreshToken('invalid-token')).rejects.toThrow('Invalid or expired refresh token');
  });
});

describe('changePassword', () => {
  it('changes student password', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);
    prismaMock.studente.update.mockResolvedValue(mockStudente);

    await expect(auth.changePassword('STU001', 'STUDENTE', 'password123', 'newpass123')).resolves.not.toThrow();
    expect(prismaMock.studente.update).toHaveBeenCalled();
  });

  it('throws on wrong old password', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);

    await expect(auth.changePassword('STU001', 'STUDENTE', 'wrongpass', 'newpass123')).rejects.toThrow('Wrong password');
  });

  it('throws on non-existent user', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);

    await expect(auth.changePassword('INVALID', 'STUDENTE', 'pass', 'newpass')).rejects.toThrow('User not found');
  });
});

describe('forgotPassword', () => {
  it('sends verification code for student', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);
    prismaMock.codiceVerifica.findMany.mockResolvedValue([]);
    prismaMock.codiceVerifica.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.codiceVerifica.create.mockResolvedValue({ id: 'code-1' });

    const result = await auth.forgotPassword('mario@test.it');
    expect(result.messaggio).toContain('riceverai un codice');
  });

  it('throws on non-existent email', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    prismaMock.docente.findUnique.mockResolvedValue(null);
    prismaMock.amministratore.findUnique.mockResolvedValue(null);

    await expect(auth.forgotPassword('nobody@test.it')).rejects.toThrow('User not found');
  });
});

describe('verificaCodice', () => {
  it('verifies a valid code', async () => {
    prismaMock.codiceVerifica.findMany.mockResolvedValue([
      { codice: 'hashed_123456' },
    ]);

    const result = await auth.verificaCodice('mario@test.it', '123456');
    expect(result).toEqual({ valido: true });
  });

  it('throws on invalid code', async () => {
    prismaMock.codiceVerifica.findMany.mockResolvedValue([]);

    await expect(auth.verificaCodice('mario@test.it', '000000')).rejects.toThrow('Codice non valido o scaduto');
  });
});

describe('resetPassword', () => {
  it('resets password successfully', async () => {
    prismaMock.codiceVerifica.findMany.mockResolvedValue([
      { id: 'code-1', codice: 'hashed_123456' },
    ]);
    prismaMock.codiceVerifica.update.mockResolvedValue({});
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);
    prismaMock.studente.update.mockResolvedValue(mockStudente);

    const result = await auth.resetPassword('mario@test.it', '123456', 'newpass');
    expect(result.messaggio).toContain('successo');
  });

  it('throws on invalid code', async () => {
    prismaMock.codiceVerifica.findMany.mockResolvedValue([]);

    await expect(auth.resetPassword('mario@test.it', '000000', 'newpass')).rejects.toThrow('Codice non valido o scaduto');
  });
});
