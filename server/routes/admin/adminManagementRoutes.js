// /server/routes/admin/adminManagementRoutes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { upload } from '../../utils/upload.js';

import {
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  logout,
  checkAuth
} from '../../controllers/admin/authController.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/check', protect, checkAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/logout', protect, logout);

export default router;