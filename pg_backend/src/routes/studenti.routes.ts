import { Router } from 'express';
import { getProfilo, aggiornaProfilo, cambiaPasswordStudente, eliminaAccount } from '../controllers/studenti.controller';
import { aggiornaStudenteSchema, cambiaPasswordStudenteSchema, handleValidationErrors } from '../validators/studenti.validators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/studenti/:matricola', authenticate, getProfilo);
router.put('/studenti/:matricola', authenticate, aggiornaStudenteSchema, handleValidationErrors, aggiornaProfilo);
router.post('/studenti/:matricola/cambia-password', authenticate, cambiaPasswordStudenteSchema, handleValidationErrors, cambiaPasswordStudente);
router.delete('/studenti/:matricola', authenticate, eliminaAccount);

export default router;
