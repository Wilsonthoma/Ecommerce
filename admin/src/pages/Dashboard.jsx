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

  const extractArrayData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.products && Array.isArray(response.products)) return response.products;
    if (response?.orders && Array.isArray(response.orders)) return response.orders;
    if (response?.users && Array.isArray(response.users)) return response.users;
    if (response?.items && Array.isArray(response.items)) return response.items;
    return [];
  };

  const extractAnalyticsData = (response) => {
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
      
      const [productsRes, ordersRes, usersRes, analyticsRes] = await Promise.all([
        productService.getAll({ limit: 100 }),
        orderService.getAll({ timeRange, status: 'completed', limit: 100 }).catch(err => ({ data: [] })),
        userService.getAll({ limit: 100 }).catch(err => ({ data: [] })),
        analyticsService.getDashboardStats(timeRange).catch(err => ({})),
      ]);

      const products = extractArrayData(productsRes);
      const orders = extractArrayData(ordersRes);
      const users = extractArrayData(usersRes);
      const analytics = extractAnalyticsData(analyticsRes);

      const completedOrders = Array.isArray(orders) ? orders.filter(order => order?.status === 'completed') : [];
      const pendingOrders = Array.isArray(orders) ? orders.filter(order => order?.status === 'pending') : [];
      
      const totalRevenue = completedOrders.reduce((sum, order) => sum + (parseFloat(order?.total) || 0), 0);
      
      const recentOrders = Array.isArray(orders)
        ? orders.slice(0, 10).sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)).slice(0, 5)
        : [];

      const productsWithSales = products.map(product => {
        const productOrders = completedOrders.filter(order => {
          if (!order?.items || !Array.isArray(order.items)) return false;
          return order.items.some(item => item?.productId === product?._id || item?.product?._id === product?._id);
        });
        const totalSold = productOrders.reduce((sum, order) => {
          const item = order.items.find(i => i?.productId === product?._id || i?.product?._id === product?._id);
          return sum + (parseInt(item?.quantity) || 0);
        }, 0);
        return { ...product, totalSold, price: parseFloat(product?.price) || 0, stock: parseInt(product?.quantity || product?.stock) || 0 };
      });
      
      const topProducts = productsWithSales.filter(product => product.totalSold > 0).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
      
      let monthlyGrowth = 0;
      const previousRevenue = analytics.previousPeriodRevenue || 0;
      if (previousRevenue > 0) monthlyGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;

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
    if (value > 0) return <ArrowTrendingUpIcon className="w-4 h-4 mr-1 text-green-500" />;
    if (value < 0) return <ArrowTrendingDownIcon className="w-4 h-4 mr-1 text-red-500" />;
    return null;
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatGrowth = (value) => {
    if (value > 0) return `+${value.toFixed(1)}%`;
    if (value < 0) return `${value.toFixed(1)}%`;
    return '0%';
  };

  const statCards = [
    { name: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: ShoppingBagIcon, color: 'from-yellow-500 to-orange-500', change: '+12%', trend: 'up', href: '/admin/products' },
    { name: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCartIcon, color: 'from-green-500 to-emerald-500', change: formatGrowth(stats.monthlyGrowth), trend: stats.monthlyGrowth > 0 ? 'up' : 'down', href: '/admin/orders' },
    { name: 'Active Users', value: stats.totalUsers.toLocaleString(), icon: UsersIcon, color: 'from-purple-500 to-pink-500', change: '+5%', trend: 'up', href: '/admin/users' },
    { name: 'Total Revenue', value: formatKSH(stats.totalRevenue), icon: CurrencyDollarIcon, color: 'from-yellow-500 to-orange-500', change: formatGrowth(stats.monthlyGrowth), trend: stats.monthlyGrowth > 0 ? 'up' : 'down' },
    { name: 'Active Orders', value: stats.activeOrders.toLocaleString(), icon: ClockIcon, color: 'from-orange-500 to-red-500', change: 'Pending', trend: 'neutral', href: '/admin/orders?status=pending' },
    { name: 'Monthly Growth', value: formatGrowth(stats.monthlyGrowth), icon: ChartBarIcon, color: stats.monthlyGrowth > 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500', change: 'vs last period', trend: stats.monthlyGrowth > 0 ? 'up' : 'down' },
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
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-white">Error Loading Dashboard</h3>
          <p className="mb-4 text-gray-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome to KwetuShop Admin Panel</p>
          <p className="mt-1 text-sm text-gray-500">All amounts are in Kenyan Shillings (KES)</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 pr-8 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <Link
            key={card.name}
            to={card.href || '#'}
            className="block p-5 transition-all duration-200 bg-gray-800 border border-gray-700 rounded-xl hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">{card.name}</p>
                <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
                <div className="flex items-center mt-3">
                  {getTrendIcon(card.trend === 'up' ? 1 : card.trend === 'down' ? -1 : 0)}
                  <span className={`text-xs font-medium ${getTrendColor(card.trend === 'up' ? 1 : card.trend === 'down' ? -1 : 0)}`}>
                    {card.change} {card.name === 'Monthly Growth' ? '' : 'from last period'}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color} shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">KES</span>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
          {stats.salesData.length > 0 ? (
            <SalesChart type="line" data={stats.salesData} height={250} currency="KES" />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <CurrencyDollarIcon className="w-12 h-12 mb-4 text-gray-600" />
              <p>No sales data available</p>
              <p className="mt-2 text-sm">Try selecting a different time range</p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
            <div className="text-sm text-gray-400">
              Total: {formatKSH(stats.categoryData.reduce((sum, cat) => sum + (cat.value || 0), 0))}
            </div>
          </div>
          {stats.categoryData.length > 0 ? (
            <SalesChart type="pie" data={stats.categoryData} height={250} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ChartBarIcon className="w-12 h-12 mb-4 text-gray-600" />
              <p>No category data available</p>
              <p className="mt-2 text-sm">Products need to be categorized</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm font-medium text-yellow-500 transition-colors hover:text-yellow-400">
                View all →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {stats.recentOrders.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Customer</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="transition-colors hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-yellow-500">#{order.orderNumber || order._id?.slice(-8) || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{order.customer?.name || order.customerName || order.user?.name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{order.customer?.email || order.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{formatDate(order.createdAt || order.orderDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white whitespace-nowrap">{formatKSH(order.total || order.amount || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <ShoppingCartIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No recent orders</p>
                <p className="mt-2 text-sm">Orders will appear here as they come in</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Top Selling Products</h2>
              <Link to="/admin/products" className="text-sm font-medium text-yellow-500 transition-colors hover:text-yellow-400">
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-700">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={product._id || index} className="px-6 py-4 transition-colors hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 mr-4 font-bold text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                        #{index + 1}
                      </div>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 mr-3">
                          <img
                            className="object-cover w-12 h-12 border border-gray-600 rounded-lg"
                            src={product.images?.[0]?.url || product.image || product.thumbnail || `https://via.placeholder.com/150?text=${encodeURIComponent(product.name?.charAt(0) || 'P')}`}
                            alt={product.name}
                            onError={(e) => e.target.src = `https://via.placeholder.com/150?text=${encodeURIComponent(product.name?.charAt(0) || 'P')}`}
                          />
                        </div>
                        <div className="max-w-[200px]">
                          <p className="text-sm font-medium text-white line-clamp-1">{product.name || 'Unnamed Product'}</p>
                          <p className="mt-1 text-xs text-gray-400">Stock: {product.stock || 0} | Sold: {product.totalSold || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatKSH(product.price || 0)}</p>
                      <p className="mt-1 text-xs text-green-500">+{(product.totalSold || 0).toLocaleString()} units sold</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-500">
                <ShoppingBagIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No top products data</p>
                <p className="mt-2 text-sm">Products will appear here as they sell</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="p-6 border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Average Order Value</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {stats.totalOrders > 0 ? formatKSH(stats.totalRevenue / stats.totalOrders) : formatKSH(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Active Order Rate</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {stats.totalOrders > 0 ? ((stats.activeOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;