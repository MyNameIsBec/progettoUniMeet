import { Router } from 'express';
import {
  createSegnalazione,
  getSegnalazioniByStudente,
  getAllSegnalazioni,
  aggiornaStatoSegnalazione,
} from '../controllers/segnalazioni.controller';
import {
  creaSegnalazioneSchema,
  aggiornaStatoSchema,
  handleValidationErrors,
} from '../validators/segnalazioni.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post(
  '/segnalazioni',
  authenticate,
  creaSegnalazioneSchema,
  handleValidationErrors,
  createSegnalazione,
);

router.get(
  '/segnalazioni/studente/:matricola',
  authenticate,
  getSegnalazioniByStudente,
);

router.get(
  '/segnalazioni/admin/all',
  authenticate,
  authorize('AMMINISTRATORE'),
  getAllSegnalazioni,
);

router.patch(
  '/segnalazioni/:id/stato',
  authenticate,
  authorize('AMMINISTRATORE'),
  aggiornaStatoSchema,
  handleValidationErrors,
  aggiornaStatoSegnalazione,
);

export default router;
