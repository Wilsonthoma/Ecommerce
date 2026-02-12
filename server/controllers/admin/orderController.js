// controllers/admin/orderController.js

import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js'; // FIX: Add .js extension
import Product from '../../models/Product.js'; // FIX: Add .js extension
import Customer from '../../models/Customer.js'; // FIX: Add .js extension
import { generateOrderNumber } from '../../utils/helpers.js'; // FIX: Convert to import/export

/**
 * @desc    Get all orders with advanced filtering
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const getOrders = asyncHandler(async (req, res) => { // FIX: Use export const
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    paymentMethod,
    customerEmail,
    customerName,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    sortBy = 'placedAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  // Status filter
  if (status) {
    query.status = status;
  }

  // Payment status filter
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  // Payment method filter
  if (paymentMethod) {
    query.paymentMethod = paymentMethod;
  }

  // Customer filters
  if (customerEmail) {
    query['customer.email'] = { $regex: customerEmail, $options: 'i' };
  }

  if (customerName) {
    query['customer.name'] = { $regex: customerName, $options: 'i' };
  }

  // Date range filter
  if (startDate || endDate) {
    query.placedAt = {};
    if (startDate) query.placedAt.$gte = new Date(startDate);
    if (endDate) query.placedAt.$lte = new Date(endDate);
  }

  // Amount range filter
  if (minAmount || maxAmount) {
    query.total = {};
    if (minAmount) query.total.$gte = parseFloat(minAmount);
    if (maxAmount) query.total.$lte = parseFloat(maxAmount);
  }

  // Search filter (search across multiple fields)
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.email': { $regex: search, $options: 'i' } },
      { trackingNumber: { $regex: search, $options: 'i' } },
      { transactionId: { $regex: search, $options: 'i' } },
      { 'items.name': { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.productId', 'name images sku')
      .lean(),
    Order.countDocuments(query)
  ]);

  // Add calculated fields
  const ordersWithDetails = orders.map(order => ({
    ...order,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    formattedTotal: `$${order.total.toFixed(2)}`,
    daysSincePlaced: Math.floor((new Date() - new Date(order.placedAt)) / (1000 * 60 * 60 * 24)),
    hasTracking: !!order.trackingNumber,
    isOverdue: order.status === 'processing' && 
               new Date() > new Date(order.placedAt.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
  }));

  // Calculate pagination
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Get available filters for UI
  const availableStatuses = await Order.distinct('status');
  const availablePaymentStatuses = await Order.distinct('paymentStatus');
  const availablePaymentMethods = await Order.distinct('paymentMethod');

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? parseInt(page) + 1 : null,
      prevPage: hasPrevPage ? parseInt(page) - 1 : null
    },
    filters: {
      statuses: availableStatuses,
      paymentStatuses: availablePaymentStatuses,
      paymentMethods: availablePaymentMethods
    },
    data: ordersWithDetails
  });
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/admin/orders/:id
 * @access  Private/Admin
 */
export const getOrder = asyncHandler(async (req, res) => { // FIX: Use export const
  const order = await Order.findById(req.params.id)
    .populate('items.productId', 'name images sku price category');

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Get customer information if exists
  let customer = null;
  if (order.customer?.email) {
    customer = await Customer.findOne({ email: order.customer.email });
  }

  // Get related orders from same customer
  const relatedOrders = await Order.find({
    'customer.email': order.customer.email,
    _id: { $ne: order._id }
  })
  .sort({ placedAt: -1 })
  .limit(5)
  .select('orderNumber total status placedAt');

  const orderData = order.toObject();
  orderData.customerDetails = customer;
  orderData.relatedOrders = relatedOrders;
  orderData.itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  res.status(200).json({
    success: true,
    data: orderData
  });
});

/**
 * @desc    Create new order (manual order creation by admin)
 * @route   POST /api/admin/orders
 * @access  Private/Admin
 */
