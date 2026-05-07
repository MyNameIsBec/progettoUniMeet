import { Router } from 'express';
import { registerStudente, registerDocente } from '../controllers/auth.controller';
import {
  studenteRegistrationSchema,
  docenteRegistrationSchema,
  handleValidationErrors,
} from '../validators/auth.validators';

const router = Router();

router.post('/register/studente', studenteRegistrationSchema, handleValidationErrors, registerStudente);
router.post('/register/docente', docenteRegistrationSchema, handleValidationErrors, registerDocente);

export default router;
