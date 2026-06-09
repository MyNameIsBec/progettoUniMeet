import { Request, Response } from 'express';
import * as corsiDiStudioService from '../services/corsi-di-studio.service';

export async function getAll(_req: Request, res: Response) {
  try {
    const corsi = await corsiDiStudioService.getAll();
    return res.status(200).json(corsi.map(c => ({ id: c.id_corso_di_studi, nome: c.nome })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
