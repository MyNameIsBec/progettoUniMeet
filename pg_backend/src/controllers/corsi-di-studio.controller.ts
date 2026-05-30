import { Request, Response } from 'express';
import * as corsiDiStudioService from '../services/corsi-di-studio.service';

export async function getAll(req: Request, res: Response) {
  try {
    const corsi = await corsiDiStudioService.getAll();
    return res.status(200).json(corsi);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
