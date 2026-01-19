import { Router } from 'express';
import { getStats } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, getStats);

export default router;

