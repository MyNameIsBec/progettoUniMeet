import { Request, Response } from 'express';
import * as segnalazioniService from '../services/segnalazioni.service';

export async function createSegnalazione(req: Request, res: Response) {
  try {
    const allegatoPath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const segnalazione = await segnalazioniService.createSegnalazione({
      ...req.body,
      allegato: allegatoPath,
    });
    return res.status(201).json(segnalazione);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Studente not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSegnalazioniByStudente(req: Request, res: Response) {
  try {
    const matricola = req.params.matricola as string;
    const segnalazioni = await segnalazioniService.getSegnalazioniByStudente(matricola);
    return res.status(200).json(segnalazioni);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllSegnalazioni(req: Request, res: Response) {
  try {
    const stato = req.query.stato as string | undefined;
    const segnalazioni = await segnalazioniService.getAllSegnalazioni(stato);
    return res.status(200).json(segnalazioni);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function aggiornaStatoSegnalazione(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { stato, noteAdmin } = req.body;
    const result = await segnalazioniService.aggiornaStatoSegnalazione(id, stato, noteAdmin);
    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Segnalazione not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof Error && err.message === 'Stato non valido') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
export async function eliminaSegnalazione(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await segnalazioniService.eliminaSegnalazione(id);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Segnalazione not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createSegnalazioneDocente(req: Request, res: Response) {
  try {
    const allegatoPath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const segnalazione = await segnalazioniService.createSegnalazioneDocente({
      ...req.body,
      allegato: allegatoPath,
    });
    return res.status(201).json(segnalazione);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Docente not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSegnalazioniByDocente(req: Request, res: Response) {
  try {
    const idDocente = req.params.idDocente as string;
    const segnalazioni = await segnalazioniService.getSegnalazioniByDocente(idDocente);
    return res.status(200).json(segnalazioni);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
