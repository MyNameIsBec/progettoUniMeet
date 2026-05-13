import { Request, Response } from 'express';
import * as studentiService from '../services/studenti.service';

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
    return res.status(500).json({ error: 'Internal server error' });
  }
}
