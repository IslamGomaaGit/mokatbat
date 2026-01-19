import { Router } from 'express';
import { getAuditLogs, getAuditLogById } from '../controllers/auditController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All audit log routes require authentication and admin role
router.get('/', authenticate, requireRole('Admin', 'admin'), getAuditLogs);
router.get('/:id', authenticate, requireRole('Admin', 'admin'), getAuditLogById);

export default router;

