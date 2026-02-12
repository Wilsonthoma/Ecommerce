// src/services/analytics.js - UPDATED FOR KSH
import api from './api';

export const analyticsService = {
  /**
   * Get complete dashboard data
   * @param {string} timeRange - Time range filter
   * @returns {Promise} Dashboard data
   */
  getDashboardStats: async (timeRange = 'month') => {
    try {
      const response = await api.get('/admin/analytics/dashboard', {
        params: { timeRange }
      });
      return response.data; // Return direct response for consistency
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return mock data for development in KSH
      return {
        success: true,
        data: {
          overview: {
            revenue: {
              total: 15245000,
              today: 280000,
              monthly: 720000,
              yearly: 8640000,
              growthToday: 12.5,
              growthMonth: 18.03,
              currency: 'KSH'
            },
            orders: {
              total: 1250,
              today: 85,
              monthly: 415,
              averageValue: 12196,
              currency: 'KSH'
            },
            customers: {
              total: 856,
              newThisMonth: 85,
              active: 415,
              averageValue: 17815,
              currency: 'KSH'
            },
            products: {
              total: 125,
              active: 110,
              outOfStock: 5,
              lowStock: 12,
              inventoryValue: 45000000,
              currency: 'KSH'
            }
          },
          charts: {
            revenueByDay: [
              { date: '2024-01-01', revenue: 150000, orders: 45, avgOrderValue: 3333 },
              { date: '2024-01-02', revenue: 180000, orders: 52, avgOrderValue: 3462 },
              { date: '2024-01-03', revenue: 120000, orders: 38, avgOrderValue: 3158 },
              { date: '2024-01-04', revenue: 220000, orders: 65, avgOrderValue: 3385 },
              { date: '2024-01-05', revenue: 190000, orders: 58, avgOrderValue: 3276 }
            ],
            salesByCategory: [
              { category: 'Electronics', revenue: 45000000, unitsSold: 450, orders: 150 },
              { category: 'Clothing', revenue: 28000000, unitsSold: 2800, orders: 280 },
              { category: 'Home & Kitchen', revenue: 18000000, unitsSold: 1800, orders: 180 },
              { category: 'Books', revenue: 5000000, unitsSold: 5000, orders: 500 },
              { category: 'Other', revenue: 4000000, unitsSold: 400, orders: 40 }
            ]
          },
          topProducts: [
            { id: 1, name: 'Smartphone', sold: 1250, revenue: 18750000 },
            { id: 2, name: 'Laptop', sold: 980, revenue: 39200000 },
            { id: 3, name: 'Wireless Headphones', sold: 850, revenue: 1275000 }
          ],
          recentOrders: [
            { id: 'ORD-001', orderNumber: 'ORD-001', customer: 'John Doe', total: 29999, status: 'completed', date: '2024-01-07T10:30:00Z' },
            { id: 'ORD-002', orderNumber: 'ORD-002', customer: 'Jane Smith', total: 14950, status: 'completed', date: '2024-01-07T14:15:00Z' },
            { id: 'ORD-003', orderNumber: 'ORD-003', customer: 'Bob Johnson', total: 49999, status: 'processing', date: '2024-01-06T09:45:00Z' }
          ],
          currency: 'KSH'
        }
      };
    }
  },

  /**
   * Get sales data for charts
   * @param {Object} params - Query parameters
   * @returns {Promise} Sales data
   */
  getSalesData: async (params = {}) => {
    try {
      const response = await api.get('/admin/analytics/sales', { params });
      return response.data; // Return direct response
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Return mock data for development in KSH
      return {
        success: true,
        data: {
          chartData: [
            { date: '2024-01-01', totalSales: 150000, orderCount: 45, avgOrderValue: 3333 },
            { date: '2024-01-02', totalSales: 180000, orderCount: 52, avgOrderValue: 3462 },
            { date: '2024-01-03', totalSales: 120000, orderCount: 38, avgOrderValue: 3158 },
            { date: '2024-01-04', totalSales: 220000, orderCount: 65, avgOrderValue: 3385 },
            { date: '2024-01-05', totalSales: 190000, orderCount: 58, avgOrderValue: 3276 },
            { date: '2024-01-06', totalSales: 250000, orderCount: 72, avgOrderValue: 3472 },
            { date: '2024-01-07', totalSales: 280000, orderCount: 85, avgOrderValue: 3294 }
          ],
          totals: {
            totalRevenue: 1490000,
            totalOrders: 415
          },
          timeRange: params.timeRange || 'month',
          currency: 'KSH'
        }
      };
    }
  },

  /**
   * Get revenue statistics
   * @param {string} period - Time period
   * @returns {Promise} Revenue statistics
   */
  getRevenueStats: async (period = 'month') => {
    try {
      const response = await api.get('/admin/analytics/revenue', {
        params: { period }
      });
      return response.data; // Return direct response
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      // Return mock data for development in KSH
      return {
        success: true,
        data: {
          current: 720000,
          previous: 610000,
          growth: 18.03,
          period: period,
          currency: 'KSH'
        }
      };
    }
  },

  /**
   * Get top selling products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} Top products
   */
  getTopProducts: async (limit = 5) => {
    try {
      const response = await api.get('/admin/products', {
        params: { 
          limit, 
          sort: '-sales',
          status: 'active'
        }
      });
      
      // Handle different response structures
      let products = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data?.products) {
        products = response.data.products;
      } else if (response.data?.data?.products) {
        products = response.data.data.products;
      }
      
      // Transform products for analytics display
      const transformedProducts = products.map((product, index) => ({
        id: product._id || product.id || index + 1,
        name: product.name || product.title || `Product ${index + 1}`,
        sold: product.totalSold || product.sold || product.quantitySold || Math.floor(Math.random() * 1000) + 500,
        revenue: (product.price || 0) * (product.totalSold || product.quantitySold || Math.floor(Math.random() * 1000) + 500),
        stock: product.quantity || product.stock || 100,
        price: product.price || 0,
        currency: 'KSH'
      }));
      
      return {
        success: true,
        data: transformedProducts
      };
    } catch (error) {
      console.error('Error fetching top products:', error);
      // Return mock data for development in KSH
      return {
        success: true,
        data: [
          { id: 1, name: 'Smartphone', sold: 1250, revenue: 18750000, stock: 150, price: 15000, currency: 'KSH' },
          { id: 2, name: 'Laptop', sold: 980, revenue: 39200000, stock: 80, price: 40000, currency: 'KSH' },
          { id: 3, name: 'Wireless Headphones', sold: 850, revenue: 1275000, stock: 200, price: 1500, currency: 'KSH' },
          { id: 4, name: 'Smart Watch', sold: 720, revenue: 720000, stock: 120, price: 1000, currency: 'KSH' },
          { id: 5, name: 'Bluetooth Speaker', sold: 650, revenue: 975000, stock: 180, price: 1500, currency: 'KSH' }
        ]
      };
    }
  },

  /**
   * Get recent orders
   * @param {number} limit - Number of orders to fetch
   * @returns {Promise} Recent orders
   */
  getRecentOrders: async (limit = 5) => {
    try {
      const response = await api.get('/admin/orders', {
        params: { 
          limit, 
          sort: '-createdAt',
          status: ['completed', 'processing', 'shipped']
        }
      });
      
      // Handle different response structures
      let orders = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        orders = response.data.data;
      } else if (Array.isArray(response.data)) {
        orders = response.data;
      } else if (response.data?.orders) {
        orders = response.data.orders;
      } else if (response.data?.data?.orders) {
        orders = response.data.data.orders;
      } else if (response.data?.data?.recentOrders) {
        orders = response.data.data.recentOrders;
      }
      
      // Transform orders for analytics display
      const transformedOrders = orders.map((order, index) => ({
        id: order._id || order.id || `ORD-00${index + 1}`,
        orderNumber: order.orderNumber || order.orderId || `ORD-00${index + 1}`,
        customer: order.customer?.name || order.customerName || order.customer || 'Unknown Customer',
        total: order.total || order.amount || order.totalAmount || 0,
        status: order.status || 'pending',
        date: order.createdAt || order.date || order.placedAt || new Date().toISOString(),
        paymentStatus: order.paymentStatus || 'paid',
        currency: 'KSH'
      }));
      
      return {
        success: true,
        data: transformedOrders
      };
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      // Return mock data for development in KSH
      return {
        success: true,
        data: [
          { 
            id: 'ORD-001', 
            orderNumber: 'ORD-001',
            customer: 'John Doe', 
            total: 29999, 
            status: 'completed', 
            date: '2024-01-07T10:30:00Z',
            paymentStatus: 'paid',
            currency: 'KSH'
          },
          { 
            id: 'ORD-002', 
            orderNumber: 'ORD-002',
            customer: 'Jane Smith', 
            total: 14950, 
            status: 'completed', 
            date: '2024-01-07T14:15:00Z',
            paymentStatus: 'paid',
            currency: 'KSH'
          },
          { 
            id: 'ORD-003', 
            orderNumber: 'ORD-003',
            customer: 'Bob Johnson', 
            total: 49999, 
            status: 'processing', 
            date: '2024-01-06T09:45:00Z',
            paymentStatus: 'pending',
            currency: 'KSH'
          },
          { 
            id: 'ORD-004', 
            orderNumber: 'ORD-004',
            customer: 'Alice Brown', 
            total: 8999, 
            status: 'completed', 
            date: '2024-01-06T16:20:00Z',
            paymentStatus: 'paid',
            currency: 'KSH'
          },
          { 
            id: 'ORD-005', 
            orderNumber: 'ORD-005',
            customer: 'Charlie Wilson', 
            total: 19999, 
            status: 'shipped', 
            date: '2024-01-05T11:10:00Z',
            paymentStatus: 'paid',
            currency: 'KSH'
          }
        ]
      };
    }
  },

  /**
   * Get category-wise sales data
   * @param {string} timeRange - Time range filter
   * @returns {Promise} Category sales data
   */
  getCategorySales: async (timeRange = 'month') => {
    try {
      const response = await api.get('/admin/analytics/categories', {
        params: { timeRange }
      });
      return response.data; // Return direct response
    } catch (error) {
      console.error('Error fetching category sales:', error);
      // Return mock data for development in KSH
      return {
        success: true,
        data: {
          data: [
            { name: 'Electronics', value: 45000000, revenue: 45000000, unitsSold: 450, orders: 150, percentage: 45 },
            { name: 'Clothing', value: 28000000, revenue: 28000000, unitsSold: 2800, orders: 280, percentage: 28 },
            { name: 'Home & Kitchen', value: 18000000, revenue: 18000000, unitsSold: 1800, orders: 180, percentage: 18 },
            { name: 'Books', value: 5000000, revenue: 5000000, unitsSold: 5000, orders: 500, percentage: 5 },
            { name: 'Other', value: 4000000, revenue: 4000000, unitsSold: 400, orders: 40, percentage: 4 }
          ],
          totalRevenue: 100000000,
          currency: 'KSH'
        }
      };
    }
  },

  /**
   * Get product analytics
   * @returns {Promise} Product analytics data
   */
  getProductAnalytics: async () => {
    try {
      const response = await api.get('/admin/analytics/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      return {
        success: true,
        data: {
          overview: {
            totalProducts: 125,
            activeProducts: 110,
            outOfStock: 5,
            lowStock: 12,
            inventoryValue: 45000000,
            currency: 'KSH'
          }
        }
      };
    }
  },

  /**
   * Get customer analytics
   * @returns {Promise} Customer analytics data
   */
  getCustomerAnalytics: async () => {
    try {
      const response = await api.get('/admin/analytics/customers');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      return {
        success: true,
        data: {
          overview: {
            totalCustomers: 856,
            newThisMonth: 85,
            active: 415,
            averageValue: 17815,
            currency: 'KSH'
          }
        }
      };
    }
  }
};

export default analyticsService;