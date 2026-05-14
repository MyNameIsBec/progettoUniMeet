import { Router } from 'express';
import {
  getCorsi,
  getCorsoById,
  createCorso,
  updateCorso,
  deleteCorso,
} from '../controllers/corsi.controller';
import {
  creaCorsoSchema,
  modificaCorsoSchema,
  handleValidationErrors,
} from '../validators/corsi.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/corsi', getCorsi);
router.get('/corsi/:id', getCorsoById);
router.post('/corsi', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), creaCorsoSchema, handleValidationErrors, createCorso);
router.put('/corsi/:id', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), modificaCorsoSchema, handleValidationErrors, updateCorso);
router.delete('/corsi/:id', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), deleteCorso);

export default router;
