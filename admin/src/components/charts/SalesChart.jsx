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
import { analyticsService } from '../../services/analytics';
import { formatKSH, formatNumber } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import { Calendar, TrendingUp, DollarSign, ShoppingBag, TrendingDown } from 'lucide-react';

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

  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { period: timeRange };

      const [salesResponse, statsResponse] = await Promise.all([
        analyticsService.getSalesData(params),
        analyticsService.getRevenueStats(timeRange.includes('d') ? 'daily' : 'monthly')
      ]);

      if (salesResponse.data) setData(salesResponse.data);
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
      
      if (process.env.NODE_ENV === 'development') {
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
          <p className="mb-2 font-semibold text-white">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 mr-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-300">{entry.name}:</span>
              </div>
              <span className="ml-4 font-medium text-white">
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

  const timeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl" style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" message="Loading sales data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-800 border border-gray-700 rounded-xl" style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mb-4 text-red-500">
            <TrendingUp className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">Unable to Load Data</h3>
          <p className="mb-4 text-center text-gray-400">{error}</p>
          <button
            onClick={fetchSalesData}
            className="px-4 py-2 text-white transition-colors rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
      <div className="flex flex-col justify-between mb-6 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center text-xl font-bold text-white">
            <TrendingUp className="w-5 h-5 mr-2 text-yellow-500" />
            Sales Overview
          </h2>
          <p className="mt-1 text-sm text-gray-400">Track your sales performance over time</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-4 md:mt-0">
          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-xl font-bold text-white">{formatKSH(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-5 h-5 text-yellow-500" />
            </div>
            <div className={`text-xs mt-1 flex items-center ${stats.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.revenueChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(stats.revenueChange)}% {stats.revenueChange >= 0 ? 'increase' : 'decrease'}
            </div>
          </div>

          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Orders</p>
                <p className="text-xl font-bold text-white">{formatNumber(stats.totalOrders)}</p>
              </div>
              <ShoppingBag className="w-5 h-5 text-green-500" />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              AOV: {formatKSH(stats.avgOrderValue)}
            </p>
          </div>
        </div>
      </div>

      {showControls && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === option.value
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {timeOptions.find(opt => opt.value === timeRange)?.label}
          </div>
        </div>
      )}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => formatKSH(value, true)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF' }}
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="sales"
              name="Revenue"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-700">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 bg-yellow-500 rounded-full" />
            <span className="text-gray-400">Revenue (KSH)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-2 bg-green-500 rounded-full" />
            <span className="text-gray-400">Number of Orders</span>
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