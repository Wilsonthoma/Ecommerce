import React from 'react';
import { CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline';

const RecentOrders = ({ orders, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          icon: <CheckCircleIcon className="w-4 h-4" />,
          color: 'text-green-400 bg-green-500/10 border-green-500/30',
          text: 'Completed'
        };
      case 'processing':
        return {
          icon: <ClockIcon className="w-4 h-4" />,
          color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
          text: 'Processing'
        };
      case 'shipped':
        return {
          icon: <TruckIcon className="w-4 h-4" />,
          color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
          text: 'Shipped'
        };
      case 'cancelled':
        return {
          icon: <XCircleIcon className="w-4 h-4" />,
          color: 'text-red-400 bg-red-500/10 border-red-500/30',
          text: 'Cancelled'
        };
      default:
        return {
          icon: <ClockIcon className="w-4 h-4" />,
          color: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
          text: 'Pending'
        };
    }
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order ID</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="w-20 h-6 bg-gray-700 rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-2 text-gray-500">No recent orders</div>
        <p className="text-sm text-gray-600">Orders will appear here once they are placed</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Order ID</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            
            return (
              <tr key={order.id} className="transition-colors hover:bg-gray-800">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{order.id}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{order.customer}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-400">{formatDate(order.date)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{formatCurrency(order.amount)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                    <span className="mr-1.5">{statusConfig.icon}</span>
                    {statusConfig.text}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                  <button className="text-yellow-500 transition-colors hover:text-yellow-400">View</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;