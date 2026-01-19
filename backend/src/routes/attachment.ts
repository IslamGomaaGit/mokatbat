import { Router } from 'express';
import { uploadAttachment, downloadAttachment, deleteAttachment } from '../controllers/attachmentController';
import { authenticate, requirePermission } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/:id', authenticate, requirePermission('correspondence:update'), upload.single('file'), uploadAttachment);
router.get('/:id/download', authenticate, requirePermission('correspondence:read'), downloadAttachment);
router.delete('/:id', authenticate, requirePermission('correspondence:delete'), deleteAttachment);

export default router;

