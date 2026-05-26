import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const aggiornaBachecaSchema = [
  body('titolo').optional().isString().notEmpty().withMessage('Titolo non valido'),
  body('descrizione').optional().isString().notEmpty().withMessage('Descrizione non valida'),
];

export const creaFaqSchema = [
  body('domanda').isString().notEmpty().withMessage('Domanda obbligatoria'),
  body('risposta').isString().notEmpty().withMessage('Risposta obbligatoria'),
  body('idDocente').optional({ values: 'null' }).isString().notEmpty().withMessage('idDocente non valido'),
];

export const modificaFaqSchema = [
  body('domanda').optional().isString().notEmpty(),
  body('risposta').optional().isString().notEmpty(),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
