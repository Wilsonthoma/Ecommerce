// src/components/charts/SalesChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { analyticsService } from '../../services/analytics'; // Fixed import path
import { formatKSH, formatNumber } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import { Calendar, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

const SalesChart = ({ 
  period = '30d', 
  height = 350,
  showControls = true 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(period);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });

  // Fetch sales data
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine API parameters based on timeRange
      const params = {
        period: timeRange
      };

      // Fetch both sales data and stats
      const [salesResponse, statsResponse] = await Promise.all([
        analyticsService.getSalesData(params),
        analyticsService.getRevenueStats(timeRange.includes('d') ? 'daily' : 'monthly')
      ]);

      if (salesResponse.data) {
        setData(salesResponse.data);
      }

      if (statsResponse.data) {
        setStats({
          totalRevenue: statsResponse.data.totalRevenue || 0,
          revenueChange: statsResponse.data.revenueChange || 0,
          totalOrders: statsResponse.data.totalOrders || 0,
          avgOrderValue: statsResponse.data.averageOrderValue || 0
        });
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data. Please try again.');
      
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        setData(generateMockData(timeRange));
        setStats({
          totalRevenue: 250000,
          revenueChange: 12.5,
          totalOrders: 450,
          avgOrderValue: 555.56
        });
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Generate mock data for development
  const generateMockData = (range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const mockData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const sales = Math.floor(Math.random() * 50000) + 15000;
      const orders = Math.floor(Math.random() * 50) + 20;
      const visitors = Math.floor(Math.random() * 300) + 150;
      
      mockData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales,
        orders,
        visitors,
        conversionRate: parseFloat(((orders / visitors) * 100).toFixed(1))
      });
    }
    
    return mockData;
  };

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Format tooltip values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-medium text-gray-800 ml-4">
                {entry.name === 'sales' 
                  ? formatKSH(entry.value)
                  : entry.name === 'conversionRate'
                  ? `${entry.value}%`
                  : formatNumber(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Time range options
  const timeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <LoadingSpinner size="lg" message="Loading sales data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8" style={{ height }}>
        <div className="text-red-500 mb-4">
          <TrendingUp className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Data</h3>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <button
          onClick={fetchSalesData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header with stats and controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Sales Overview
          </h2>
          <p className="text-gray-600 text-sm mt-1">Track your sales performance over time</p>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 md:mt-0">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-800">{formatKSH(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className={`text-xs mt-1 flex items-center ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${stats.revenueChange >= 0 ? '' : 'transform rotate-180'}`} />
              {Math.abs(stats.revenueChange)}% {stats.revenueChange >= 0 ? 'increase' : 'decrease'}
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-800">{formatNumber(stats.totalOrders)}</p>
              </div>
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              AOV: {formatKSH(stats.avgOrderValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Time range selector */}
      {showControls && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {timeOptions.find(opt => opt.value === timeRange)?.label}
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => formatKSH(value, true)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="sales"
              name="Revenue"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart legend info */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <span>Revenue (KSH)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <span>Number of Orders</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500">Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;