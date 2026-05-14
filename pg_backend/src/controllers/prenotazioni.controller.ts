import { Request, Response } from 'express';
import * as prenotazioniService from '../services/prenotazioni.service';

export async function createPrenotazione(req: Request, res: Response) {
  try {
    const prenotazione = await prenotazioniService.createPrenotazione(req.body);
    return res.status(201).json(prenotazione);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'Slot not found' || err.message === 'Slot non disponibile')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function annullaPrenotazione(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prenotazioniService.annullaPrenotazione(id);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Prenotazione not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPrenotazioniStudente(req: Request, res: Response) {
  try {
    const matricolaStudente = req.params.matricolaStudente as string;
    const prenotazioni = await prenotazioniService.getPrenotazioniStudente(matricolaStudente);
    return res.status(200).json(prenotazioni);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPrenotazioniDocente(req: Request, res: Response) {
  try {
    const idDocente = req.params.idDocente as string;
    const prenotazioni = await prenotazioniService.getPrenotazioniDocente(idDocente);
    return res.status(200).json(prenotazioni);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function aggiornaStatoPrenotazione(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { stato } = req.body;
    const prenotazione = await prenotazioniService.aggiornaStatoPrenotazione(id, stato);
    return res.status(200).json(prenotazione);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Prenotazione not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPrenotazioneById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const prenotazione = await prenotazioniService.getPrenotazioneById(id);
    return res.status(200).json(prenotazione);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Prenotazione non trovata') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
