import { Router } from 'express';
import authRoutes from './auth';
import correspondenceRoutes from './correspondence';
import attachmentRoutes from './attachment';
import entityRoutes from './entity';
import userRoutes from './user';
import dashboardRoutes from './dashboard';
import auditRoutes from './audit';

const router = Router();

router.use('/auth', authRoutes);
router.use('/correspondences', correspondenceRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/entities', entityRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditRoutes);

export default router;

