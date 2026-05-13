import { Router } from 'express';
import {
  createPrenotazione,
  annullaPrenotazione,
  getPrenotazioniStudente,
  getPrenotazioniDocente,
  aggiornaStatoPrenotazione,
} from '../controllers/prenotazioni.controller';
import {
  creaPrenotazioneSchema,
  aggiornaStatoSchema,
  handleValidationErrors,
} from '../validators/prenotazioni.validators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/prenotazioni', authenticate, creaPrenotazioneSchema, handleValidationErrors, createPrenotazione);
router.delete('/prenotazioni/:id', authenticate, annullaPrenotazione);
router.get('/prenotazioni/studente/:matricolaStudente', authenticate, getPrenotazioniStudente);
router.get('/prenotazioni/docente/:idDocente', authenticate, getPrenotazioniDocente);
router.put('/prenotazioni/:id/stato', authenticate, aggiornaStatoSchema, handleValidationErrors, aggiornaStatoPrenotazione);

export default router;