export const createOrder = asyncHandler(async (req, res) => { // FIX: Use export const
  const {
    customer,
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingMethod,
    customerNote,
    adminNote
  } = req.body;

  // Validate required fields
  if (!customer || !customer.email || !customer.name) {
    return res.status(400).json({
      success: false,
      error: 'Customer email and name are required'
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one item is required'
    });
  }

  // Validate and process items
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    if (!item.productId || !item.quantity || !item.price) {
      return res.status(400).json({
        success: false,
        error: 'Each item must have productId, quantity, and price'
      });
    }

    // Get product details
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found: ${item.productId}`
      });
    }

    // Check stock availability
    if (product.quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
      });
    }

    const itemTotal = item.quantity * item.price;
    subtotal += itemTotal;

    processedItems.push({
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      price: item.price,
      total: itemTotal,
      image: product.images?.[0]?.url || null,
      sku: product.sku
    });

    // Update product stock
    product.quantity -= item.quantity;
    product.totalSold += item.quantity;
    await product.save();
  }

  // Calculate totals
  const shippingCost = shippingAddress ? 10 : 0; // Default shipping cost
  const tax = subtotal * 0.1; // 10% tax for example
  const total = subtotal + shippingCost + tax;

  // Generate order number
  const orderNumber = generateOrderNumber();

  // Create order
  const order = await Order.create({
    orderNumber,
    customer: {
      id: customer.id,
      email: customer.email.toLowerCase(),
      name: customer.name,
      phone: customer.phone
    },
    items: processedItems,
    shippingAddress: shippingAddress || null,
    billingAddress: billingAddress || shippingAddress || null,
    subtotal,
    shipping: shippingCost,
    tax,
    total,
    paymentMethod: paymentMethod || 'credit-card',
    paymentStatus: 'paid', // Manual orders are marked as paid
    shippingMethod: shippingMethod || 'standard',
    status: 'processing',
    customerNote,
    adminNote,
    source: 'admin',
    placedAt: new Date(),
    paidAt: new Date()
  });

  // Update customer statistics
  await Customer.findOneAndUpdate(
    { email: customer.email.toLowerCase() },
    {
      $setOnInsert: {
        firstName: customer.name.split(' ')[0],
        lastName: customer.name.split(' ').slice(1).join(' ') || '',
        email: customer.email.toLowerCase(),
        phone: customer.phone
      },
      $inc: {
        totalOrders: 1,
        totalSpent: total
      },
      $set: {
        lastOrderDate: new Date()
      }
    },
    { upsert: true, new: true }
  );

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => { // FIX: Use export const
  const { status, adminNote } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Status is required'
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Validate status transition
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status transition from ${order.status} to ${status}`
    });
  }

  const updateData = { status };
  
  // Set dates based on status
  switch (status) {
    case 'processing':
      updateData.processingAt = new Date();
      break;
    case 'shipped':
      updateData.shippedAt = new Date();
      break;
    case 'delivered':
      updateData.deliveredAt = new Date();
      break;
    case 'cancelled':
      updateData.cancelledAt = new Date();
      
      // Restore product stock if cancelled
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantity: item.quantity, totalSold: -item.quantity }
        });
      }
      break;
    case 'refunded':
      updateData.refundedAt = new Date();
      break;
  }

  // Add admin note if provided
  if (adminNote) {
    updateData.adminNote = adminNote;
  }

  // Add status history
  if (!order.statusHistory) {
    order.statusHistory = [];
  }
  
  order.statusHistory.push({
    status,
    date: new Date(),
    admin: req.admin.id,
    note: adminNote
  });

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { ...updateData, statusHistory: order.statusHistory },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: updatedOrder
  });
});

/**
 * @desc    Update order fulfillment details
 * @route   PUT /api/admin/orders/:id/fulfill
 * @access  Private/Admin
 */
