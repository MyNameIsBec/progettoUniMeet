import { Request, Response, NextFunction } from 'express';

export function authorize(...ruoli: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Token required' });
    }
    if (!ruoli.includes(req.user.ruolo)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}
