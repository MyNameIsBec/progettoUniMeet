import { Router } from 'express';
import {
  createPrenotazione, annullaPrenotazione, getPrenotazioniStudente,
  getPrenotazioniDocente, aggiornaStatoPrenotazione, getPrenotazioneById,
  eliminaPrenotazione, uploadDocumentiPrenotazione, getGiorniBloccati,
} from '../controllers/prenotazioni.controller';
import {
  creaPrenotazioneSchema, aggiornaStatoSchema, handleValidationErrors,
} from '../validators/prenotazioni.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/prenotazioni/giorni-bloccati', authenticate, getGiorniBloccati);
router.post('/prenotazioni', authenticate, authorize('STUDENTE'), upload.array('files', 5), creaPrenotazioneSchema, handleValidationErrors, createPrenotazione);
router.delete('/prenotazioni/:id', authenticate, annullaPrenotazione);
router.get('/prenotazioni/studente/:matricolaStudente', authenticate, getPrenotazioniStudente);
router.get('/prenotazioni/docente/:idDocente', authenticate, getPrenotazioniDocente);
router.get('/prenotazioni/:id', authenticate, getPrenotazioneById);
router.delete('/prenotazioni/:id/fisico', authenticate, eliminaPrenotazione);
router.put('/prenotazioni/:id/stato', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), aggiornaStatoSchema, handleValidationErrors, aggiornaStatoPrenotazione);
router.post('/prenotazioni/:id/documenti', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), upload.array('files', 5), uploadDocumentiPrenotazione);

export default router;
