import { Router } from 'express';
import { getProfilo, aggiornaProfilo } from '../controllers/studenti.controller';
import { aggiornaStudenteSchema, handleValidationErrors } from '../validators/studenti.validators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/studenti/:matricola', authenticate, getProfilo);
router.put('/studenti/:matricola', authenticate, aggiornaStudenteSchema, handleValidationErrors, aggiornaProfilo);

export default router;
