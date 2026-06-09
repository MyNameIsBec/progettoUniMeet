import { Request, Response } from 'express';
import * as prenotazioniService from '../services/prenotazioni.service';
import * as adminService from '../services/admin.service';

export async function createPrenotazione(req: Request, res: Response) {
  try {
    req.body.matricolaStudente = req.user!.id;
    const files = req.files as Express.Multer.File[] | undefined;
    const prenotazione = await prenotazioniService.createPrenotazione(req.body, files);
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
    const prenotazione = await prenotazioniService.getPrenotazioneById(id);
    const isOwner = prenotazione.studenteId === req.user!.id;
    const isAdmin = req.user!.ruolo === 'AMMINISTRATORE';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await prenotazioniService.annullaPrenotazione(id);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Prenotazione not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function eliminaPrenotazione(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const prenotazione = await prenotazioniService.getPrenotazioneById(id);
    const isOwner = prenotazione.studenteId === req.user!.id;
    const isAdmin = req.user!.ruolo === 'AMMINISTRATORE';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await prenotazioniService.eliminaPrenotazione(id);
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
    if (req.user!.id !== matricolaStudente && req.user!.ruolo !== 'AMMINISTRATORE') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const prenotazioni = await prenotazioniService.getPrenotazioniStudente(matricolaStudente);
    return res.status(200).json(prenotazioni);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPrenotazioniDocente(req: Request, res: Response) {
  try {
    const idDocente = req.params.idDocente as string;
    if (req.user!.id !== idDocente && req.user!.ruolo !== 'AMMINISTRATORE') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const prenotazioni = await prenotazioniService.getPrenotazioniDocente(idDocente);
    return res.status(200).json(prenotazioni);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function aggiornaStatoPrenotazione(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { stato } = req.body;
    if (req.user!.ruolo !== 'AMMINISTRATORE' && req.user!.ruolo !== 'DOCENTE') {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user!.ruolo === 'DOCENTE') {
      const docenteId = await prenotazioniService.getPrenotazioneDocenteId(id);
      if (docenteId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied: non sei il docente di questa prenotazione' });
      }
    }
    const result = await prenotazioniService.aggiornaStatoPrenotazione(id, stato);
    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Prenotazione not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function uploadDocumentiPrenotazione(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    if (req.user!.ruolo !== 'AMMINISTRATORE' && req.user!.ruolo !== 'DOCENTE') {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user!.ruolo === 'DOCENTE') {
      const docenteId = await prenotazioniService.getPrenotazioneDocenteId(id);
      if (docenteId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied: non sei il docente di questa prenotazione' });
      }
    }
    const result = await prenotazioniService.aggiungiDocumenti(id, files);
    return res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Prenotazione not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getGiorniBloccati(_req: Request, res: Response) {
  try {
    const giorni = await adminService.getGiorniBloccati();
    return res.status(200).json(giorni);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPrenotazioneById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const prenotazione = await prenotazioniService.getPrenotazioneById(id);
    const isStudente = prenotazione.studenteId === req.user!.id;
    const isAdmin = req.user!.ruolo === 'AMMINISTRATORE';
    if (isStudente || isAdmin) {
      return res.status(200).json(prenotazione);
    }
    if (req.user!.ruolo === 'DOCENTE') {
      const docenteId = await prenotazioniService.getPrenotazioneDocenteId(id);
      if (docenteId === req.user!.id) {
        return res.status(200).json(prenotazione);
      }
    }
    return res.status(403).json({ error: 'Access denied' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Prenotazione not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
