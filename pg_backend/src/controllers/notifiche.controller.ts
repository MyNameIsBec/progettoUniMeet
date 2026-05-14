import { Request, Response } from 'express';
import * as notificheService from '../services/notifiche.service';

export async function getNotifiche(req: Request, res: Response) {
  try {
    const destinatarioId = req.params.destinatarioId as string;
    const ruolo = req.query.ruolo as string | undefined;
    const notifiche = await notificheService.getNotifiche(destinatarioId, ruolo);
    return res.status(200).json(notifiche);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createNotifica(req: Request, res: Response) {
  try {
    const notifica = await notificheService.createNotifica(req.body);
    return res.status(201).json(notifica);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function segnaComeLetta(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await notificheService.segnaComeLetta(id);
    return res.status(200).json({ messaggio: 'Notifica segnata come letta.' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Notifica not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function segnaTutteComeLette(req: Request, res: Response) {
  try {
    const destinatarioId = req.params.destinatarioId as string;
    await notificheService.segnaTutteComeLette(destinatarioId);
    return res.status(200).json({ messaggio: 'Tutte le notifiche segnate come lette.' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancellaNotificheLette(req: Request, res: Response) {
  try {
    const destinatarioId = req.params.destinatarioId as string;
    await notificheService.cancellaNotificheLette(destinatarioId);
    return res.status(200).json({ messaggio: 'Notifiche lette eliminate.' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
