import { Router } from 'express';
import {
  getStats,
  getUtenti,
  creaUtente,
  modificaUtente,
  eliminaUtente,
  getSlotGlobali,
} from '../controllers/admin.controller';
import {
  creaUtenteSchema,
  modificaUtenteSchema,
  slotFiltriSchema,
  handleValidationErrors,
} from '../validators/admin.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

const authz = [authenticate, authorize('AMMINISTRATORE')];

router.get('/admin/stats', ...authz, getStats);
router.get('/admin/utenti', ...authz, getUtenti);
router.post('/admin/utenti', ...authz, creaUtenteSchema, handleValidationErrors, creaUtente);
router.put('/admin/utenti/:id', ...authz, modificaUtenteSchema, handleValidationErrors, modificaUtente);
router.delete('/admin/utenti/:id', ...authz, eliminaUtente);
router.get('/admin/slot', ...authz, slotFiltriSchema, handleValidationErrors, getSlotGlobali);

export default router;
