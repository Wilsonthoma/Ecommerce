// controllers/admin/customerController.js

import asyncHandler from 'express-async-handler';
import Customer from '../../models/Customer.js';
import Order from '../../models/Order.js';

/**
 * Helper - handles cases where customer is stored differently in Order model
 */
const getCustomerOrderQuery = (customerId) => ({
  $or: [
    { customer: customerId },
    { 'customer.id': customerId },
    { 'customer._id': customerId }
  ]
});

// ============================================================================
//  GET ALL CUSTOMERS
// ============================================================================
export const getAllCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;

  const query = {};

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [
      { name: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  if (status) {
    query.status = status;
  }

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
    select: '-password'
  };

  const customers = await Customer.paginate(query, options);

  res.json({
    success: true,
    customers: customers.docs,
    page: customers.page,
    pages: customers.totalPages,
    total: customers.totalDocs
  });
});

// ============================================================================
//  GET SINGLE CUSTOMER
// ============================================================================
export const getCustomerById = asyncHandler(async (req, res) => {
  const customerId = req.params.id;

  const customer = await Customer.findById(customerId).select('-password');

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const orderQuery = getCustomerOrderQuery(customerId);

  const orders = await Order.find(orderQuery)
    .sort({ createdAt: -1 })
    .limit(10);

  const totalOrders = await Order.countDocuments(orderQuery);

  const totalSpentAgg = await Order.aggregate([
    { $match: { ...orderQuery, status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const totalSpent = totalSpentAgg[0]?.total || 0;

  res.json({
    success: true,
    customer,
    statistics: {
      totalOrders,
      totalSpent,
      averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
    },
    recentOrders: orders
  });
});

// ============================================================================
//  UPDATE CUSTOMER DETAILS
// ============================================================================
export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const { name, email, phone, address, status, notes } = req.body;

  if (email && email !== customer.email) {
    const emailExists = await Customer.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    customer.email = email;
  }

  if (name) customer.name = name;
  if (phone) customer.phone = phone;
  if (address) customer.address = address;
  if (status) customer.status = status;
  if (notes) customer.notes = notes;

  const updatedCustomer = await customer.save();

  res.json({
    success: true,
    message: 'Customer updated successfully',
    customer: updatedCustomer
  });
});

// ============================================================================
//  UPDATE CUSTOMER STATUS (MISSING FUNCTION - NOW FIXED)
// ============================================================================
export const updateCustomerStatus = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  if (!req.body.status) {
    res.status(400);
    throw new Error('Status is required');
  }

  customer.status = req.body.status;

  await customer.save();

  res.json({
    success: true,
    message: 'Customer status updated successfully',
    customer
  });
});

// ============================================================================
//  DELETE CUSTOMER
// ============================================================================
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const orderQuery = getCustomerOrderQuery(req.params.id);

  const hasOrders = await Order.exists(orderQuery);
  if (hasOrders) {
    res.status(400);
    throw new Error('Cannot delete customer with existing orders');
  }

  await customer.deleteOne();

  res.json({
    success: true,
    message: 'Customer deleted successfully'
  });
});

// ============================================================================
//  GET CUSTOMER ORDERS (PAGINATED)
// ============================================================================
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = getCustomerOrderQuery(req.params.id);

  if (status) {
    query.status = status;
  }

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 }
  };

  const orders = await Order.paginate(query, options);

  res.json({
    success: true,
    orders: orders.docs,
    page: orders.page,
    pages: orders.totalPages,
    total: orders.totalDocs
  });
});

// ============================================================================
//  ADD CUSTOMER NOTE
// ============================================================================
export const addCustomerNote = asyncHandler(async (req, res) => {
  const { note } = req.body;

  if (!note) {
    res.status(400);
    throw new Error('Note is required');
  }

  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  customer.notes = customer.notes || [];
  customer.notes.push({
    note,
    createdBy: req.admin?.name || 'Admin User',
    createdAt: new Date()
  });

  await customer.save();

  res.json({
    success: true,
    message: 'Note added successfully',
    notes: customer.notes
  });
});

// ============================================================================
//  CUSTOMER STATISTICS
// ============================================================================
export const getCustomerStatistics = asyncHandler(async (req, res) => {
  const totalCustomers = await Customer.countDocuments();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  const newCustomersThisMonth = await Customer.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  const customersByStatus = await Customer.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const topCustomers = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: '$customer', totalSpent: { $sum: '$totalAmount' } } },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: '$customer' },
    {
      $project: {
        _id: '$customer._id',
        name: '$customer.name',
        email: '$customer.email',
        totalSpent: 1
      }
    }
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const customerGrowth = await Customer.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    success: true,
    statistics: {
      totalCustomers,
      newCustomersThisMonth,
      customersByStatus: customersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      topCustomers,
      customerGrowth
    }
  });
});

// ============================================================================
//  EXPORT CUSTOMERS (CSV)
// ============================================================================
export const exportCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().select('-password').lean();

  const sanitizeCSV = (value) => {
    if (value === null || value === undefined) return '';
    return `"${value.toString().replace(/"/g, '""')}"`;
  };

  const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Created At'];

  const rows = customers.map((c) => [
    sanitizeCSV(c._id),
    sanitizeCSV(c.name),
    sanitizeCSV(c.email),
    sanitizeCSV(c.phone || ''),
    sanitizeCSV(c.status),
    sanitizeCSV(new Date(c.createdAt).toLocaleDateString())
  ]);

  const csv = [
    headers.map(sanitizeCSV).join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n');

  res.header('Content-Type', 'text/csv');
  res.attachment('customers.csv');
  res.send(csv);
});
