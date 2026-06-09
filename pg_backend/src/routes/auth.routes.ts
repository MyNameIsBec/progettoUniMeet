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
  verificaCodice,
  resetPassword,
} from '../controllers/auth.controller';
import {
  loginSchema,
  studenteRegistrationSchema,
  docenteRegistrationSchema,
  adminRegistrationSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verificaCodiceSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  handleValidationErrors,
} from '../validators/auth.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/login', loginSchema, handleValidationErrors, login);
router.post('/registrazione', studenteRegistrationSchema, handleValidationErrors, registerStudente);
router.post('/recupera-password', forgotPasswordSchema, handleValidationErrors, forgotPassword);
router.post('/auth/verifica-codice', verificaCodiceSchema, handleValidationErrors, verificaCodice);
router.post('/reset-password', resetPasswordSchema, handleValidationErrors, resetPassword);

router.post('/auth/register/docente', authenticate, authorize('AMMINISTRATORE'), docenteRegistrationSchema, handleValidationErrors, registerDocente);
router.post('/auth/register/admin', authenticate, authorize('AMMINISTRATORE'), adminRegistrationSchema, handleValidationErrors, registerAdmin);
router.post('/auth/refresh', refreshTokenSchema, handleValidationErrors, refreshToken);
router.post('/auth/change-password', authenticate, changePasswordSchema, handleValidationErrors, changePassword);
router.get('/auth/profile', authenticate, getProfile);

export default router;
