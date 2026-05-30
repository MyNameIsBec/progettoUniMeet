import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const creaAccountSchema = [
  body('ruolo').isIn(['studente', 'docente', 'amministratore']).withMessage('Ruolo non valido'),
  body('nome').isString().notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('cognome').if(body('ruolo').isIn(['studente', 'docente'])).isString().notEmpty().trim(),
  body('matricola').if(body('ruolo').equals('studente')).isString().notEmpty().trim(),
  body('corsoDiStudi').if(body('ruolo').equals('studente')).isString().notEmpty().trim(),
  body('ufficio').if(body('ruolo').equals('docente')).isString().notEmpty().trim(),
  body('corsi').if(body('ruolo').equals('docente')).isArray({ min: 1 }).withMessage('Seleziona almeno un corso'),
];

export const modificaAccountSchema = [
  body('nome').optional().isString().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isString().isLength({ min: 8 }),
  body('cognome').optional().isString().notEmpty().trim(),
  body('matricola').optional().isString().notEmpty().trim(),
  body('corsoDiStudi').optional().isString().notEmpty().trim(),
  body('ufficio').optional().isString().notEmpty().trim(),
  body('corsi').optional().isArray({ min: 1 }),
];

export const slotFiltriSchema = [
  query('docenteId').optional().isString().notEmpty(),
  query('data').optional().isString().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/),
  query('stato').optional().isIn(['libero', 'occupato', 'tutti']),
];

export const creaSlotSchema = [
  body('docenteId').isString().notEmpty().trim().withMessage('Docente obbligatorio'),
  body('data').isString().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data obbligatoria (YYYY-MM-DD)'),
  body('oraInizio').isString().notEmpty().matches(/^\d{2}:\d{2}$/).withMessage('Ora inizio obbligatoria (HH:mm)'),
  body('oraFine').isString().notEmpty().matches(/^\d{2}:\d{2}$/).withMessage('Ora fine obbligatoria (HH:mm)')
    .custom((value, { req }) => {
      if (value <= req.body.oraInizio) throw new Error('oraFine deve essere dopo oraInizio');
      return true;
    }),
  body('disponibilita').optional().isBoolean(),
  body('luogo').optional().isObject(),
  body('luogo.nomeAula').if(body('luogo').exists()).isString().notEmpty().trim().withMessage('Nome aula richiesto se luogo fornito'),
  body('luogo.edificio').if(body('luogo').exists()).isString().notEmpty().trim().withMessage('Edificio richiesto se luogo fornito'),
  body('luogo.piano').if(body('luogo').exists()).isString().notEmpty().trim().withMessage('Piano richiesto se luogo fornito'),
];

export const modificaSlotSchema = [
  body('data').optional().isString().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data non valida (YYYY-MM-DD)'),
  body('oraInizio').optional().isString().matches(/^\d{2}:\d{2}$/).withMessage('Ora non valida (HH:mm)'),
  body('oraFine').optional().isString().matches(/^\d{2}:\d{2}$/).withMessage('Ora non valida (HH:mm)')
    .custom((value, { req }) => {
      const inizio = req.body.oraInizio;
      if (inizio && value <= inizio) throw new Error('oraFine deve essere dopo oraInizio');
      return true;
    }),
  body('disponibilita').optional().isBoolean(),
  body('docenteId').optional().isString().notEmpty().trim(),
  body('luogo').optional().isObject(),
  body('luogo.nomeAula').if(body('luogo').exists()).isString().notEmpty().trim(),
  body('luogo.edificio').if(body('luogo').exists()).isString().notEmpty().trim(),
  body('luogo.piano').if(body('luogo').exists()).isString().notEmpty().trim(),
];

export const bloccaGiornoSchema = [
  body('data').isString().notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data obbligatoria (YYYY-MM-DD)'),
  body('motivo').optional().isString().trim(),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
