// src/components/dashboard/RecentOrders.jsx
import React from 'react';
import { FiPackage, FiShoppingBag, FiArrowRight, FiShoppingCart } from 'react-icons/fi';

const formatKES = (amount) => {
  if (!amount) return "KSh 0";
  return `KSh ${Math.round(amount).toLocaleString()}`;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

const getStatusBadge = (status) => {
  const statusConfig = {
    'delivered': 'bg-gradient-to-r from-green-600 to-emerald-600',
    'completed': 'bg-gradient-to-r from-green-600 to-emerald-600',
    'processing': 'bg-gradient-to-r from-yellow-600 to-orange-600',
    'pending': 'bg-gradient-to-r from-yellow-600 to-orange-600',
    'shipped': 'bg-gradient-to-r from-blue-600 to-cyan-600',
    'cancelled': 'bg-gradient-to-r from-red-600 to-pink-600'
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${statusConfig[status?.toLowerCase()] || 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
      {status || 'Pending'}
    </span>
  );
};

const RecentOrders = ({ orders, onViewAll, onOrderClick, onStartShopping }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 dashboard-card rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <FiShoppingBag className="text-yellow-500" />
            Recent Orders
          </h3>
          <button onClick={onViewAll} className="flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400">
            View All <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="py-12 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-800 border border-gray-700 rounded-full">
            <FiShoppingBag className="w-8 h-8 text-gray-600" />
          </div>
          <p className="mb-4 text-gray-400">No orders yet</p>
          <button onClick={onStartShopping} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
            <FiShoppingCart className="w-4 h-4" />
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 dashboard-card rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-xl font-bold text-white">
          <FiShoppingBag className="text-yellow-500" />
          Recent Orders
        </h3>
        <button onClick={onViewAll} className="flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400">
          View All <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {orders.map((order, index) => (
          <div 
            key={order._id} 
            className="p-4 transition-all border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50 hover:border-yellow-600/50 group"
            onClick={() => onOrderClick(order._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-600/30">
                  <FiPackage className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">#{order.orderNumber || order._id.slice(-8)}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(order.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{formatKES(order.totalAmount)}</p>
                {getStatusBadge(order.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;