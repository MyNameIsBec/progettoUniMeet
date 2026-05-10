import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const creaUtenteSchema = [
  body('ruolo').isIn(['studente', 'docente', 'amministratore']).withMessage('Ruolo non valido'),
  body('nome').isString().notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('cognome').if(body('ruolo').isIn(['studente', 'docente'])).isString().notEmpty().trim(),
  body('matricola').if(body('ruolo').equals('studente')).isString().notEmpty().trim(),
  body('corsoDiStudi').if(body('ruolo').equals('studente')).isString().notEmpty().trim(),
  body('ufficio').if(body('ruolo').equals('docente')).isString().notEmpty().trim(),
];

export const modificaUtenteSchema = [
  body('nome').optional().isString().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isString().isLength({ min: 8 }),
  body('cognome').optional().isString().notEmpty().trim(),
  body('matricola').optional().isString().notEmpty().trim(),
  body('corsoDiStudi').optional().isString().notEmpty().trim(),
  body('ufficio').optional().isString().notEmpty().trim(),
];

export const slotFiltriSchema = [
  query('docenteId').optional().isString().notEmpty(),
  query('data').optional().isString().notEmpty(),
  query('stato').optional().isIn(['libero', 'occupato', 'tutti']),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
