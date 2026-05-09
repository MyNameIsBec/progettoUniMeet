import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        ruolo: 'STUDENTE' | 'DOCENTE' | 'AMMINISTRATORE';
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      ruolo: 'STUDENTE' | 'DOCENTE' | 'AMMINISTRATORE';
    };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
