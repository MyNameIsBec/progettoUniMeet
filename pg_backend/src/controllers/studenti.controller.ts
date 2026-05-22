import { Request, Response } from 'express';
import * as studentiService from '../services/studenti.service';
import * as authService from '../services/auth.service';

export async function getProfilo(req: Request, res: Response) {
  try {
    const matricola = req.params.matricola as string;
    const profilo = await studentiService.getProfilo(matricola);
    return res.status(200).json(profilo);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Studente not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function aggiornaProfilo(req: Request, res: Response) {
  try {
    const matricola = req.params.matricola as string;
    const result = await studentiService.aggiornaProfilo(matricola, req.body);
    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Studente not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof Error && err.message === 'Corso di studi not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cambiaPasswordStudente(req: Request, res: Response) {
  try {
    const matricola = req.params.matricola as string;
    if (req.user!.id !== matricola) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { vecchiaPw, nuovaPw } = req.body;
    await authService.changePassword(matricola, 'STUDENTE', vecchiaPw, nuovaPw);
    return res.status(200).json({ messaggio: 'Password cambiata con successo.' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Wrong password') {
      return res.status(401).json({ error: err.message });
    }
    if (err instanceof Error && err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function eliminaAccount(req: Request, res: Response) {
  try {
    const matricola = req.params.matricola as string;
    if (req.user!.id !== matricola && req.user!.ruolo !== 'AMMINISTRATORE') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await studentiService.eliminaAccount(matricola);
    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Studente not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
