import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prismaMock } from './setup';
import * as studenti from '../services/studenti.service';

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
  corso_di_studi: { id_corso_di_studi: 'cds-1', nome: 'Informatica' },
};

beforeEach(() => vi.clearAllMocks());

describe('getProfilo', () => {
  it('returns student profile', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);

    const result = await studenti.getProfilo('STU001');
    expect(result).toMatchObject({
      matricola: 'STU001',
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario@test.it',
      corsoDiStudi: 'Informatica',
      notificheApp: true,
    });
  });

  it('throws for non-existent student', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    await expect(studenti.getProfilo('INVALID')).rejects.toThrow('Studente not found');
  });
});

describe('aggiornaProfilo', () => {
  it('updates student profile', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);
    prismaMock.studente.update.mockResolvedValue(mockStudente);

    const result = await studenti.aggiornaProfilo('STU001', { nome: 'Mario2' });
    expect(result).toEqual({ messaggio: 'Profilo aggiornato con successo.' });
  });

  it('throws for non-existent student', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    await expect(studenti.aggiornaProfilo('INVALID', { nome: 'Test' })).rejects.toThrow('Studente not found');
  });
});

describe('eliminaAccount', () => {
  it('deletes student account', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(mockStudente);
    prismaMock.prenotazione.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.studente.delete.mockResolvedValue(mockStudente);

    const result = await studenti.eliminaAccount('STU001');
    expect(result).toEqual({ messaggio: 'Account eliminato con successo.' });
  });

  it('throws for non-existent student', async () => {
    prismaMock.studente.findUnique.mockResolvedValue(null);
    await expect(studenti.eliminaAccount('INVALID')).rejects.toThrow('Studente not found');
  });
});
