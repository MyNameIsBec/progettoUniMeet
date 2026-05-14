import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const creaNotificaSchema = [
  body('titolo').isString().notEmpty().withMessage('Titolo obbligatorio'),
  body('messaggio').isString().notEmpty().withMessage('Messaggio obbligatorio'),
  body('tipo').isString().notEmpty().withMessage('Tipo obbligatorio'),
  body('destinatarioId').isString().notEmpty().withMessage('Destinatario obbligatorio'),
  body('destinatarioRuolo').isString().isIn(['STUDENTE', 'DOCENTE', 'AMMINISTRATORE']).withMessage('Ruolo non valido'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
