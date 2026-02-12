// server/routes/admin/userRoutes.js
import express from 'express';
import { protect, authorize, hasPermission } from '../../middleware/authMiddleware.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
  bulkUpdateUsers
} from '../../controllers/admin/userController.js';

const router = express.Router();

// All routes are protected
router.use(protect);
router.use(authorize('admin', 'super-admin'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private/Admin,Super-Admin
 */
router.get('/', hasPermission('users', 'read'), getUsers);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Private/Admin,Super-Admin
 */
router.get('/stats', hasPermission('users', 'read'), getUserStats);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private/Admin,Super-Admin (requires write permission)
 */
router.post('/', hasPermission('users', 'write'), createUser);

/**
 * @route   PUT /api/admin/users/bulk
 * @desc    Bulk update users
 * @access  Private/Admin,Super-Admin (requires write permission)
 */
router.put('/bulk', hasPermission('users', 'write'), bulkUpdateUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user by ID
 * @access  Private/Admin,Super-Admin
 */
router.get('/:id', hasPermission('users', 'read'), getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private/Admin,Super-Admin (requires write permission)
 */
router.put('/:id', hasPermission('users', 'write'), updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private/Admin,Super-Admin (requires delete permission)
 */
router.delete('/:id', hasPermission('users', 'delete'), deleteUser);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private/Admin,Super-Admin (requires write permission)
 */
router.put('/:id/role', hasPermission('users', 'write'), updateUserRole);

export default router;