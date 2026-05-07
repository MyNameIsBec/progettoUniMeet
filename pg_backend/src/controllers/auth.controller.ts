import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function registerStudente(req: Request, res: Response) {
  try {
    const studente = await authService.createStudente(req.body);
    return res.status(201).json(studente);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Email already in use') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function registerDocente(req: Request, res: Response) {
  try {
    const docente = await authService.createDocente(req.body);
    return res.status(201).json(docente);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Email already in use') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
