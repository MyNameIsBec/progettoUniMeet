import { Request, Response } from 'express';
import * as bachecaService from '../services/bacheca.service';

export async function getBachecaByCorso(req: Request, res: Response) {
  try {
    const idCorso = req.params.idCorso as string;
    const bacheca = await bachecaService.getBachecaByCorso(idCorso);
    return res.status(200).json(bacheca);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Corso not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBachecaByCorsoDiStudi(req: Request, res: Response) {
  try {
    const idCorsoDiStudi = req.params.idCorsoDiStudi as string;
    const bacheche = await bachecaService.getBachecheByCorsoDiStudi(idCorsoDiStudi);
    return res.status(200).json(bacheche);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'CorsoDiStudi not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBachecheDocente(req: Request, res: Response) {
  try {
    const idDocente = req.user!.id;
    const bacheche = await bachecaService.getBachecheByDocente(idDocente);
    return res.status(200).json(bacheche);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateBacheca(req: Request, res: Response) {
  try {
    const idCorso = req.params.idCorso as string;

    if (req.user!.ruolo === 'DOCENTE') {
      const autorizzato = await bachecaService.verificaDocenteCorso(req.user!.id, idCorso);
      if (!autorizzato) {
        return res.status(403).json({ error: 'Access denied: non sei il docente di questo corso' });
      }
    }

    const bacheca = await bachecaService.updateBacheca(idCorso, req.body);
    return res.status(200).json(bacheca);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Bacheca not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getFaqByBacheca(req: Request, res: Response) {
  try {
    const idCorso = req.params.idCorso as string;
    const faqs = await bachecaService.getFaqByBacheca(idCorso);
    return res.status(200).json(faqs);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Bacheca not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createFaq(req: Request, res: Response) {
  try {
    const idCorso = req.params.idCorso as string;

    if (req.user!.ruolo === 'DOCENTE') {
      const autorizzato = await bachecaService.verificaDocenteCorso(req.user!.id, idCorso);
      if (!autorizzato) {
        return res.status(403).json({ error: 'Access denied: non sei il docente di questo corso' });
      }
    }

    const faq = await bachecaService.createFaq(idCorso, { ...req.body, idDocente: req.user!.id });
    return res.status(201).json(faq);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Bacheca not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateFaq(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    if (req.user!.ruolo === 'DOCENTE') {
      const faqInfo = await bachecaService.getFaqById(id);
      if (faqInfo.idDocente !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied: non sei il docente di questa FAQ' });
      }
    }

    const faq = await bachecaService.updateFaq(id, req.body);
    return res.status(200).json(faq);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FAQ not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteFaq(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    if (req.user!.ruolo === 'DOCENTE') {
      const faqInfo = await bachecaService.getFaqById(id);
      if (faqInfo.idDocente !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied: non sei il docente di questa FAQ' });
      }
    }

    await bachecaService.deleteFaq(id);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FAQ not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
