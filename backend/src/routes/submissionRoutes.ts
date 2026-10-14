import { Router } from 'express';
import {
  createSubmission,
  getSubmissionById,
  getLetterHtml,
  downloadLetterPdf,
  downloadBothLettersZip,
  getPublicSettings,
  checkEmailAvailability
} from '../controllers/submissionController';
import { signatureUpload } from '../middleware/upload';
import { submissionLimiter } from '../middleware/rateLimiter';
import { validateSubmission } from '../middleware/validator';

const router = Router();

// Public routes
router.get('/settings', getPublicSettings);
router.get('/check-email', checkEmailAvailability);

// Create submission (Single form submission generates TWO objection letters)
router.post(
  '/',
  submissionLimiter,
  signatureUpload.single('signatureFile'),
  validateSubmission,
  createSubmission
);

// Get submission by ID (for post-submission view and tracking)
router.get('/:id', getSubmissionById);

// View and download individual objection letters
router.get('/:id/letters/:letterNumber/view', getLetterHtml);
router.get('/:id/letters/:letterNumber/download', downloadLetterPdf);

// Download letters as ZIP archive
router.get('/:id/download-both', downloadBothLettersZip);
router.get('/:id/download-all', downloadBothLettersZip);

export default router;
