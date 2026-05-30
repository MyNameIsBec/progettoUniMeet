import { Router } from 'express';
import { getAll } from '../controllers/corsi-di-studio.controller';

const router = Router();

router.get('/corsi-di-studio', getAll);

export default router;
