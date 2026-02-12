// routes/admin/settingsRoutes.js
import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import upload from '../../middleware/uploadMiddleware.js';
import {
  getSettings,
  updateSettings,
  getSystemInfo,
  toggleMaintenance,
  getEmailSettings,
  updateEmailSettings,
  uploadFile,
  resetSettings
} from '../../controllers/admin/settingsController.js';

const router = express.Router();

// Add a test endpoint before authorization for debugging
router.get('/test-auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth test endpoint working',
    admin: {
      id: req.admin?._id,
      email: req.admin?.email,
      role: req.admin?.role,
      isActive: req.admin?.isActive
    }
  });
});

// Apply authorization to all routes below
router.use(protect);
router.use(authorize('admin', 'super-admin'));

// MAIN SETTINGS
router.route('/')
  .get(getSettings)
  .put(updateSettings);

// SPECIFIC SETTINGS ENDPOINTS
router.post('/reset', resetSettings);
router.get('/email', getEmailSettings);
router.put('/email', updateEmailSettings);
router.get('/system-info', getSystemInfo);
router.patch('/maintenance', toggleMaintenance);
router.post('/upload', upload.single('file'), uploadFile);

// TEST ENDPOINT
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Settings endpoint is working!',
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      role: req.admin.role
    },
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET / - Get all settings',
      'PUT / - Update settings',
      'POST /reset - Reset to defaults',
      'GET /email - Get email settings',
      'PUT /email - Update email settings',
      'GET /system-info - Get system info',
      'PATCH /maintenance - Toggle maintenance',
      'POST /upload - Upload file',
      'GET /test - Test endpoint',
      'GET /test-auth - Test auth'
    ]
  });
});

// CATCH-ALL ROUTE FOR DEBUGGING
router.all('*', (req, res) => {
  console.log(`🔄 Settings route not found: ${req.method} ${req.originalUrl}`);
  console.log('Available routes:', router.stack.map(r => r.route?.path).filter(Boolean));
  
  res.status(404).json({
    success: false,
    error: `Settings route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: router.stack
      .map(r => r.route?.path)
      .filter(Boolean)
      .map(path => `${req.method} ${path}`)
  });
});

export default router;