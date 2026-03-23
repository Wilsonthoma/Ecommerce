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
  getSmsSettings,
  updateSmsSettings,
  getLegalSettings,
  updateLegalSettings,
  getProductDisplaySettings,
  updateProductDisplaySettings,
  getCheckoutSettings,
  updateCheckoutSettings,
  getCustomerSettings,
  updateCustomerSettings,
  getPaymentDisplaySettings,
  updatePaymentDisplaySettings,
  getSeoSettings,
  updateSeoSettings,
  uploadFile,
  resetSettings
} from '../../controllers/admin/settingsController.js';

const router = express.Router();

// Test endpoints (before auth for debugging)
router.get('/test-auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth test endpoint working',
    admin: {
      id: req.admin?._id,
      email: req.admin?.email,
      role: req.admin?.role
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

// SECTION-SPECIFIC SETTINGS
router.get('/email', getEmailSettings);
router.put('/email', updateEmailSettings);
router.get('/sms', getSmsSettings);
router.put('/sms', updateSmsSettings);
router.get('/legal', getLegalSettings);
router.put('/legal', updateLegalSettings);
router.get('/product-display', getProductDisplaySettings);
router.put('/product-display', updateProductDisplaySettings);
router.get('/checkout', getCheckoutSettings);
router.put('/checkout', updateCheckoutSettings);
router.get('/customer', getCustomerSettings);
router.put('/customer', updateCustomerSettings);
router.get('/payment-display', getPaymentDisplaySettings);
router.put('/payment-display', updatePaymentDisplaySettings);
router.get('/seo', getSeoSettings);
router.put('/seo', updateSeoSettings);

// OTHER SETTINGS
router.get('/system-info', getSystemInfo);
router.patch('/maintenance', toggleMaintenance);
router.post('/upload', upload.single('file'), uploadFile);
router.post('/reset', resetSettings);

// Test endpoint
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Settings endpoint is working!',
    endpoints: [
      'GET / - Get all settings',
      'PUT / - Update settings',
      'GET /email - Get email settings',
      'PUT /email - Update email settings',
      'GET /sms - Get SMS settings',
      'PUT /sms - Update SMS settings',
      'GET /legal - Get legal settings',
      'PUT /legal - Update legal settings',
      'GET /product-display - Get product display settings',
      'PUT /product-display - Update product display settings',
      'GET /checkout - Get checkout settings',
      'PUT /checkout - Update checkout settings',
      'GET /customer - Get customer settings',
      'PUT /customer - Update customer settings',
      'GET /payment-display - Get payment display settings',
      'PUT /payment-display - Update payment display settings',
      'GET /seo - Get SEO settings',
      'PUT /seo - Update SEO settings',
      'GET /system-info - System information',
      'PATCH /maintenance - Toggle maintenance',
      'POST /upload - Upload file',
      'POST /reset - Reset to defaults'
    ]
  });
});

// Catch-all for debugging
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Settings route not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'PUT /',
      'GET /email',
      'PUT /email',
      'GET /sms',
      'PUT /sms',
      'GET /legal',
      'PUT /legal',
      'GET /product-display',
      'PUT /product-display',
      'GET /checkout',
      'PUT /checkout',
      'GET /customer',
      'PUT /customer',
      'GET /payment-display',
      'PUT /payment-display',
      'GET /seo',
      'PUT /seo',
      'GET /system-info',
      'PATCH /maintenance',
      'POST /upload',
      'POST /reset'
    ]
  });
});

export default router;