import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const creaCorsoSchema = [
  body('nomeCorso').isString().notEmpty().withMessage('Nome corso obbligatorio'),
  body('anno').isInt({ min: 2000, max: 2100 }).withMessage('Anno non valido'),
  body('cfu').isInt({ min: 1, max: 30 }).withMessage('CFU non validi'),
  body('idDocente').isString().notEmpty().withMessage('Docente obbligatorio'),
];

export const modificaCorsoSchema = [
  body('nomeCorso').optional().isString().notEmpty(),
  body('anno').optional().isInt({ min: 2000, max: 2100 }),
  body('cfu').optional().isInt({ min: 1, max: 30 }),
  body('idDocente').optional().isString().notEmpty(),
];

export const corsiFiltriSchema = [
  query('docenteId').optional().isString().notEmpty(),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
