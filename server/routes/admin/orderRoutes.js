import express from 'express';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import { protect, admin } from '../../middleware/authMiddleware.js'; // ✅ FIXED: Changed from 'auth.js' to 'authMiddleware.js'
import { validateOrderAccess, validateOrderStatusTransition } from '../../middleware/order.js';

const router = express.Router();

// ==================== MIDDLEWARE ====================

// Apply protection and admin check to all routes
router.use(protect); // For admin authentication
router.use(admin);   // Ensure user is admin

// ==================== HELPER FUNCTIONS ====================

/**
 * Format order for admin response
 */
const formatOrderForAdmin = (order) => {
  const orderObj = order.toObject ? order.toObject() : { ...order };
  return orderObj;
};

// ==================== ADMIN ORDER ROUTES ====================

/**
 * GET /api/admin/orders
 * Get all orders with filtering and pagination (admin only)
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      customer,
      startDate,
      endDate,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (customer) {
      query.customer = customer;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { customerPhone: searchRegex }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build sort
    let sortOption = {};
    const sortFields = sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sortOption[field.substring(1)] = -1;
      } else {
        sortOption[field] = 1;
      }
    });

    // Execute queries
    const [orders, total] = await Promise.all([
      Order.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort(sortOption)
        .populate('customer', 'name email phone')
        .populate('items.productId', 'name sku')
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      orders,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

/**
 * GET /api/admin/orders/:id
 * Get single order by ID (admin only)
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone createdAt')
      .populate('items.productId', 'name sku price images')
      .populate('statusHistory.changedBy', 'name email')
      .populate('adminNotes.addedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

/**
 * PUT /api/admin/orders/:id/status
 * Update order status (admin only)
 */
router.put('/:id/status', validateOrderAccess, validateOrderStatusTransition, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = req.order; // From validateOrderAccess middleware

    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
      changedBy: req.user.id
    });

    // Set timestamps based on status
    const now = new Date();
    switch (status) {
      case 'shipped':
        order.shippedAt = now;
        break;
      case 'delivered':
        order.deliveredAt = now;
        break;
      case 'cancelled':
        order.cancelledAt = now;
        break;
      case 'refunded':
        order.refundedAt = now;
        break;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

/**
 * PUT /api/admin/orders/:id/payment
 * Update payment status (admin only)
 */
router.put('/:id/payment', validateOrderAccess, async (req, res) => {
  try {
    const { paymentStatus, transactionId, mpesaCode } = req.body;
    const order = req.order;

    // Update payment details
    order.paymentStatus = paymentStatus;
    order.paymentDetails = {
      ...order.paymentDetails,
      transactionId,
      mpesaCode,
      paidAt: paymentStatus === 'paid' ? new Date() : order.paymentDetails?.paidAt
    };

    order.statusHistory.push({
      status: order.status,
      note: `Payment status updated to ${paymentStatus}`,
      changedBy: req.user.id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
});

/**
 * POST /api/admin/orders/:id/notes
 * Add admin note to order
 */
router.post('/:id/notes', validateOrderAccess, async (req, res) => {
  try {
    const { note } = req.body;
    const order = req.order;

    order.adminNotes.push({
      note,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      note: order.adminNotes[order.adminNotes.length - 1]
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
});

/**
 * POST /api/admin/orders/:id/tracking
 * Update tracking information
 */
router.post('/:id/tracking', validateOrderAccess, async (req, res) => {
  try {
    const { trackingNumber, carrier } = req.body;
    const order = req.order;

    order.trackingNumber = trackingNumber;
    order.carrier = carrier;

    order.statusHistory.push({
      status: order.status,
      note: `Tracking updated: ${trackingNumber} (${carrier})`,
      changedBy: req.user.id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Tracking information updated',
      order
    });
  } catch (error) {
    console.error('Error updating tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tracking'
    });
  }
});

/**
 * GET /api/admin/orders/stats/dashboard
 * Get order statistics for dashboard
 */
router.get('/stats/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenue
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, status: 'pending' }),
      Order.countDocuments({ ...dateFilter, status: 'processing' }),
      Order.countDocuments({ ...dateFilter, status: 'shipped' }),
      Order.countDocuments({ ...dateFilter, status: 'delivered' }),
      Order.countDocuments({ ...dateFilter, status: 'cancelled' }),
      Order.aggregate([
        { $match: { ...dateFilter, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        revenue: revenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

/**
 * GET /api/admin/orders/recent/limit/:limit
 * Get recent orders for dashboard
 */
router.get('/recent/limit/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;

    const orders = await Order.find({})
      .sort('-createdAt')
      .limit(limit)
      .populate('customer', 'name email')
      .select('orderNumber customerName totalAmount status createdAt')
      .lean();

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders'
    });
  }
});

/**
 * DELETE /api/admin/orders/:id
 * Delete order (admin only - use with caution!)
 */
router.delete('/:id', validateOrderAccess, async (req, res) => {
  try {
    const order = req.order;

    // Soft delete - just mark as cancelled instead
    if (order.status !== 'cancelled' && order.status !== 'delivered') {
      order.status = 'cancelled';
      order.statusHistory.push({
        status: 'cancelled',
        note: 'Order deleted by admin',
        changedBy: req.user.id
      });
      await order.save();

      return res.json({
        success: true,
        message: 'Order cancelled successfully'
      });
    }

    // Hard delete only for cancelled orders
    await order.deleteOne();

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
});

export default router;