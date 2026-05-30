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
  verifica2FA,
  abilita2FA,
  confermaAbilita2FA,
  disabilita2FA,
  getStato2FA,
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
  verifica2FASchema,
  abilita2FASchema,
  confermaAbilita2FASchema,
  disabilita2FASchema,
  handleValidationErrors,
} from '../validators/auth.validators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/login', loginSchema, handleValidationErrors, login);
router.post('/registrazione', studenteRegistrationSchema, handleValidationErrors, registerStudente);
router.post('/recupera-password', forgotPasswordSchema, handleValidationErrors, forgotPassword);
router.post('/auth/verifica-codice', verificaCodiceSchema, handleValidationErrors, verificaCodice);
router.post('/reset-password', resetPasswordSchema, handleValidationErrors, resetPassword);

router.post('/auth/register/docente', docenteRegistrationSchema, handleValidationErrors, registerDocente);
router.post('/auth/register/admin', adminRegistrationSchema, handleValidationErrors, registerAdmin);
router.post('/auth/refresh', refreshTokenSchema, handleValidationErrors, refreshToken);
router.post('/auth/change-password', authenticate, changePasswordSchema, handleValidationErrors, changePassword);
router.get('/auth/profile', authenticate, getProfile);

router.post('/auth/verifica-2fa', verifica2FASchema, handleValidationErrors, verifica2FA);
router.post('/auth/2fa/abilita', authenticate, abilita2FASchema, handleValidationErrors, abilita2FA);
router.post('/auth/2fa/conferma', authenticate, confermaAbilita2FASchema, handleValidationErrors, confermaAbilita2FA);
router.post('/auth/2fa/disabilita', authenticate, disabilita2FASchema, handleValidationErrors, disabilita2FA);
router.get('/auth/2fa/stato', authenticate, getStato2FA);

export default router;
