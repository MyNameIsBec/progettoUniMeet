import { Router } from 'express';
import {
  getNotifiche,
  createNotifica,
  segnaComeLetta,
  segnaTutteComeLette,
  cancellaNotificheLette,
} from '../controllers/notifiche.controller';
import {
  creaNotificaSchema,
  handleValidationErrors,
} from '../validators/notifiche.validators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/notifiche/:destinatarioId', authenticate, getNotifiche);
router.post('/notifiche', authenticate, creaNotificaSchema, handleValidationErrors, createNotifica);
router.patch('/notifiche/:id/letta', authenticate, segnaComeLetta);
router.post('/notifiche/:destinatarioId/letta-tutte', authenticate, segnaTutteComeLette);
router.delete('/notifiche/:destinatarioId/lette', authenticate, cancellaNotificheLette);

export default router;
