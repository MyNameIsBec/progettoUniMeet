import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const aggiornaStudenteSchema = [
  body('nome').optional().isString().notEmpty().trim(),
  body('cognome').optional().isString().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('notificheApp').optional().isBoolean(),
  body('notificheEmail').optional().isBoolean(),
  body('reminderOre').optional().isInt({ min: 1, max: 168 }),
  body('tema').optional().isString().isIn(['light', 'dark', 'system']),
  body('lingua').optional().isString().isIn(['it', 'en']),
];

export const cambiaPasswordStudenteSchema = [
  body('vecchiaPw').isString().notEmpty(),
  body('nuovaPw').isString().isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
