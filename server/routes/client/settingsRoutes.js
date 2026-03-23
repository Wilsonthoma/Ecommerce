// server/routes/client/settingsRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { protectUser } from '../../middleware/authMiddleware.js';  // ✅ Use protectUser for client routes
import {
  getUserSettings,
  updateUserSettings,
  updateNotifications,
  updateDisplay,
  updatePrivacy,
  updateProfile,
  resetUserSettings,
  getPublicProfile
} from '../../controllers/client/settingsController.js';

const router = express.Router();

// Public route - no auth required
router.get('/public-profile/:userId', getPublicProfile);

// Protected routes - require user authentication
router.use(protectUser);  // ✅ This requires user to be logged in

// Main settings
router.route('/')
  .get(getUserSettings)
  .put([
    body('profile.displayName').optional().trim().isLength({ max: 50 }),
    body('profile.bio').optional().trim().isLength({ max: 500 }),
    body('profile.language').optional().isIn(['en', 'sw', 'fr']),
    body('profile.timezone').optional().isString(),
    body('display.theme').optional().isIn(['light', 'dark', 'system']),
    body('display.itemsPerPage').optional().isIn([12, 24, 48, 96]),
    body('display.currency').optional().isIn(['KES', 'USD', 'EUR', 'GBP'])
  ], updateUserSettings);

// Notification settings
router.put('/notifications', [
  body('email').optional().isObject(),
  body('sms').optional().isObject(),
  body('push').optional().isObject(),
  body('frequency').optional().isIn(['instant', 'daily', 'weekly']),
  body('quietHours').optional().isObject()
], updateNotifications);

// Display settings
router.put('/display', [
  body('theme').optional().isIn(['light', 'dark', 'system']),
  body('compactView').optional().isBoolean(),
  body('itemsPerPage').optional().isIn([12, 24, 48, 96]),
  body('currency').optional().isIn(['KES', 'USD', 'EUR', 'GBP']),
  body('showPricesWithTax').optional().isBoolean()
], updateDisplay);

// Privacy settings
router.put('/privacy', [
  body('profileVisibility').optional().isIn(['public', 'private', 'contacts']),
  body('showEmail').optional().isBoolean(),
  body('showPhone').optional().isBoolean(),
  body('showOrderHistory').optional().isBoolean(),
  body('allowDataCollection').optional().isBoolean(),
  body('allowCookies').optional().isBoolean()
], updatePrivacy);

// Profile settings
router.put('/profile', [
  body('displayName').optional().trim().isLength({ max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('phoneNumber').optional().isMobilePhone('any'),
  body('language').optional().isIn(['en', 'sw', 'fr']),
  body('timezone').optional().isString(),
  body('dateFormat').optional().isIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  body('timeFormat').optional().isIn(['12h', '24h'])
], updateProfile);

// Reset to default
router.post('/reset', resetUserSettings);

export default router;