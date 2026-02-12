// server/routes/admin/customerRoutes.js

import express from 'express';
import { protect, hasPermission } from '../../middleware/authMiddleware.js'; 

// Import controllers
import { 
  getAllCustomers,        // Matches export in controller
  getCustomerById,        // Matches export in controller
  updateCustomer,
  deleteCustomer,
  getCustomerStatistics,  // Matches export in controller
  addCustomerNote,
  updateCustomerStatus
} from '../../controllers/admin/customerController.js';

const router = express.Router();

// All routes are protected
router.use(protect);
router.use(hasPermission('customers', 'read'));

// --- General Routes ---

/**
 * @route   GET /api/admin/customers
 * @desc    Get all customers with filters
 */
router.get('/', getAllCustomers); 

/**
 * @route   GET /api/admin/customers/stats
 * @desc    Get customer statistics
 */
router.get('/stats', getCustomerStatistics); 

// --- Dynamic ID Routes ---

/**
 * @route   GET /api/admin/customers/:id
 * @desc    Get single customer by ID
 */
router.get('/:id', getCustomerById); 

// ... (Rest of the routes remain the same)

export default router;