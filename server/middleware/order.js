// server/middleware/order.js
import Order from '../models/Order.js';

/**
 * Validate that the user has access to the order
 */
export const validateOrderAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    // req.user comes from protectUser middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this order'
      });
    }

    // Attach order to request for later use
    req.order = order;
    next();
  } catch (error) {
    console.error('Order access validation error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error validating order access'
    });
  }
};

/**
 * Validate order status transition
 */
export const validateOrderStatusTransition = (req, res, next) => {
  try {
    const { status } = req.body;
    const currentStatus = req.order.status;

    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['refunded'],
      'cancelled': [],
      'refunded': []
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${currentStatus} to ${status}`
      });
    }

    next();
  } catch (error) {
    console.error('Status transition validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating status transition'
    });
  }
};

/**
 * Validate checkout data
 */
export const validateCheckout = (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    const errors = {};

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.items = 'Cart cannot be empty';
    } else {
      items.forEach((item, index) => {
        if (!item.productId) {
          errors[`items[${index}].productId`] = 'Product ID is required';
        }
        if (!item.quantity || item.quantity < 1) {
          errors[`items[${index}].quantity`] = 'Quantity must be at least 1';
        }
      });
    }

    // Validate shipping address
    if (!shippingAddress) {
      errors.shippingAddress = 'Shipping address is required';
    } else {
      const requiredFields = ['fullName', 'addressLine', 'city', 'county', 'phone'];
      requiredFields.forEach(field => {
        if (!shippingAddress[field]) {
          errors[`shippingAddress.${field}`] = `${field} is required`;
        }
      });
    }

    // Validate payment method
    const validPaymentMethods = ['mpesa', 'card', 'cash_on_delivery', 'bank_transfer'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      errors.paymentMethod = `Payment method must be one of: ${validPaymentMethods.join(', ')}`;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('Checkout validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating checkout data'
    });
  }
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (req, res, next) => {
  try {
    const order = req.order;

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is ${order.status}`
      });
    }

    next();
  } catch (error) {
    console.error('Cancel order validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking if order can be cancelled'
    });
  }
};

/**
 * Check if order can be returned
 */
export const canReturnOrder = (req, res, next) => {
  try {
    const order = req.order;

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

    next();
  } catch (error) {
    console.error('Return order validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking if order can be returned'
    });
  }
};

export default {
  validateOrderAccess,
  validateOrderStatusTransition,
  validateCheckout,
  canCancelOrder,
  canReturnOrder
};