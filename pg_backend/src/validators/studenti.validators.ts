import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const aggiornaStudenteSchema = [
  body('nome').optional().isString().notEmpty().trim(),
  body('cognome').optional().isString().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('corsoDiStudi').optional().isString().notEmpty().trim(),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
