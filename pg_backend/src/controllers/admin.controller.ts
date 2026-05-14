import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';

export async function getStats(_req: Request, res: Response) {
  try {
    const stats = await adminService.getStats();
    return res.status(200).json(stats);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUtenti(req: Request, res: Response) {
  try {
    const ruolo = req.query.ruolo as string | undefined;
    const utenti = await adminService.getAllUsers(ruolo);
    return res.status(200).json(utenti);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function creaUtente(req: Request, res: Response) {
  try {
    const utente = await adminService.createUser(req.body);
    return res.status(201).json(utente);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Email already in use') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function modificaUtente(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const utente = await adminService.updateUser(id, req.body);
    return res.status(200).json(utente);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function eliminaUtente(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const adminId = req.user?.id;
    await adminService.deleteUser(id, adminId);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof Error && err.message === 'Cannot delete your own account') {
      return res.status(403).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function creaSlot(req: Request, res: Response) {
  try {
    const slot = await adminService.creaSlot(req.body);
    return res.status(201).json(slot);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function modificaSlot(req: Request, res: Response) {
  try {
    const idSlot = req.params.idSlot as string;
    await adminService.modificaSlot(idSlot, req.body);
    return res.status(200).json({ messaggio: 'Slot aggiornato con successo.' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Slot not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function eliminaSlot(req: Request, res: Response) {
  try {
    const idSlot = req.params.idSlot as string;
    await adminService.eliminaSlot(idSlot);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Slot not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSlotDate(_req: Request, res: Response) {
  try {
    const date = await adminService.getSlotDate();
    return res.status(200).json(date);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getGiorniBloccati(_req: Request, res: Response) {
  try {
    const giorni = await adminService.getGiorniBloccati();
    return res.status(200).json(giorni);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function bloccaGiorno(req: Request, res: Response) {
  try {
    const { data, motivo } = req.body;
    const giorno = await adminService.bloccaGiorno(data, motivo);
    return res.status(201).json(giorno);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Giorno già bloccato') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function sbloccaGiorno(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await adminService.sbloccaGiorno(id);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Giorno non trovato') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSlotGlobali(req: Request, res: Response) {
  try {
    const filtri: { docenteId?: string; data?: string; stato?: string } = {};
    const docenteId = req.query.docenteId as string | undefined;
    const data = req.query.data as string | undefined;
    const stato = req.query.stato as string | undefined;
    if (docenteId) filtri.docenteId = docenteId;
    if (data) filtri.data = data;
    if (stato) filtri.stato = stato;
    const slot = await adminService.getSlotGlobali(filtri);
    return res.status(200).json(slot);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
