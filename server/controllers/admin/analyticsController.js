import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Customer from '../../models/Customer.js';

/**
 * @desc    Get sales data
 * @route   GET /api/admin/analytics/sales
 * @access  Private/Admin
 */
export const getSalesData = asyncHandler(async (req, res) => {
  const { timeRange = 'month' } = req.query;
  
  // Calculate date range based on timeRange
  const today = new Date();
  let startDate;
  
  switch (timeRange) {
    case 'week':
      startDate = new Date(today.setDate(today.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      break;
    case 'quarter':
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      break;
    case 'year':
      startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      break;
    default:
      startDate = new Date(today.setDate(today.getDate() - 30));
      break;
  }
  
  // Get sales data grouped by day
  const salesData = await Order.aggregate([
    {
      $match: {
        placedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$placedAt'
          }
        },
        totalSales: { $sum: '$total' },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Format the response
  const formattedData = salesData.map(item => ({
    date: item._id,
    totalSales: item.totalSales,
    orderCount: item.orderCount,
    avgOrderValue: item.avgOrderValue
  }));
  
  // Calculate totals
  const totals = salesData.reduce((acc, item) => ({
    totalRevenue: acc.totalRevenue + item.totalSales,
    totalOrders: acc.totalOrders + item.orderCount
  }), { totalRevenue: 0, totalOrders: 0 });
  
  res.status(200).json({
    success: true,
    data: {
      chartData: formattedData,
      totals,
      timeRange
    }
  });
});

/**
 * @desc    Get revenue statistics
 * @route   GET /api/admin/analytics/revenue
 * @access  Private/Admin
 */
export const getRevenueStats = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
  const today = new Date();
  let startDate;
  let comparisonStartDate;
  
  // Set date ranges based on period
  switch (period) {
    case 'week':
      startDate = new Date(today.setDate(today.getDate() - 7));
      comparisonStartDate = new Date(today.setDate(today.getDate() - 14));
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      comparisonStartDate = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
      break;
    case 'quarter':
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      comparisonStartDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
      break;
    case 'year':
      startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      comparisonStartDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
      break;
    default:
      startDate = new Date(today.setDate(today.getDate() - 30));
      comparisonStartDate = new Date(today.setDate(today.getDate() - 60));
      break;
  }
  
  const endDate = new Date();
  const comparisonEndDate = startDate;
  
  // Get current period revenue
  const [currentPeriod, previousPeriod] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          placedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      }
    ]),
    
    Order.aggregate([
      {
        $match: {
          placedAt: { $gte: comparisonStartDate, $lte: comparisonEndDate }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      }
    ])
  ]);
  
  const currentRevenue = currentPeriod[0]?.revenue || 0;
  const previousRevenue = previousPeriod[0]?.revenue || 0;
  
  // Calculate growth
  const growth = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : currentRevenue > 0 ? 100 : 0;
  
  res.status(200).json({
    success: true,
    data: {
      current: currentRevenue,
      previous: previousRevenue,
      growth: parseFloat(growth.toFixed(2)),
      period,
      currency: 'KSH'
    }
  });
});

/**
 * @desc    Get category sales data
 * @route   GET /api/admin/analytics/categories
 * @access  Private/Admin
 */
