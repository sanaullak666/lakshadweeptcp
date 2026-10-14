import { Router } from 'express';
import {
  getTemplates,
  getTemplateById,
  previewTemplate,
  createTemplateVersion,
  activateTemplateVersion
} from '../controllers/templateController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Templates can be viewed
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/preview', previewTemplate);

// Protected admin modification routes
router.post('/', authenticateAdmin, createTemplateVersion);
router.post('/:id/activate', authenticateAdmin, activateTemplateVersion);

export default router;
