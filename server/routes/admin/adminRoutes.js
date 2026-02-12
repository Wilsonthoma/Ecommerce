import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { csrfProtection, getCsrfToken } from '../../config/csrfProtection.js';
import {
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  checkAuth,
  checkSetup,
  setupFirstAdmin,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendOtp
} from '../../controllers/admin/authController.js';

const router = express.Router();

// CSRF token endpoint
router.get('/csrf-token', getCsrfToken);

// Public routes
router.get('/check-setup', checkSetup);
router.post('/setup', csrfProtection, setupFirstAdmin);
router.post('/login', csrfProtection, login);
router.post('/forgot-password', csrfProtection, forgotPassword);
router.post('/verify-reset-otp', csrfProtection, verifyResetOtp);
router.post('/reset-password', csrfProtection, resetPassword);
router.post('/resend-otp', csrfProtection, resendOtp);

// Protected routes
router.get('/check', protect, checkAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, csrfProtection, updateProfile);
router.put('/change-password', protect, csrfProtection, changePassword);
router.post('/logout', protect, csrfProtection, logout);

export default router;