export const fulfillOrder = asyncHandler(async (req, res) => { // FIX: Use export const
  const { trackingNumber, carrier, estimatedDelivery, adminNote } = req.body;

  if (!trackingNumber || !carrier) {
    return res.status(400).json({
      success: false,
      error: 'Tracking number and carrier are required'
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Check if order can be fulfilled
  if (order.status !== 'processing' && order.status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: `Order cannot be fulfilled in ${order.status} status`
    });
  }

  const updateData = {
    status: 'shipped',
    trackingNumber,
    carrier,
    shippedAt: new Date(),
    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null
  };

  if (adminNote) {
    updateData.adminNote = adminNote;
  }

  // Add fulfillment history
  if (!order.fulfillmentHistory) {
    order.fulfillmentHistory = [];
  }
  
  order.fulfillmentHistory.push({
    trackingNumber,
    carrier,
    date: new Date(),
    admin: req.admin.id,
    note: adminNote
  });

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { ...updateData, fulfillmentHistory: order.fulfillmentHistory },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Order marked as shipped',
    data: updatedOrder
  });
});

/**
 * @desc    Update order details
 * @route   PUT /api/admin/orders/:id
 * @access  Private/Admin
 */
export const updateOrder = asyncHandler(async (req, res) => { // FIX: Use export const
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Don't allow updating certain fields directly
  const restrictedFields = ['orderNumber', 'total', 'subtotal', 'tax', 'shipping', 'items'];
  const hasRestrictedFields = Object.keys(req.body).some(field => restrictedFields.includes(field));
  
  if (hasRestrictedFields) {
    return res.status(400).json({
      success: false,
      error: `Cannot update restricted fields: ${restrictedFields.join(', ')}`
    });
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: updatedOrder
  });
});

/**
 * @desc    Delete order (soft delete)
 * @route   DELETE /api/admin/orders/:id
 * @access  Private/Admin
 */
export const deleteOrder = asyncHandler(async (req, res) => { // FIX: Use export const
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Don't allow deleting fulfilled or delivered orders
  if (order.status === 'delivered' || order.status === 'shipped') {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete delivered or shipped orders'
    });
  }

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { quantity: item.quantity }
    });
  }

  // Soft delete by setting status to cancelled and adding deleted flag
  order.status = 'cancelled';
  order.isDeleted = true;
  order.deletedAt = new Date();
  order.deletedBy = req.admin.id;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully',
    data: order
  });
});

/**
 * @desc    Get order statistics
 * @route   GET /api/admin/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = asyncHandler(async (req, res) => { // FIX: Use export const
  const { startDate, endDate, groupBy = 'day' } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchStage = Object.keys(dateFilter).length > 0 
    ? { placedAt: dateFilter }
    : {};

  // Set date format for grouping
  let dateFormat;
  switch (groupBy) {
    case 'month':
      dateFormat = '%Y-%m';
      break;
    case 'week':
      dateFormat = '%Y-%U';
      break;
    case 'year':
      dateFormat = '%Y';
      break;
    case 'day':
    default:
      dateFormat = '%Y-%m-%d';
      break;
  }

  const [
    overview,
    statusStats,
    revenueByDate,
    paymentMethodStats,
    topCustomers,
    recentOrders
  ] = await Promise.all([
    // Overview statistics
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          maxOrderValue: { $max: '$total' },
          minOrderValue: { $min: '$total' },
          totalItemsSold: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]),

    // Status statistics
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
          avgValue: { $avg: '$total' }
        }
      },
      { $sort: { count: -1 } }
    ]),

    // Revenue by date
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$placedAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]),

    // Payment method statistics
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    // Top customers
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$customer.email',
          name: { $first: '$customer.name' },
          orders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          lastOrder: { $max: '$placedAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]),

    // Recent orders
    Order.find(matchStage)
      .sort({ placedAt: -1 })
      .limit(10)
      .select('orderNumber customer.name total status placedAt paymentStatus')
      .lean()
  ]);

  // Calculate growth compared to previous period
  const now = new Date();
  const previousPeriodStart = new Date(now);
  
  switch (groupBy) {
    case 'day':
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
      break;
    case 'week':
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
      break;
    case 'month':
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
      break;
  }

  const previousStats = await Order.aggregate([
    { 
      $match: { 
        placedAt: { 
          $gte: previousPeriodStart,
          $lt: startDate ? new Date(startDate) : now
        }
      } 
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    }
  ]);

  const currentRevenue = overview[0]?.totalRevenue || 0;
  const currentOrders = overview[0]?.totalOrders || 0;
  const previousRevenue = previousStats[0]?.revenue || 0;
  const previousOrders = previousStats[0]?.orders || 0;

  const revenueGrowth = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : currentRevenue > 0 ? 100 : 0;
  
  const ordersGrowth = previousOrders > 0 
    ? ((currentOrders - previousOrders) / previousOrders) * 100 
    : currentOrders > 0 ? 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      overview: {
        ...(overview[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          maxOrderValue: 0,
          minOrderValue: 0,
          totalItemsSold: 0
        }),
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        ordersGrowth: parseFloat(ordersGrowth.toFixed(2))
      },
      byStatus: statusStats,
      byDate: revenueByDate,
      byPaymentMethod: paymentMethodStats,
      topCustomers,
      recentOrders
    }
  });
});

/**
 * @desc    Bulk update order status
 * @route   PUT /api/admin/orders/bulk/status
 * @access  Private/Admin
 */
