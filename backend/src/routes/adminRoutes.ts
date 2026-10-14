import { Router } from 'express';
import {
  adminLogin,
  adminLogout,
  getDashboardStats,
  getSubmissions,
  getSubmissionDetail,
  updateSubmissionStatus,
  addAdminNote,
  exportSubmissionsCsv,
  getAuditLogs,
  updateAppSetting
} from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';
import { adminLoginLimiter } from '../middleware/rateLimiter';
import { validateAdminLogin } from '../middleware/validator';

const router = Router();

// Authentication
router.post('/login', adminLoginLimiter, validateAdminLogin, adminLogin);
router.post('/logout', authenticateAdmin, adminLogout);

// Dashboard
router.get('/dashboard-stats', authenticateAdmin, getDashboardStats);

// Submissions management
router.get('/submissions', authenticateAdmin, getSubmissions);
router.get('/submissions/:id', authenticateAdmin, getSubmissionDetail);
router.patch('/submissions/:id/status', authenticateAdmin, updateSubmissionStatus);
router.post('/submissions/:id/notes', authenticateAdmin, addAdminNote);

// Export
router.get('/export', authenticateAdmin, exportSubmissionsCsv);

// Audit logs
router.get('/audit-logs', authenticateAdmin, getAuditLogs);

// System settings
router.patch('/settings', authenticateAdmin, updateAppSetting);

export default router;
