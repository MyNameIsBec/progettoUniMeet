import { Router } from 'express';
import {
  createPrenotazione,
  annullaPrenotazione,
  getPrenotazioniStudente,
  getPrenotazioniDocente,
  aggiornaStatoPrenotazione,
  getPrenotazioneById,
  eliminaPrenotazione,
} from '../controllers/prenotazioni.controller';
import {
  creaPrenotazioneSchema,
  aggiornaStatoSchema,
  handleValidationErrors,
} from '../validators/prenotazioni.validators';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/prenotazioni', authenticate, creaPrenotazioneSchema, handleValidationErrors, upload.array('files', 5), createPrenotazione);
router.delete('/prenotazioni/:id', authenticate, annullaPrenotazione);
router.get('/prenotazioni/studente/:matricolaStudente', authenticate, getPrenotazioniStudente);
router.get('/prenotazioni/docente/:idDocente', authenticate, getPrenotazioniDocente);
router.get('/prenotazioni/:id', authenticate, getPrenotazioneById);
router.delete('/prenotazioni/:id/fisico', authenticate, eliminaPrenotazione);
router.put('/prenotazioni/:id/stato', authenticate, aggiornaStatoSchema, handleValidationErrors, aggiornaStatoPrenotazione);

export default router;
