import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const aggiornaStudenteSchema = [
  body('nome').optional().isString().notEmpty().trim(),
  body('cognome').optional().isString().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
];

export const cambiaPasswordStudenteSchema = [
  body('vecchiaPw').isString().notEmpty(),
  body('nuovaPw').isString().isLength({ min: 8 }),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
