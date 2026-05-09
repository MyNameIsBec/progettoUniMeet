import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const loginSchema = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
];

export const studenteRegistrationSchema = [
  body('matricola').isString().notEmpty().trim(),
  body('nome').isString().notEmpty().trim(),
  body('cognome').isString().notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('corsoDiStudi').isString().notEmpty().trim(),
];

export const docenteRegistrationSchema = [
  body('nome').isString().notEmpty().trim(),
  body('cognome').isString().notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('ufficio').isString().notEmpty().trim(),
];

export const adminRegistrationSchema = [
  body('nome').isString().notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
];

export const changePasswordSchema = [
  body('oldPassword').isString().notEmpty(),
  body('newPassword').isString().isLength({ min: 8 }),
];

export const forgotPasswordSchema = [
  body('email').isEmail().normalizeEmail(),
];

export const resetPasswordSchema = [
  body('token').isString().notEmpty(),
  body('nuovaPassword').isString().isLength({ min: 8 }),
];

export const refreshTokenSchema = [
  body('refreshToken').isString().notEmpty(),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
