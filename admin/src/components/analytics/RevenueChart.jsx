// src/components/analytics/RevenueChart.jsx
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
  // Ensure data is always an array
  const chartData = Array.isArray(data) ? data : [];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 mb-2">No revenue data available</div>
          <p className="text-sm text-gray-500">Revenue data will appear here</p>
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
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
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          color: '#6b7280',
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
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(59, 130, 246, 0.7)'
        ],
        borderColor: [
          '#3b82f6',
          '#3b82f6',
          '#3b82f6',
          '#3b82f6',
          '#3b82f6',
          '#3b82f6'
        ],
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  return <Bar options={options} data={chartConfig} />;
};

export default RevenueChart;