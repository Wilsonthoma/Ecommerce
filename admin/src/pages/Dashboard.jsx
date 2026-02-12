import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { productService } from '../services/products';
import { orderService } from '../services/orders';
import { userService } from '../services/users';
import { analyticsService } from '../services/analytics';
import { formatCurrency, formatDate, formatKSH } from '../utils/formatters';
import SalesChart from '../components/charts/SalesChart';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeOrders: 0,
    recentOrders: [],
    topProducts: [],
    salesData: [],
    categoryData: [],
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Helper function to safely extract data from API responses
  const extractArrayData = (response) => {
    // Handle different response structures
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.products && Array.isArray(response.products)) return response.products;
    if (response?.orders && Array.isArray(response.orders)) return response.orders;
    if (response?.users && Array.isArray(response.users)) return response.users;
    if (response?.items && Array.isArray(response.items)) return response.items;
    return [];
  };

  const extractAnalyticsData = (response) => {
    // Handle analytics response structure
    if (!response) return { salesData: [], categoryData: [], previousPeriodRevenue: 0 };
    
    if (response.data) {
      return {
        salesData: response.data.salesData || response.data.chartData || [],
        categoryData: response.data.categoryData || response.data.categories || [],
        previousPeriodRevenue: response.data.previousPeriodRevenue || response.data.previousRevenue || 0
      };
    }
    
    return {
      salesData: response.salesData || response.chartData || [],
      categoryData: response.categoryData || response.categories || [],
      previousPeriodRevenue: response.previousPeriodRevenue || response.previousRevenue || 0
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [productsRes, ordersRes, usersRes, analyticsRes] = await Promise.all([
        productService.getAll({ limit: 100 }),
        orderService.getAll({ 
          timeRange,
          status: 'completed',
          limit: 100 
        }).catch(err => {
          console.error('Orders fetch error:', err);
          return { data: [] };
        }),
        userService.getAll({ limit: 100 }).catch(err => {
          console.error('Users fetch error:', err);
          return { data: [] };
        }),
        analyticsService.getDashboardStats(timeRange).catch(err => {
          console.error('Analytics fetch error:', err);
          return {};
        }),
      ]);

      // Extract data from responses
      const products = extractArrayData(productsRes);
      const orders = extractArrayData(ordersRes);
      const users = extractArrayData(usersRes);
      const analytics = extractAnalyticsData(analyticsRes);

      console.log('Dashboard data:', {
        productsCount: products.length,
        ordersCount: orders.length,
        usersCount: users.length,
        analytics
      });

      // Calculate statistics with safe defaults
      const completedOrders = Array.isArray(orders) 
        ? orders.filter(order => order?.status === 'completed')
        : [];
      
      const pendingOrders = Array.isArray(orders)
        ? orders.filter(order => order?.status === 'pending')
        : [];
      
      const totalRevenue = completedOrders.reduce((sum, order) => {
        const orderTotal = parseFloat(order?.total) || 0;
        return sum + orderTotal;
      }, 0);
      
      const recentOrders = Array.isArray(orders)
        ? orders
            .slice(0, 10)
            .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
            .slice(0, 5)
        : [];

      // Get top selling products
      const productsWithSales = products.map(product => {
        const productOrders = completedOrders.filter(order => {
          if (!order?.items || !Array.isArray(order.items)) return false;
          return order.items.some(item => item?.productId === product?._id || item?.product?._id === product?._id);
        });
        
        const totalSold = productOrders.reduce((sum, order) => {
          const item = order.items.find(i => 
            i?.productId === product?._id || i?.product?._id === product?._id
          );
          const quantity = parseInt(item?.quantity) || 0;
          return sum + quantity;
        }, 0);
        
        return { 
          ...product, 
          totalSold,
          price: parseFloat(product?.price) || 0,
          stock: parseInt(product?.quantity || product?.stock) || 0
        };
      });
      
      const topProducts = productsWithSales
        .filter(product => product.totalSold > 0)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

      // Calculate growth percentage
      let monthlyGrowth = 0;
      const previousRevenue = analytics.previousPeriodRevenue || 0;
      if (previousRevenue > 0) {
        monthlyGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
      }

      setStats({
        totalProducts: products.length || 0,
        totalOrders: orders.length || 0,
        totalUsers: users.length || 0,
        totalRevenue,
        activeOrders: pendingOrders.length || 0,
        recentOrders,
        topProducts,
        salesData: analytics.salesData || [],
        categoryData: analytics.categoryData || [],
        monthlyGrowth,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set default empty state on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        activeOrders: 0,
        recentOrders: [],
        topProducts: [],
        salesData: [],
        categoryData: [],
        monthlyGrowth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value) => {
    if (value > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />;
    } else if (value < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />;
    }
    return null;
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatGrowth = (value) => {
    if (value > 0) return `+${value.toFixed(1)}%`;
    if (value < 0) return `${value.toFixed(1)}%`;
    return '0%';
  };

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      change: stats.totalProducts > 0 ? '+12%' : '0%',
      trend: 'up',
      href: '/admin/products',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCartIcon,
      color: 'bg-green-500',
      change: formatGrowth(stats.monthlyGrowth),
      trend: stats.monthlyGrowth > 0 ? 'up' : stats.monthlyGrowth < 0 ? 'down' : 'neutral',
      href: '/admin/orders',
    },
    {
      name: 'Active Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-purple-500',
      change: '+5%',
      trend: 'up',
      href: '/admin/users',
    },
    {
      name: 'Total Revenue',
      value: formatKSH(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      change: formatGrowth(stats.monthlyGrowth),
      trend: stats.monthlyGrowth > 0 ? 'up' : stats.monthlyGrowth < 0 ? 'down' : 'neutral',
    },
    {
      name: 'Active Orders',
      value: stats.activeOrders.toLocaleString(),
      icon: ClockIcon,
      color: 'bg-orange-500',
      change: stats.activeOrders > 0 ? 'Pending' : 'None',
      trend: 'neutral',
      href: '/admin/orders?status=pending',
    },
    {
      name: 'Monthly Growth',
      value: formatGrowth(stats.monthlyGrowth),
      icon: ChartBarIcon,
      color: stats.monthlyGrowth > 0 ? 'bg-green-500' : stats.monthlyGrowth < 0 ? 'bg-red-500' : 'bg-gray-500',
      change: 'vs last period',
      trend: stats.monthlyGrowth > 0 ? 'up' : stats.monthlyGrowth < 0 ? 'down' : 'neutral',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <LoadingSpinner size="large" text="Loading dashboard..." />
        <p className="mt-4 text-sm text-gray-500">Fetching your data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to KwetuShop Admin Panel</p>
          <p className="text-sm text-gray-500 mt-1">
            All amounts are in Kenyan Shillings (KES)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.name}
            to={card.href || '#'}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-blue-300 block"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <div className="flex items-center mt-3">
                  {getTrendIcon(card.trend === 'up' ? 1 : card.trend === 'down' ? -1 : 0)}
                  <span className={`text-xs font-medium ${getTrendColor(card.trend === 'up' ? 1 : card.trend === 'down' ? -1 : 0)}`}>
                    {card.change} {card.name === 'Monthly Growth' ? '' : 'from last period'}
                  </span>
                </div>
              </div>
              <div className={`${card.color} p-3 rounded-lg shadow-sm`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">KES</span>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
          </div>
          {stats.salesData.length > 0 ? (
            <SalesChart 
              type="line" 
              data={stats.salesData}
              height={250}
              currency="KES"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p>No sales data available</p>
              <p className="text-sm mt-2">Try selecting a different time range</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
            <div className="text-sm text-gray-600">
              Total: {formatKSH(stats.categoryData.reduce((sum, cat) => sum + (cat.value || 0), 0))}
            </div>
          </div>
          {stats.categoryData.length > 0 ? (
            <SalesChart 
              type="pie" 
              data={stats.categoryData}
              height={250}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p>No category data available</p>
              <p className="text-sm mt-2">Products need to be categorized</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link 
                to="/admin/orders" 
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {stats.recentOrders.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">
                          #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.customer?.name || order.customerName || order.user?.name || 'Guest'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customer?.email || order.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt || order.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatKSH(order.total || order.amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No recent orders</p>
                <p className="text-sm mt-2">Orders will appear here as they come in</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
              <Link 
                to="/admin/products" 
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={product._id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold mr-4">
                        {index + 1}
                      </div>
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 mr-3">
                          <img
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                            src={
                              product.images?.[0]?.url || 
                              product.image || 
                              product.thumbnail ||
                              `https://via.placeholder.com/150?text=${encodeURIComponent(product.name?.charAt(0) || 'P')}`
                            }
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/150?text=${encodeURIComponent(product.name?.charAt(0) || 'P')}`;
                            }}
                          />
                        </div>
                        <div className="max-w-[200px]">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name || 'Unnamed Product'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Stock: {product.stock || 0} | 
                            Sold: {product.totalSold || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatKSH(product.price || 0)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        +{(product.totalSold || 0).toLocaleString()} units sold
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ShoppingBagIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No top products data</p>
                <p className="text-sm mt-2">Products will appear here as they sell</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Average Order Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.totalOrders > 0 ? formatKSH(stats.totalRevenue / stats.totalOrders) : formatKSH(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Active Order Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.totalOrders > 0 ? ((stats.activeOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;