export const getCategorySales = asyncHandler(async (req, res) => {
  const { timeRange = 'month' } = req.query;
  
  // Calculate date range
  const today = new Date();
  let startDate;
  
  switch (timeRange) {
    case 'week':
      startDate = new Date(today.setDate(today.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      break;
    case 'quarter':
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      break;
    case 'year':
      startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      break;
    default:
      startDate = new Date(today.setDate(today.getDate() - 30));
      break;
  }
  
  // Get sales by category
  const categorySales = await Order.aggregate([
    {
      $match: {
        placedAt: { $gte: startDate }
      }
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        unitsSold: { $sum: '$items.quantity' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } }
  ]);
  
  // Format the response
  const formattedData = categorySales.map(category => ({
    name: category._id || 'Uncategorized',
    value: category.revenue,
    revenue: category.revenue,
    unitsSold: category.unitsSold,
    orders: category.orders,
    percentage: 0 // Will calculate below
  }));
  
  // Calculate total revenue for percentages
  const totalRevenue = formattedData.reduce((sum, item) => sum + item.revenue, 0);
  
  // Add percentages
  const dataWithPercentages = formattedData.map(item => ({
    ...item,
    percentage: totalRevenue > 0 ? parseFloat(((item.revenue / totalRevenue) * 100).toFixed(2)) : 0
  }));
  
  res.status(200).json({
    success: true,
    data: dataWithPercentages,
    totalRevenue,
    currency: 'KSH'
  });
});

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/admin/analytics/dashboard
 * @access  Private/Admin
 */
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Yesterday for comparison
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

  // Last month for comparison
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);

  // Execute all analytics queries in parallel
  const [
    revenueStats,
    orderStats,
    productStats,
    customerStats,
    todayRevenue,
    yesterdayRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    topProducts,
    recentOrders,
    salesByCategory,
    orderStatusStats,
    revenueChartData,
    topCustomers
  ] = await Promise.all([
    // Total revenue stats
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          monthlyRevenue: {
            $sum: {
              $cond: [{ $gte: ['$placedAt', startOfMonth] }, '$total', 0]
            }
          },
          yearlyRevenue: {
            $sum: {
              $cond: [{ $gte: ['$placedAt', startOfYear] }, '$total', 0]
            }
          }
        }
      }
    ]),

    // Order statistics
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          monthlyOrders: {
            $sum: {
              $cond: [{ $gte: ['$placedAt', startOfMonth] }, 1, 0]
            }
          },
          todayOrders: {
            $sum: {
              $cond: [{ $gte: ['$placedAt', startOfToday] }, 1, 0]
            }
          },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]),

    // Product statistics
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } },
          lowStock: {
            $sum: {
              $cond: [{ $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', 10] }] }, 1, 0]
            }
          },
          totalInventoryValue: { 
            $sum: { $multiply: ['$price', '$quantity'] } 
          }
        }
      }
    ]),

    // Customer statistics
    Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          newCustomersThisMonth: {
            $sum: {
              $cond: [{ $gte: ['$accountCreated', startOfMonth] }, 1, 0]
            }
          },
          activeCustomers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'active'] },
                    { $gte: ['$lastOrderDate', startOfMonth] }
                  ]
                },
                1,
                0
              ]
            }
          },
          avgCustomerValue: { $avg: '$totalSpent' }
        }
      }
    ]),

    // Today's revenue
    Order.aggregate([
      { $match: { placedAt: { $gte: startOfToday } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } }
    ]),

    // Yesterday's revenue
    Order.aggregate([
      { $match: { placedAt: { $gte: startOfYesterday, $lte: endOfYesterday } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } }
    ]),

    // This month's revenue
    Order.aggregate([
      { $match: { placedAt: { $gte: startOfMonth } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } }
    ]),

    // Last month's revenue
    Order.aggregate([
      { $match: { placedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } }
    ]),

    // Top selling products (last 30 days)
    Order.aggregate([
      { 
        $match: { 
          placedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]),

    // Recent orders (last 10)
    Order.find()
      .sort({ placedAt: -1 })
      .limit(10)
      .select('orderNumber customer.name total status placedAt paymentStatus')
      .lean(),

    // Sales by category (last 30 days)
    Order.aggregate([
      { 
        $match: { 
          placedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          unitsSold: { $sum: '$items.quantity' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    // Order status statistics
    Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { count: -1 } }
    ]),

    // Revenue chart data (last 30 days)
    Order.aggregate([
      { 
        $match: { 
          placedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$placedAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Top customers (by revenue)
    Customer.aggregate([
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: { $concat: ['$firstName', ' ', '$lastName'] },
          email: 1,
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: { $cond: [{ $eq: ['$totalOrders', 0] }, 0, { $divide: ['$totalSpent', '$totalOrders'] }] },
          lastOrderDate: 1
        }
      }
    ])
  ]);

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const todayRevenueValue = todayRevenue[0]?.revenue || 0;
  const yesterdayRevenueValue = yesterdayRevenue[0]?.revenue || 0;
  const thisMonthRevenueValue = thisMonthRevenue[0]?.revenue || 0;
  const lastMonthRevenueValue = lastMonthRevenue[0]?.revenue || 0;

  const revenueGrowthToday = calculateGrowth(todayRevenueValue, yesterdayRevenueValue);
  const revenueGrowthMonth = calculateGrowth(thisMonthRevenueValue, lastMonthRevenueValue);

  // Format the response with KSH currency
  const dashboardData = {
    overview: {
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        today: todayRevenueValue,
        monthly: thisMonthRevenueValue,
        yearly: revenueStats[0]?.yearlyRevenue || 0,
        growthToday: parseFloat(revenueGrowthToday.toFixed(2)),
        growthMonth: parseFloat(revenueGrowthMonth.toFixed(2)),
        currency: 'KSH'
      },
      orders: {
        total: orderStats[0]?.totalOrders || 0,
        today: orderStats[0]?.todayOrders || 0,
        monthly: orderStats[0]?.monthlyOrders || 0,
        averageValue: orderStats[0]?.avgOrderValue || 0,
        currency: 'KSH'
      },
      products: {
        total: productStats[0]?.totalProducts || 0,
        active: productStats[0]?.activeProducts || 0,
        outOfStock: productStats[0]?.outOfStock || 0,
        lowStock: productStats[0]?.lowStock || 0,
        inventoryValue: productStats[0]?.totalInventoryValue || 0,
        currency: 'KSH'
      },
      customers: {
        total: customerStats[0]?.totalCustomers || 0,
        newThisMonth: customerStats[0]?.newCustomersThisMonth || 0,
        active: customerStats[0]?.activeCustomers || 0,
        averageValue: customerStats[0]?.avgCustomerValue || 0,
        currency: 'KSH'
      }
    },
    charts: {
      revenueByDay: revenueChartData.map(item => ({
        date: item._id,
        revenue: item.revenue,
        orders: item.orders,
        avgOrderValue: item.avgOrderValue,
        currency: 'KSH'
      })),
      salesByCategory: salesByCategory.map(item => ({
        category: item._id || 'Uncategorized',
        revenue: item.revenue,
        unitsSold: item.unitsSold,
        orders: item.orders,
        currency: 'KSH'
      })),
      orderStatus: orderStatusStats.map(item => ({
        status: item._id,
        count: item.count,
        revenue: item.revenue,
        currency: 'KSH'
      }))
    },
    topProducts: topProducts.map(product => ({
      id: product._id,
      name: product.name,
      sold: product.totalSold,
      revenue: product.totalRevenue,
      currency: 'KSH'
    })),
    topCustomers: topCustomers.map(customer => ({
      ...customer,
      totalSpent: customer.totalSpent,
      avgOrderValue: customer.avgOrderValue,
      currency: 'KSH'
    })),
    recentOrders: recentOrders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer?.name || 'Unknown',
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      date: order.placedAt,
      formattedDate: new Date(order.placedAt).toLocaleDateString(),
      currency: 'KSH'
    })),
    currency: 'KSH'
  };

  res.status(200).json({
    success: true,
    data: dashboardData
  });
});

