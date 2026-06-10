import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const creaSlotSchema = [
  body('data').isString().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data obbligatoria (YYYY-MM-DD)'),
  body('oraInizio').isString().notEmpty().matches(/^\d{2}:\d{2}$/).withMessage('Ora inizio obbligatoria (HH:mm)'),
  body('oraFine').isString().notEmpty().matches(/^\d{2}:\d{2}$/).withMessage('Ora fine obbligatoria (HH:mm)')
    .custom((value, { req }) => {
      if (value <= req.body.oraInizio) throw new Error('oraFine deve essere dopo oraInizio');
      return true;
    }),
  body('luogo').optional().isObject(),
  body('luogo.nomeAula').if(body('luogo').exists()).isString().notEmpty(),
  body('luogo.edificio').if(body('luogo').exists()).isString().notEmpty(),
  body('luogo.piano').if(body('luogo').exists()).isString().notEmpty(),
];

export const modificaSlotSchema = [
  body('data').optional().isString().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/),
  body('oraInizio').optional().isString().notEmpty().matches(/^\d{2}:\d{2}$/),
  body('oraFine').optional().isString().notEmpty().matches(/^\d{2}:\d{2}$/)
    .custom((value, { req }) => {
      const inizio = req.body.oraInizio;
      if (inizio && value <= inizio) throw new Error('oraFine deve essere dopo oraInizio');
      return true;
    }),
  body('data').optional().isString().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/),
  body('disponibilita').optional().isBoolean(),
  body('luogo').optional().isObject(),
  body('luogo.nomeAula').if(body('luogo').exists()).isString().notEmpty(),
  body('luogo.edificio').if(body('luogo').exists()).isString().notEmpty(),
  body('luogo.piano').if(body('luogo').exists()).isString().notEmpty(),
];

export const aggiornaProfiloSchema = [
  body('nome').optional().isString().notEmpty().trim(),
  body('cognome').optional().isString().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('ufficio').optional().isString().notEmpty().trim(),
  body('notificheApp').optional().isBoolean(),
  body('notificheEmail').optional().isBoolean(),
  body('reminderOre').optional().isInt({ min: 0 }),
  body('tema').optional().isString().isIn(['light', 'dark', 'system']),
  body('lingua').optional().isString().isIn(['it', 'en']),
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
