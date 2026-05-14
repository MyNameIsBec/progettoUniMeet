import { Router } from 'express';
import {
  getBachecaByCorso,
  updateBacheca,
  getFaqByBacheca,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../controllers/bacheca.controller';
import {
  aggiornaBachecaSchema,
  creaFaqSchema,
  modificaFaqSchema,
  handleValidationErrors,
} from '../validators/bacheca.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/bacheche/:idCorso', getBachecaByCorso);
router.put('/bacheche/:idCorso', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), aggiornaBachecaSchema, handleValidationErrors, updateBacheca);
router.get('/bacheche/:idCorso/faq', getFaqByBacheca);
router.post('/bacheche/:idCorso/faq', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), creaFaqSchema, handleValidationErrors, createFaq);
router.put('/faq/:id', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), modificaFaqSchema, handleValidationErrors, updateFaq);
router.delete('/faq/:id', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), deleteFaq);

export default router;
