import { Request, Response } from 'express';
import * as docentiService from '../services/docenti.service';

export async function getElencoDocenti(req: Request, res: Response) {
  try {
    const { corso, search } = req.query;
    const docenti = await docentiService.getElencoDocenti({ 
      corso: corso as string, 
      search: search as string 
    });
    return res.status(200).json(docenti);
  } catch (err) {
    console.error('Error fetching docenti:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDettagliDocente(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const docente = await docentiService.getDettagliDocente(id);
    return res.status(200).json(docente);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Docente not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSlots(req: Request, res: Response) {
  try {
    const idDocente = req.params.idDocente as string;
    const mese = req.query.mese as string | undefined;
    const slots = await docentiService.getSlots(idDocente, mese);
    return res.status(200).json(slots);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function creaSlot(req: Request, res: Response) {
  try {
    const idDocente = req.params.idDocente as string;
    const slot = await docentiService.creaSlot(idDocente, req.body);
    return res.status(201).json(slot);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export async function modificaSlot(req: Request, res: Response) {
  try {
    const idDocente = req.params.idDocente as string;
    const idSlot = req.params.idSlot as string;
    const result = await docentiService.modificaSlot(idDocente, idSlot, req.body);
    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Slot not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function eliminaSlot(req: Request, res: Response) {
  try {
    const idDocente = req.params.idDocente as string;
    const idSlot = req.params.idSlot as string;
    await docentiService.eliminaSlot(idDocente, idSlot);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Slot not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStatistiche(req: Request, res: Response) {
  try {
    const idDocente = req.params.idDocente as string;
    const stats = await docentiService.getStatistiche(idDocente);
    return res.status(200).json(stats);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
