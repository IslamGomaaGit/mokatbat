import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/entityController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requirePermission('entity:read'), getAll);
router.get('/:id', authenticate, requirePermission('entity:read'), getById);
router.post('/', authenticate, requirePermission('entity:create'), create);
router.put('/:id', authenticate, requirePermission('entity:update'), update);
router.delete('/:id', authenticate, requirePermission('entity:delete'), remove);

export default router;

