import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ data, loading }) => {
  const chartData = Array.isArray(data) ? data : [];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-yellow-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-2 text-gray-500">No revenue data available</div>
          <p className="text-sm text-gray-600">Revenue data will appear here</p>
        </div>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#f3f4f6',
        bodyColor: '#f3f4f6',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `Revenue: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value) {
            if (value >= 1000) {
              return '$' + value / 1000 + 'k';
            }
            return '$' + value;
          }
        }
      }
    }
  };

  const chartConfig = {
    labels: chartData.map(item => item.month || item.label || `Month ${item.id || 1}`),
    datasets: [
      {
        data: chartData.map(item => item.revenue || item.sales || item.amount || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  return <Bar options={options} data={chartConfig} />;
};

export default RevenueChart;