/**
 * @desc    Get sales analytics report
 * @route   GET /api/admin/analytics/sales-report
 * @access  Private/Admin
 */
export const getSalesReport = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    period = 'day',
    category,
    groupBy = 'date'
  } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchStage = { placedAt: dateFilter };

  // Add category filter if provided
  if (category) {
    matchStage['items.product.category'] = category;
  }

  // Set date format based on period
  let dateFormat;
  switch (period) {
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

  // Determine grouping
  let groupStage;
  if (groupBy === 'category') {
    groupStage = {
      _id: '$product.category',
      revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
      unitsSold: { $sum: '$items.quantity' },
      orders: { $sum: 1 },
      avgOrderValue: { $avg: '$order.total' }
    };
  } else {
    groupStage = {
      _id: {
        $dateToString: {
          format: dateFormat,
          date: '$placedAt'
        }
      },
      revenue: { $sum: '$total' },
      unitsSold: { $sum: { $sum: '$items.quantity' } },
      orders: { $sum: 1 },
      avgOrderValue: { $avg: '$total' }
    };
  }

  const [
    timelineData,
    categoryData,
    topProducts,
    paymentMethodData,
    customerData,
    summary
  ] = await Promise.all([
    // Timeline data
    Order.aggregate([
      { $match: matchStage },
      {
        $group: groupStage
      },
      { $sort: { _id: 1 } }
    ]),

    // Category breakdown
    Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          unitsSold: { $sum: '$items.quantity' },
          orders: { $sum: 1 },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    // Top products
    Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          avgPrice: { $avg: '$items.price' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 }
    ]),

    // Payment method breakdown
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    // Customer analytics
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$customer.email',
          name: { $first: '$customer.name' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          firstOrder: { $min: '$placedAt' },
          lastOrder: { $max: '$placedAt' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 }
    ]),

    // Summary statistics
    Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          totalUnitsSold: { $sum: { $sum: '$items.quantity' } },
          avgOrderValue: { $avg: '$total' },
          maxOrderValue: { $max: '$total' },
          minOrderValue: { $min: '$total' }
        }
      }
    ])
  ]);

  // Calculate additional metrics
  const summaryData = summary[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalUnitsSold: 0,
    avgOrderValue: 0,
    maxOrderValue: 0,
    minOrderValue: 0
  };

  // Calculate conversion rate (if we had visitor data)
  const conversionRate = summaryData.totalOrders > 0 ? 2.5 : 0; // Placeholder

  // Calculate average units per order
  const avgUnitsPerOrder = summaryData.totalOrders > 0 
    ? summaryData.totalUnitsSold / summaryData.totalOrders 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        ...summaryData,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        avgUnitsPerOrder: parseFloat(avgUnitsPerOrder.toFixed(2)),
        currency: 'KSH'
      },
      timeline: timelineData.map(item => ({
        ...item,
        currency: 'KSH'
      })),
      byCategory: categoryData.map(item => ({
        ...item,
        currency: 'KSH'
      })),
      topProducts: topProducts.map(product => ({
        ...product,
        currency: 'KSH'
      })),
      byPaymentMethod: paymentMethodData.map(item => ({
        ...item,
        currency: 'KSH'
      })),
      topCustomers: customerData.map(customer => ({
        ...customer,
        currency: 'KSH'
      })),
      currency: 'KSH'
    }
  });
});

