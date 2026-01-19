import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/userController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requirePermission('user:read'), getAll);
router.get('/:id', authenticate, requirePermission('user:read'), getById);
router.post('/', authenticate, requirePermission('user:create'), create);
router.put('/:id', authenticate, requirePermission('user:update'), update);
router.delete('/:id', authenticate, requirePermission('user:delete'), remove);

export default router;

