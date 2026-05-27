import { Router } from 'express';
import {
  getBachecaByCorso,
  getBachecaByCorsoDiStudi,
  getBachecheDocente,
  updateBacheca,
  getFaqByBacheca,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../controllers/bacheca.controller';
import {
  aggiornaBachecaSchema,
  creaFaqSchema,
  modificaFaqSchema,
  handleValidationErrors,
} from '../validators/bacheca.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Rotte per corso (nuova architettura: una bacheca per corso)
router.get('/bacheche/corso/:idCorso', getBachecaByCorso);
router.put('/bacheche/corso/:idCorso', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), aggiornaBachecaSchema, handleValidationErrors, updateBacheca);
router.get('/bacheche/corso/:idCorso/faq', getFaqByBacheca);
router.post('/bacheche/corso/:idCorso/faq', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), creaFaqSchema, handleValidationErrors, createFaq);

// Rotte docente: tutte le bacheche dei miei corsi
router.get('/bacheche/docente/me', authenticate, authorize('DOCENTE'), getBachecheDocente);

// Rotte per corso di studi (retrocompatibile: ora restituisce array di bacheche)
router.get('/bacheche/corso-di-studi/:idCorsoDiStudi', getBachecaByCorsoDiStudi);

// Rotte FAQ generiche
router.put('/faq/:id', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), modificaFaqSchema, handleValidationErrors, updateFaq);
router.delete('/faq/:id', authenticate, authorize('DOCENTE', 'AMMINISTRATORE'), deleteFaq);

export default router;
