import { Router } from 'express';
import {
  getStats,
  getUtenti,
  creaUtente,
  modificaUtente,
  eliminaUtente,
  getSlotDate,
  creaSlot,
  modificaSlot,
  eliminaSlot,
  getSlotGlobali,
  getGiorniBloccati,
  bloccaGiorno,
  sbloccaGiorno,
} from '../controllers/admin.controller';
import {
  creaUtenteSchema,
  modificaUtenteSchema,
  slotFiltriSchema,
  bloccaGiornoSchema,
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
router.get('/admin/slot-date', ...authz, getSlotDate);
router.post('/admin/slot', ...authz, creaSlot);
router.put('/admin/slot/:idSlot', ...authz, modificaSlot);
router.delete('/admin/slot/:idSlot', ...authz, eliminaSlot);
router.get('/admin/slot', ...authz, slotFiltriSchema, handleValidationErrors, getSlotGlobali);
router.get('/admin/giorni-bloccati', authenticate, getGiorniBloccati);
router.post('/admin/giorni-bloccati', ...authz, bloccaGiornoSchema, handleValidationErrors, bloccaGiorno);
router.delete('/admin/giorni-bloccati/:id', ...authz, sbloccaGiorno);

export default router;
