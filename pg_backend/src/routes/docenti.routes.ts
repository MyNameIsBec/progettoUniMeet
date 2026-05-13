import { Router } from 'express';
import {
  getElencoDocenti,
  getDettagliDocente,
  getSlots,
  creaSlot,
  modificaSlot,
  eliminaSlot,
  getStatistiche,
} from '../controllers/docenti.controller';
import {
  creaSlotSchema,
  modificaSlotSchema,
  slotFiltriSchema,
  handleValidationErrors,
} from '../validators/docenti.validators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/docenti', getElencoDocenti);
router.get('/docenti/:id', getDettagliDocente);
router.get('/docenti/:idDocente/slots', authenticate, slotFiltriSchema, handleValidationErrors, getSlots);
router.post('/docenti/:idDocente/slots', authenticate, creaSlotSchema, handleValidationErrors, creaSlot);
router.put('/docenti/:idDocente/slots/:idSlot', authenticate, modificaSlotSchema, handleValidationErrors, modificaSlot);
router.delete('/docenti/:idDocente/slots/:idSlot', authenticate, eliminaSlot);
router.get('/docenti/:idDocente/statistiche', authenticate, getStatistiche);

export default router;
