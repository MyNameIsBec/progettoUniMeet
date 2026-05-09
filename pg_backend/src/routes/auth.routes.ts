import { Router } from 'express';
import {
  login,
  registerStudente,
  registerDocente,
  registerAdmin,
  getProfile,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import {
  loginSchema,
  studenteRegistrationSchema,
  docenteRegistrationSchema,
  adminRegistrationSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  handleValidationErrors,
} from '../validators/auth.validators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/login', loginSchema, handleValidationErrors, login);
router.post('/registrazione', studenteRegistrationSchema, handleValidationErrors, registerStudente);
router.post('/recupera-password', forgotPasswordSchema, handleValidationErrors, forgotPassword);
router.post('/reset-password', resetPasswordSchema, handleValidationErrors, resetPassword);

router.post('/auth/register/studente', studenteRegistrationSchema, handleValidationErrors, registerStudente);
router.post('/auth/register/docente', docenteRegistrationSchema, handleValidationErrors, registerDocente);
router.post('/auth/register/admin', adminRegistrationSchema, handleValidationErrors, registerAdmin);
router.post('/auth/refresh', refreshTokenSchema, handleValidationErrors, refreshToken);
router.post('/auth/change-password', authenticate, changePasswordSchema, handleValidationErrors, changePassword);
router.get('/auth/profile', authenticate, getProfile);

export default router;
