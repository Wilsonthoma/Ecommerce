import express from 'express';
import Order from '../../models/Order.js';
import { protectUser } from '../../middleware/authMiddleware.js'; // ✅ FIXED: Changed from 'auth.js' to 'authMiddleware.js' and using protectUser
import { validateOrderAccess } from '../../middleware/order.js';

const router = express.Router();

// ==================== MIDDLEWARE ====================

// Apply protection to all routes - using protectUser for customer routes
router.use(protectUser); // ✅ FIXED: Using protectUser instead of protect

// ==================== HELPER FUNCTIONS ====================

/**
 * Format order for client response
 */
const formatOrderForClient = (order) => {
  const orderObj = order.toObject ? order.toObject() : { ...order };
  
  // Remove sensitive/internal fields
  delete orderObj.adminNotes;
  delete orderObj.ipAddress;
  delete orderObj.userAgent;
  
  // Add calculated fields
  orderObj.canCancel = ['pending', 'processing'].includes(orderObj.status);
  orderObj.canReturn = orderObj.status === 'delivered' && 
    (new Date() - new Date(orderObj.deliveredAt)) < 30 * 24 * 60 * 60 * 1000; // 30 days
  
  return orderObj;
};

// ==================== CLIENT ORDER ROUTES ====================

/**
 * GET /api/client/orders
 * Get all orders for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query;

    // Build query - only show user's own orders
    const query = { customer: req.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
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
        .populate('items.productId', 'name images price slug')
        .lean(),
      Order.countDocuments(query)
    ]);

    // Format orders for client
    const formattedOrders = orders.map(formatOrderForClient);

    res.json({
      success: true,
      orders: formattedOrders,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

/**
 * GET /api/client/orders/:id
 * Get single order by ID
 */
router.get('/:id', validateOrderAccess, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name images price slug')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const formattedOrder = formatOrderForClient(order);

    res.json({
      success: true,
      order: formattedOrder
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
 * PUT /api/client/orders/:id/cancel
 * Cancel an order
 */
router.put('/:id/cancel', validateOrderAccess, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is ${order.status}`
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      note: reason || 'Cancelled by customer',
      changedBy: req.user.id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: formatOrderForClient(order)
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

/**
 * GET /api/client/orders/:id/track
 * Track order status
 */
router.get('/:id/track', validateOrderAccess, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('orderNumber status statusHistory trackingNumber estimatedDelivery deliveredAt')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Format tracking info
    const tracking = {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      timeline: order.statusHistory.map(entry => ({
        status: entry.status,
        date: entry.changedAt,
        note: entry.note
      }))
    };

    res.json({
      success: true,
      tracking
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track order'
    });
  }
});

/**
 * POST /api/client/orders/:id/return
 * Request return for an order
 */
router.post('/:id/return', validateOrderAccess, async (req, res) => {
  try {
    const { items, reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be returned
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Only delivered orders can be returned'
      });
    }

    // Check if within return window (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (order.deliveredAt < thirtyDaysAgo) {
      return res.status(400).json({
        success: false,
        message: 'Return window has expired (30 days from delivery)'
      });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please specify items to return'
      });
    }

    // Update order with return request
    order.statusHistory.push({
      status: 'return_requested',
      note: `Return requested: ${reason}. Items: ${items.join(', ')}`,
      changedBy: req.user.id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Return request submitted successfully',
      returnId: `RET-${Date.now()}`
    });
  } catch (error) {
    console.error('Error requesting return:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request return'
    });
  }
});

/**
 * POST /api/client/orders/:id/reorder
 * Reorder previous order (add all items to cart)
 */
router.post('/:id/reorder', validateOrderAccess, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'price inStock quantity');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if products are still available
    const items = [];
    const unavailableItems = [];

    for (const item of order.items) {
      const product = item.productId;
      
      if (!product) {
        unavailableItems.push({
          name: item.name,
          reason: 'Product no longer exists'
        });
        continue;
      }

      if (product.inStock && product.quantity >= item.quantity) {
        items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: item.image
        });
      } else {
        unavailableItems.push({
          name: product.name,
          reason: 'Out of stock'
        });
      }
    }

    res.json({
      success: true,
      items,
      unavailableItems,
      message: unavailableItems.length > 0 
        ? 'Some items are no longer available' 
        : 'All items available for reorder'
    });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process reorder'
    });
  }
});

/**
 * POST /api/client/orders/:id/rate
 * Rate an order
 */
router.post('/:id/rate', validateOrderAccess, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if order can be rated (only delivered orders)
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Only delivered orders can be rated'
      });
    }

    // Add rating to order history
    order.statusHistory.push({
      status: 'rated',
      note: `Rating: ${rating}/5. Review: ${review || 'No review'}`,
      changedBy: req.user.id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Thank you for your rating!'
    });
  } catch (error) {
    console.error('Error rating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
});

/**
 * GET /api/client/orders/stats/summary
 * Get order statistics for the user
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { customer: req.user.id } },
      { $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }}
    ]);

    const summary = stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    };

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

export default router;