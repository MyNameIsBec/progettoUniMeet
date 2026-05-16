import { Request, Response } from 'express';
import * as bachecaService from '../services/bacheca.service';

export async function getBachecaByCorsoDiStudi(req: Request, res: Response) {
  try {
    const idCorsoDiStudi = req.params.idCorsoDiStudi as string;
    const bacheca = await bachecaService.getBachecaByCorsoDiStudi(idCorsoDiStudi);
    return res.status(200).json(bacheca);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'CorsoDiStudi not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateBacheca(req: Request, res: Response) {
  try {
    const idCorsoDiStudi = req.params.idCorsoDiStudi as string;
    const bacheca = await bachecaService.updateBacheca(idCorsoDiStudi, req.body);
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
    const idCorsoDiStudi = req.params.idCorsoDiStudi as string;
    const faqs = await bachecaService.getFaqByBacheca(idCorsoDiStudi);
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
    const idCorsoDiStudi = req.params.idCorsoDiStudi as string;
    const faq = await bachecaService.createFaq(idCorsoDiStudi, req.body);
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
    await bachecaService.deleteFaq(id);
    return res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FAQ not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
