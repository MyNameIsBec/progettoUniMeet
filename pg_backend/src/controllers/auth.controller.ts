import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid email or password') {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function registerStudente(req: Request, res: Response) {
  try {
    await authService.createStudente(req.body);
    return res.status(201).json({ messaggio: 'Registrazione completata con successo.' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Email already in use') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function registerDocente(req: Request, res: Response) {
  try {
    await authService.createDocente(req.body);
    return res.status(201).json({ messaggio: 'Registrazione completata con successo.' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Email already in use') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function registerAdmin(req: Request, res: Response) {
  try {
    await authService.registerAdmin(req.body);
    return res.status(201).json({ messaggio: 'Amministratore registrato con successo.' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Email already in use') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const { id, ruolo } = req.user!;
    const profile = await authService.getProfile(id, ruolo);
    return res.status(200).json(profile);
  } catch (err) {
    if (err instanceof Error && err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });
    const result = await authService.refreshToken(token);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid or expired refresh token') {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { id, ruolo } = req.user!;
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(id, ruolo, oldPassword, newPassword);
    return res.status(200).json({ messaggio: 'Password cambiata con successo.' });
  } catch (err) {
    if (err instanceof Error && err.message === 'Wrong password') {
      return res.status(401).json({ error: err.message });
    }
    if (err instanceof Error && err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, nuovaPassword } = req.body;
    const result = await authService.resetPassword(token, nuovaPassword);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid or expired reset token') {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
