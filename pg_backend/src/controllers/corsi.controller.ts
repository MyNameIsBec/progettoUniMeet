import { Request, Response } from 'express';
import * as corsiService from '../services/corsi.service';

export async function getCorsi(req: Request, res: Response) {
  try {
    const docenteId = req.query.docenteId as string | undefined;
    const corsoDiStudiId = req.query.corsoDiStudiId as string | undefined;
    const corsi = await corsiService.getCorsi(docenteId, corsoDiStudiId);
    return res.status(200).json(corsi);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCorsoById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const corso = await corsiService.getCorsoById(id);
    return res.status(200).json(corso);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Corso not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createCorso(req: Request, res: Response) {
  try {
    const corso = await corsiService.createCorso(req.body);
    return res.status(201).json(corso);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCorso(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const corso = await corsiService.updateCorso(id, req.body);
    return res.status(200).json(corso);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Corso not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCorso(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await corsiService.deleteCorso(id);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Corso not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
