import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';

export async function getStats(_req: Request, res: Response) {
  try {
    const stats = await adminService.getStats();
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