/**
 * @desc    Get customer analytics
 * @route   GET /api/admin/analytics/customers
 * @access  Private/Admin
 */
export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate,
    segment = 'all'
  } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchStage = dateFilter.$gte || dateFilter.$lte 
    ? { lastOrderDate: dateFilter }
    : {};

  // Apply segmentation
  let segmentFilter = {};
  switch (segment) {
    case 'new':
      segmentFilter = { totalOrders: 1 };
      break;
    case 'returning':
      segmentFilter = { totalOrders: { $gt: 1 } };
      break;
    case 'active':
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      segmentFilter = { lastOrderDate: { $gte: thirtyDaysAgo } };
      break;
    case 'inactive':
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      segmentFilter = { lastOrderDate: { $lt: sixMonthsAgo } };
      break;
    case 'highValue':
      segmentFilter = { totalSpent: { $gte: 1000 } };
      break;
  }

  const finalMatchStage = { ...matchStage, ...segmentFilter };

  const [
    customerStats,
    acquisitionData,
    lifetimeValueData,
    geographicData,
    topCustomers,
    customerSegments
  ] = await Promise.all([
    // Customer statistics
    Customer.aggregate([
      { $match: finalMatchStage },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' },
          avgCustomerValue: { $avg: '$totalSpent' },
          avgOrdersPerCustomer: { $avg: '$totalOrders' },
          newCustomers: {
            $sum: {
              $cond: [{ $gte: ['$accountCreated', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0]
            }
          }
        }
      }
    ]),

    // Customer acquisition over time
    Customer.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$accountCreated'
            }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]),

    // Customer lifetime value analysis
    Customer.aggregate([
      { $match: finalMatchStage },
      {
        $bucket: {
          groupBy: '$totalSpent',
          boundaries: [0, 1000, 5000, 10000, 50000, 100000, Infinity], // Converted to KSH
          default: '100000+',
          output: {
            count: { $sum: 1 },
            customers: { 
              $push: {
                name: { $concat: ['$firstName', ' ', '$lastName'] },
                email: '$email',
                totalSpent: '$totalSpent',
                totalOrders: '$totalOrders'
              }
            },
            avgOrders: { $avg: '$totalOrders' },
            avgValue: { $avg: '$totalSpent' }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Geographic distribution
    Order.aggregate([
      { $match: finalMatchStage },
      {
        $group: {
          _id: '$shippingAddress.country',
          customers: { $addToSet: '$customer.email' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $project: {
          country: '$_id',
          customerCount: { $size: '$customers' },
          orders: 1,
          revenue: 1,
          avgOrderValue: { $divide: ['$revenue', '$orders'] }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]),

    // Top customers
    Customer.aggregate([
      { $match: finalMatchStage },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 },
      {
        $project: {
          name: { $concat: ['$firstName', ' ', '$lastName'] },
          email: 1,
          phone: 1,
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: { $cond: [{ $eq: ['$totalOrders', 0] }, 0, { $divide: ['$totalSpent', '$totalOrders'] }] },
          firstOrderDate: 1,
          lastOrderDate: 1,
          daysSinceLastOrder: {
            $cond: [
              { $eq: ['$lastOrderDate', null] },
              null,
              {
                $divide: [
                  { $subtract: [new Date(), '$lastOrderDate'] },
                  1000 * 60 * 60 * 24
                ]
              }
            ]
          }
        }
      }
    ]),

    // Customer segmentation by order frequency
    Customer.aggregate([
      { $match: finalMatchStage },
      {
        $bucket: {
          groupBy: '$totalOrders',
          boundaries: [1, 2, 3, 5, 10, 20, Infinity],
          default: '20+',
          output: {
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalSpent' },
            avgRevenue: { $avg: '$totalSpent' }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Calculate retention rate (simplified)
  const totalCustomers = customerStats[0]?.totalCustomers || 0;
  const returningCustomers = customerSegments.reduce((sum, segment) => {
    const minOrders = parseInt(segment._id) || 0;
    return minOrders > 1 ? sum + segment.count : sum;
  }, 0);

  const retentionRate = totalCustomers > 0 
    ? (returningCustomers / totalCustomers) * 100 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      overview: {
        ...(customerStats[0] || {
          totalCustomers: 0,
          totalRevenue: 0,
          avgCustomerValue: 0,
          avgOrdersPerCustomer: 0,
          newCustomers: 0
        }),
        retentionRate: parseFloat(retentionRate.toFixed(2)),
        currency: 'KSH'
      },
      acquisition: acquisitionData,
      lifetimeValue: lifetimeValueData.map(item => ({
        ...item,
        currency: 'KSH'
      })),
      geographic: geographicData.map(item => ({
        ...item,
        currency: 'KSH'
      })),
      topCustomers: topCustomers.map(customer => ({
        ...customer,
        currency: 'KSH'
      })),
      segments: {
        byOrderFrequency: customerSegments.map(segment => ({
          ...segment,
          currency: 'KSH'
        })),
        bySpending: lifetimeValueData.map(item => ({
          ...item,
          currency: 'KSH'
        }))
      },
      currency: 'KSH'
    }
  });
});

/**
 * @desc    Get product analytics
 * @route   GET /api/admin/analytics/products
 * @access  Private/Admin
 */
export const getProductAnalytics = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate,
    category 
  } = req.query;

  // Build date filter for orders
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const orderMatchStage = dateFilter.$gte || dateFilter.$lte 
    ? { placedAt: dateFilter }
    : {};

  // Build product filter
  const productMatchStage = {};
  if (category) {
    productMatchStage.category = category;
  }

  const [
    productStats,
    categoryStats,
    inventoryAnalysis,
    performanceAnalysis,
    topProducts,
    lowStockProducts
  ] = await Promise.all([
    // Overall product statistics
    Product.aggregate([
      { $match: productMatchStage },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalInventoryValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          totalInventory: { $sum: '$quantity' },
          avgPrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' }
        }
      }
    ]),

    // Category breakdown
    Product.aggregate([
      { $match: productMatchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          totalInventory: { $sum: '$quantity' },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]),

    // Inventory analysis
    Product.aggregate([
      { $match: productMatchStage },
      {
        $bucket: {
          groupBy: '$quantity',
          boundaries: [0, 1, 10, 50, 100, 500, 1000, Infinity],
          default: '1000+',
          output: {
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Product performance (sales data)
    Order.aggregate([
      { $match: orderMatchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orders: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          name: 1,
          unitsSold: 1,
          revenue: 1,
          ordersCount: { $size: '$orders' }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    // Top performing products
    Order.aggregate([
      { $match: orderMatchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]),

    // Low stock products
    Product.find({
      ...productMatchStage,
      quantity: { $lt: 10, $gt: 0 }
    })
    .select('name sku quantity price')
    .sort({ quantity: 1 })
    .limit(10)
  ]);
  
  // Combine product performance with inventory data
  const performanceMap = new Map(performanceAnalysis.map(p => [p._id.toString(), p]));

  const topProductsFormatted = topProducts.map(p => ({
    id: p._id,
    name: p.name,
    sku: p.product.sku,
    unitsSold: p.unitsSold,
    revenue: p.revenue,
    stock: p.product.quantity,
    price: p.product.price,
    currency: 'KSH'
  }));

  const lowStockFormatted = lowStockProducts.map(p => ({
    id: p._id,
    name: p.name,
    sku: p.sku,
    quantity: p.quantity,
    price: p.price,
    currency: 'KSH'
  }));

  res.status(200).json({
    success: true,
    data: {
      overview: {
        ...(productStats[0] || {}),
        currency: 'KSH'
      },
      byCategory: categoryStats.map(cat => ({
        ...cat,
        currency: 'KSH'
      })),
      inventoryDistribution: inventoryAnalysis.map(inv => ({
        ...inv,
        currency: 'KSH'
      })),
      topProducts: topProductsFormatted,
      lowStock: lowStockFormatted,
      performanceData: Array.from(performanceMap.values()).map(perf => ({
        ...perf,
        currency: 'KSH'
      })),
      currency: 'KSH'
    }
  });
});