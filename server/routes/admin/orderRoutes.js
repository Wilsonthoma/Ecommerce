import express from 'express';
import { protect, hasPermission } from '../../middleware/authMiddleware.js'; // FIX: Convert to import and add .js

// Import controllers
import { // FIX: Convert to import and add .js
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  fulfillOrder,
  deleteOrder,
  bulkUpdateOrderStatus,
  getOrderStats,
  getOrderTimeline
} from '../../controllers/admin/orderController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with filters
 * @access  Private/Admin,Editor,Viewer
 */
router.get('/', hasPermission('orders', 'read'), getOrders);

/**
 * @route   GET /api/admin/orders/stats
 * @desc    Get order statistics
 * @access  Private/Admin,Editor,Viewer
 */
router.get('/stats', hasPermission('orders', 'read'), getOrderStats);

/**
 * @route   POST /api/admin/orders
 * @desc    Create new order (manual order)
 * @access  Private/Admin,Editor (requires write permission)
 */
router.post('/', hasPermission('orders', 'write'), createOrder);

/**
 * @route   PUT /api/admin/orders/bulk/status
 * @desc    Bulk update order status
 * @access  Private/Admin,Editor (requires write permission)
 */
router.put('/bulk/status', hasPermission('orders', 'write'), bulkUpdateOrderStatus);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get single order by ID
 * @access  Private/Admin,Editor,Viewer
 */
router.get('/:id', hasPermission('orders', 'read'), getOrder);

/**
 * @route   GET /api/admin/orders/:id/timeline
 * @desc    Get order timeline/history
 * @access  Private/Admin,Editor,Viewer
 */
router.get('/:id/timeline', hasPermission('orders', 'read'), getOrderTimeline);

/**
 * @route   PUT /api/admin/orders/:id
 * @desc    Update order details
 * @access  Private/Admin,Editor (requires write permission)
 */
router.put('/:id', hasPermission('orders', 'write'), updateOrder);

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin,Editor (requires write permission)
 */
router.put('/:id/status', hasPermission('orders', 'write'), updateOrderStatus);

/**
 * @route   PUT /api/admin/orders/:id/fulfill
 * @desc    Update order fulfillment (mark as shipped)
 * @access  Private/Admin,Editor (requires write permission)
 */
router.put('/:id/fulfill', hasPermission('orders', 'write'), fulfillOrder);

/**
 * @route   DELETE /api/admin/orders/:id
 * @desc    Delete (cancel) order
 * @access  Private/Admin (requires delete permission)
 */
router.delete('/:id', hasPermission('orders', 'delete'), deleteOrder);

// FIX: Change module.exports to export default
export default router;