import { Router } from 'express';
import {
  getStats, getAccount, creaAccount, modificaAccount, eliminaAccount,
  getSlotDate, creaSlot, modificaSlot, eliminaSlot, getSlotGlobali,
  getAllPrenotazioni, aggiornaStatoPrenotazione, eliminaPrenotazione,
  getGiorniBloccati, bloccaGiorno, sbloccaGiorno,
} from '../controllers/admin.controller';
import {
  creaAccountSchema,
  modificaAccountSchema,
  slotFiltriSchema,
  creaSlotSchema,
  modificaSlotSchema,
  bloccaGiornoSchema,
  handleValidationErrors,
} from '../validators/admin.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { aggiornaStatoSchema } from '../validators/prenotazioni.validators';

const router = Router();

const authz = [authenticate, authorize('AMMINISTRATORE')];

router.get('/admin/stats', ...authz, getStats);
router.get('/admin/utenti', ...authz, getAccount);
router.post('/admin/utenti', ...authz, creaAccountSchema, handleValidationErrors, creaAccount);
router.put('/admin/utenti/:id', ...authz, modificaAccountSchema, handleValidationErrors, modificaAccount);
router.delete('/admin/utenti/:id', ...authz, eliminaAccount);
router.get('/admin/slot-date', ...authz, getSlotDate);
router.post('/admin/slot', ...authz, creaSlotSchema, handleValidationErrors, creaSlot);
router.put('/admin/slot/:idSlot', ...authz, modificaSlotSchema, handleValidationErrors, modificaSlot);
router.delete('/admin/slot/:idSlot', ...authz, eliminaSlot);
router.get('/admin/slot', ...authz, slotFiltriSchema, handleValidationErrors, getSlotGlobali);
router.get('/admin/prenotazioni', ...authz, getAllPrenotazioni);
router.put('/admin/prenotazioni/:id/stato', ...authz, aggiornaStatoSchema, handleValidationErrors, aggiornaStatoPrenotazione);
router.delete('/admin/prenotazioni/:id', ...authz, eliminaPrenotazione);
router.get('/admin/giorni-bloccati', ...authz, getGiorniBloccati);
router.post('/admin/giorni-bloccati', ...authz, bloccaGiornoSchema, handleValidationErrors, bloccaGiorno);
router.delete('/admin/giorni-bloccati/:id', ...authz, sbloccaGiorno);

export default router;
