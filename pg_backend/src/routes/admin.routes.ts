import { Router } from 'express';
import { getStats } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/admin/stats', authenticate, authorize('AMMINISTRATORE'), getStats);

export default router;