export const bulkUpdateOrderStatus = asyncHandler(async (req, res) => { // FIX: Use export const
  const { ids, status, adminNote } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an array of order IDs'
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Status is required'
    });
  }

  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  // Check if all orders exist and can be updated
  const orders = await Order.find({ _id: { $in: ids } });
  
  if (orders.length !== ids.length) {
    const foundIds = orders.map(order => order._id.toString());
    const missingIds = ids.filter(id => !foundIds.includes(id));
    
    return res.status(404).json({
      success: false,
      error: `Some orders not found: ${missingIds.join(', ')}`
    });
  }

  // Build update data
  const updateData = { status };
  const now = new Date();

  switch (status) {
    case 'processing':
      updateData.processingAt = now;
      break;
    case 'shipped':
      updateData.shippedAt = now;
      break;
    case 'delivered':
      updateData.deliveredAt = now;
      break;
    case 'cancelled':
      updateData.cancelledAt = now;
      break;
    case 'refunded':
      updateData.refundedAt = now;
      break;
  }

  if (adminNote) {
    updateData.adminNote = adminNote;
  }

  // Update orders
  const result = await Order.updateMany(
    { _id: { $in: ids } },
    updateData
  );

  // If cancelling orders, restore product stock
  if (status === 'cancelled') {
    for (const order of orders) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantity: item.quantity, totalSold: -item.quantity }
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} order(s) updated to ${status}`,
    data: result
  });
});

/**
 * @desc    Get order timeline (status history)
 * @route   GET /api/admin/orders/:id/timeline
 * @access  Private/Admin
 */
export const getOrderTimeline = asyncHandler(async (req, res) => { // FIX: Use export const
  const order = await Order.findById(req.params.id).select('statusHistory fulfillmentHistory');

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Combine and sort timeline events
  const timeline = [];

  // Add status changes
  if (order.statusHistory && order.statusHistory.length > 0) {
    order.statusHistory.forEach(event => {
      timeline.push({
        type: 'status',
        date: event.date,
        title: `Status changed to ${event.status}`,
        description: event.note || `Order status was updated`,
        admin: event.admin,
        data: { status: event.status }
      });
    });
  }

  // Add fulfillment events
  if (order.fulfillmentHistory && order.fulfillmentHistory.length > 0) {
    order.fulfillmentHistory.forEach(event => {
      timeline.push({
        type: 'fulfillment',
        date: event.date,
        title: `Shipped via ${event.carrier}`,
        description: `Tracking: ${event.trackingNumber}`,
        admin: event.admin,
        data: {
          carrier: event.carrier,
          trackingNumber: event.trackingNumber,
          note: event.note
        }
      });
    });
  }

  // Sort by date (newest first)
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.status(200).json({
    success: true,
    data: timeline
  });
});