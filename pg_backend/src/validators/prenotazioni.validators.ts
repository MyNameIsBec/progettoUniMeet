import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const creaPrenotazioneSchema = [
  body('idSlot').isString().notEmpty(),
  body('argomento').isString().notEmpty().trim(),
];

export const aggiornaStatoSchema = [
  body('stato').isIn(['IN_ATTESA', 'CONFERMATA', 'COMPLETATA', 'ANNULLATA', 'RIFIUTATA']),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
