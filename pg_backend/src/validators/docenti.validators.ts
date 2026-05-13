import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const creaSlotSchema = [
  body('data').isString().notEmpty().withMessage('Data obbligatoria'),
  body('oraInizio').isString().notEmpty().withMessage('Ora inizio obbligatoria'),
  body('oraFine').isString().notEmpty().withMessage('Ora fine obbligatoria'),
  body('luogo').optional().isObject(),
  body('luogo.nomeAula').if(body('luogo').exists()).isString().notEmpty(),
  body('luogo.edificio').if(body('luogo').exists()).isString().notEmpty(),
  body('luogo.piano').if(body('luogo').exists()).isString().notEmpty(),
];

export const modificaSlotSchema = [
  body('data').optional().isString().notEmpty(),
  body('oraInizio').optional().isString().notEmpty(),
  body('oraFine').optional().isString().notEmpty(),
  body('disponibilita').optional().isBoolean(),
  body('luogo').optional().isObject(),
  body('luogo.nomeAula').if(body('luogo').exists()).isString().notEmpty(),
  body('luogo.edificio').if(body('luogo').exists()).isString().notEmpty(),
  body('luogo.piano').if(body('luogo').exists()).isString().notEmpty(),
];

export const slotFiltriSchema = [
  query('mese').optional().isString().notEmpty(),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
