// src/pages/Analytics.jsx - DARK THEME VERSION
import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ChevronDownIcon,
  CubeIcon,
  CreditCardIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  EyeIcon,
  ShoppingBagIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { analyticsService } from '../services/analytics';
import { toast } from 'react-hot-toast';
import SalesChart from '../components/analytics/SalesChart';
import RevenueChart from '../components/analytics/RevenueChart';
import TopProducts from '../components/analytics/TopProducts';
import RecentOrders from '../components/analytics/RecentOrders';
import CategorySales from '../components/analytics/CategorySales';
import StatsCard from '../components/analytics/StatsCard';
import { formatKSH, formatNumber, formatPercentage } from '../utils/formatters';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categorySales, setCategorySales] = useState([]);

  const timeRanges = [
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' },
    { value: 'quarter', label: 'Last 90 days' },
    { value: 'year', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        dashboardStats,
        salesResponse,
        revenueResponse,
        topProductsResponse,
        recentOrdersResponse,
        categorySalesResponse
      ] = await Promise.all([
        analyticsService.getDashboardStats(timeRange),
        analyticsService.getSalesData({ timeRange }),
        analyticsService.getRevenueStats(timeRange),
        analyticsService.getTopProducts(10),
        analyticsService.getRecentOrders(8),
        analyticsService.getCategorySales()
      ]);

      console.log('Dashboard API Responses:', {
        dashboardStats,
        salesResponse,
        revenueResponse,
        topProductsResponse,
        recentOrdersResponse,
        categorySalesResponse
      });

      if (dashboardStats.success !== false) {
        setDashboardData(dashboardStats.data || dashboardStats);
      } else {
        setDashboardData(dashboardStats);
      }
      
      if (salesResponse.success !== false) {
        const salesData = salesResponse.data?.chartData || 
                         salesResponse.data?.data || 
                         salesResponse.data || 
                         salesResponse;
        setSalesData(Array.isArray(salesData) ? salesData : []);
      }
      
      if (revenueResponse.success !== false) {
        const revenueData = revenueResponse.data || revenueResponse;
        setRevenueData(Array.isArray(revenueData) ? revenueData : [revenueData]);
      }
      
      if (topProductsResponse.success !== false) {
        const productsData = topProductsResponse.data?.products || 
                           topProductsResponse.data?.data || 
                           topProductsResponse.data || 
                           topProductsResponse;
        setTopProducts(Array.isArray(productsData) ? productsData : []);
      }
      
      if (recentOrdersResponse.success !== false) {
        const ordersData = recentOrdersResponse.data?.orders || 
                          recentOrdersResponse.data?.data || 
                          recentOrdersResponse.data || 
                          recentOrdersResponse;
        setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
      }
      
      if (categorySalesResponse.success !== false) {
        const categoriesData = categorySalesResponse.data?.data || 
                             categorySalesResponse.data || 
                             categorySalesResponse;
        setCategorySales(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load analytics data');
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const mockSalesData = [
      { date: '2024-01-01', totalSales: 150000, orderCount: 45 },
      { date: '2024-01-02', totalSales: 180000, orderCount: 52 },
      { date: '2024-01-03', totalSales: 120000, orderCount: 38 },
      { date: '2024-01-04', totalSales: 220000, orderCount: 65 },
      { date: '2024-01-05', totalSales: 190000, orderCount: 58 },
      { date: '2024-01-06', totalSales: 250000, orderCount: 72 },
      { date: '2024-01-07', totalSales: 280000, orderCount: 85 }
    ];

    const mockRevenueData = {
      current: 720000,
      previous: 610000,
      growth: 18.03,
      period: 'month',
      currency: 'KSH'
    };

    const mockTopProducts = [
      { id: 1, name: 'Smartphone', sold: 1250, revenue: 18750000 },
      { id: 2, name: 'Laptop', sold: 980, revenue: 39200000 },
      { id: 3, name: 'Wireless Headphones', sold: 850, revenue: 1275000 },
      { id: 4, name: 'Smart Watch', sold: 720, revenue: 720000 },
      { id: 5, name: 'Bluetooth Speaker', sold: 650, revenue: 975000 }
    ];

    const mockRecentOrders = [
      { id: 'ORD-001', orderNumber: 'ORD-001', customer: 'John Doe', total: 29999, status: 'completed', date: '2024-01-07T10:30:00Z', formattedDate: '07/01/2024' },
      { id: 'ORD-002', orderNumber: 'ORD-002', customer: 'Jane Smith', total: 14950, status: 'completed', date: '2024-01-07T14:15:00Z', formattedDate: '07/01/2024' },
      { id: 'ORD-003', orderNumber: 'ORD-003', customer: 'Bob Johnson', total: 49999, status: 'processing', date: '2024-01-06T09:45:00Z', formattedDate: '06/01/2024' },
      { id: 'ORD-004', orderNumber: 'ORD-004', customer: 'Alice Brown', total: 8999, status: 'completed', date: '2024-01-06T16:20:00Z', formattedDate: '06/01/2024' },
      { id: 'ORD-005', orderNumber: 'ORD-005', customer: 'Charlie Wilson', total: 19999, status: 'shipped', date: '2024-01-05T11:10:00Z', formattedDate: '05/01/2024' }
    ];

    const mockCategorySales = [
      { name: 'Electronics', value: 45000000, revenue: 45000000, unitsSold: 450, orders: 150 },
      { name: 'Clothing', value: 28000000, revenue: 28000000, unitsSold: 2800, orders: 280 },
      { name: 'Home & Kitchen', value: 18000000, revenue: 18000000, unitsSold: 1800, orders: 180 },
      { name: 'Books', value: 5000000, revenue: 5000000, unitsSold: 5000, orders: 500 },
      { name: 'Other', value: 4000000, revenue: 4000000, unitsSold: 400, orders: 40 }
    ];

    setDashboardData({
      overview: {
        revenue: { total: 15245000, today: 280000, monthly: 720000, yearly: 8640000, growthToday: 12.5, growthMonth: 18.03, currency: 'KSH' },
        orders: { total: 1250, today: 85, monthly: 415, averageValue: 12196, currency: 'KSH' },
        products: { total: 125, active: 110, outOfStock: 5, lowStock: 12, inventoryValue: 45000000, currency: 'KSH' },
        customers: { total: 856, newThisMonth: 85, active: 415, averageValue: 17815, currency: 'KSH' }
      },
      charts: {
        revenueByDay: mockSalesData.map(item => ({ date: item.date, revenue: item.totalSales, orders: item.orderCount, avgOrderValue: item.totalSales / item.orderCount, currency: 'KSH' })),
        salesByCategory: mockCategorySales,
        orderStatus: [{ status: 'completed', count: 850, revenue: 10200000 }, { status: 'processing', count: 250, revenue: 3000000 }, { status: 'shipped', count: 150, revenue: 1800000 }]
      },
      topProducts: mockTopProducts,
      topCustomers: [{ name: 'John Doe', email: 'john@example.com', totalOrders: 45, totalSpent: 1350000, avgOrderValue: 30000 }],
      recentOrders: mockRecentOrders,
      currency: 'KSH'
    });

    setSalesData(mockSalesData);
    setRevenueData([mockRevenueData]);
    setTopProducts(mockTopProducts);
    setRecentOrders(mockRecentOrders);
    setCategorySales(mockCategorySales);
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-emerald-400 bg-emerald-500/10';
    if (change < 0) return 'text-red-400 bg-red-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowTrendingUpIcon className="w-4 h-4" />;
    if (change < 0) return <ArrowTrendingDownIcon className="w-4 h-4" />;
    return <ArrowsRightLeftIcon className="w-4 h-4" />;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen p-6 bg-gray-900">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-2 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-900 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-transparent md:text-3xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text">Analytics Dashboard</h1>
            <p className="mt-1 text-gray-400">Monitor your store performance and key metrics</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-white hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="h-4 w-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
            </div>
            
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatKSH(dashboardData?.overview?.revenue?.total || 0)}
          change={dashboardData?.overview?.revenue?.growthMonth || 0}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-yellow-500" />}
          color="yellow"
          loading={loading}
        />
        
        <StatsCard
          title="Total Orders"
          value={formatNumber(dashboardData?.overview?.orders?.total || 0)}
          change={dashboardData?.overview?.revenue?.growthMonth || 0}
          icon={<ShoppingCartIcon className="w-6 h-6 text-emerald-500" />}
          color="emerald"
          loading={loading}
        />
        
        <StatsCard
          title="Total Customers"
          value={formatNumber(dashboardData?.overview?.customers?.total || 0)}
          change={dashboardData?.overview?.customers?.averageValue || 0}
          icon={<UsersIcon className="w-6 h-6 text-purple-500" />}
          color="purple"
          loading={loading}
        />
        
        <StatsCard
          title="Avg Order Value"
          value={formatKSH(dashboardData?.overview?.orders?.averageValue || 0)}
          change={dashboardData?.overview?.orders?.averageValue || 0}
          icon={<CreditCardIcon className="w-6 h-6 text-amber-500" />}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Sales Overview</h3>
              <p className="text-sm text-gray-400">Daily sales and orders volume</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-400">Sales</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-400">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <SalesChart 
              data={Array.isArray(salesData) ? salesData : []} 
              loading={loading} 
              currency="KSH"
            />
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
              <p className="text-sm text-gray-400">Monthly revenue performance</p>
            </div>
            <div className="flex items-center space-x-4">
              {revenueData[0]?.growth && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getChangeColor(revenueData[0].growth)}`}>
                  {getChangeIcon(revenueData[0].growth)}
                  <span className="ml-1.5">
                    {revenueData[0].growth > 0 ? '+' : ''}{revenueData[0].growth}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="h-64">
            <RevenueChart 
              data={Array.isArray(revenueData) ? revenueData : []} 
              loading={loading} 
              currency="KSH"
            />
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
        {/* Top Products */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl md:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Top Selling Products</h3>
              <p className="text-sm text-gray-400">Best performing products by revenue</p>
            </div>
            <button className="text-sm font-medium text-yellow-500 hover:text-yellow-400">
              View all →
            </button>
          </div>
          <TopProducts 
            products={Array.isArray(topProducts) ? topProducts : []} 
            loading={loading} 
            currency="KSH"
          />
        </div>

        {/* Category Sales */}
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
              <p className="text-sm text-gray-400">Revenue distribution across categories</p>
            </div>
          </div>
          <CategorySales 
            data={Array.isArray(categorySales) ? categorySales : []} 
            loading={loading} 
            currency="KSH"
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <p className="text-sm text-gray-400">Latest completed and processing orders</p>
          </div>
          <button className="text-sm font-medium text-yellow-500 hover:text-yellow-400">
            View all orders →
          </button>
        </div>
        <RecentOrders 
          orders={Array.isArray(recentOrders) ? recentOrders : []} 
          loading={loading} 
          currency="KSH"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Today's Revenue</p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatKSH(dashboardData?.overview?.revenue?.today || 0)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <ChartBarIcon className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center text-sm">
              {dashboardData?.overview?.revenue?.growthToday > 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1 text-emerald-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1 text-red-500" />
              )}
              <span className={dashboardData?.overview?.revenue?.growthToday > 0 ? 'text-emerald-500' : 'text-red-500'}>
                {dashboardData?.overview?.revenue?.growthToday > 0 ? '+' : ''}{dashboardData?.overview?.revenue?.growthToday || 0}% from yesterday
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Customers</p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatNumber(dashboardData?.overview?.customers?.active || 0)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <UsersIcon className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center text-sm text-emerald-500">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              <span>Active this month</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Conversion Rate</p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatPercentage(3.2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <StarIcon className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center text-sm">
              <span className="flex items-center">
                {[1, 2, 3, 4].map((star) => (
                  <StarIcon key={star} className="w-4 h-4 fill-current text-amber-500" />
                ))}
                <StarIcon className="w-4 h-4 text-amber-500" />
              </span>
              <span className="ml-2 text-gray-400">Based on 856 reviews</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Inventory Status</p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatNumber(dashboardData?.overview?.products?.total || 0)} items
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <CubeIcon className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center text-sm">
              <ExclamationCircleIcon className="w-4 h-4 mr-1 text-amber-500" />
              <span className="text-amber-500">
                {dashboardData?.overview?.products?.lowStock || 0} items low in stock
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;