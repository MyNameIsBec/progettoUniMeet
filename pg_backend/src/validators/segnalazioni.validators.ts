import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const creaSegnalazioneSchema = [
  body('oggetto').isString().notEmpty().trim().withMessage('Oggetto obbligatorio'),
  body('descrizione').isString().notEmpty().trim().withMessage('Descrizione obbligatoria'),
  body('matricola_studente').optional().isString().trim(),
];

export const creaSegnalazioneDocenteSchema = [
  body('oggetto').isString().notEmpty().trim().withMessage('Oggetto obbligatorio'),
  body('descrizione').isString().notEmpty().trim().withMessage('Descrizione obbligatoria'),
  body('id_docente').optional().isString().trim(),
];

export const aggiornaStatoSchema = [
  body('stato').isIn(['APERTA', 'IN_LAVORAZIONE', 'CHIUSA']).withMessage('Stato non valido'),
  body('noteAdmin').optional({ values: 'null' }).isString().trim().withMessage('Note non valide'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
