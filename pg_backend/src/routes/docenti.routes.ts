import { Router } from 'express';
import {
  getElencoDocenti, getDettagliDocente, getSlots, creaSlot,
  modificaSlot, eliminaSlot, aggiornaProfilo, getStatistiche,
} from '../controllers/docenti.controller';
import {
  creaSlotSchema, modificaSlotSchema, slotFiltriSchema, handleValidationErrors,
} from '../validators/docenti.validators';
import { authenticate } from '../middleware/authenticate';
import { authorizeDocente } from '../middleware/authorize';

const router = Router();

router.get('/docenti', getElencoDocenti);
router.get('/docenti/:id', getDettagliDocente);
router.get('/docenti/:idDocente/slots', authenticate, slotFiltriSchema, handleValidationErrors, getSlots);
router.post('/docenti/:idDocente/slots', authenticate, authorizeDocente, creaSlotSchema, handleValidationErrors, creaSlot);
router.put('/docenti/:idDocente/slots/:idSlot', authenticate, authorizeDocente, modificaSlotSchema, handleValidationErrors, modificaSlot);
router.delete('/docenti/:idDocente/slots/:idSlot', authenticate, authorizeDocente, eliminaSlot);
router.put('/docenti/:idDocente/profilo', authenticate, authorizeDocente, aggiornaProfilo);
router.get('/docenti/:idDocente/statistiche', authenticate, authorizeDocente, getStatistiche);

export default router;
