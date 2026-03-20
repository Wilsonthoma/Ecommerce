// src/components/orders/OrderStats.jsx
import React from 'react';
import { FiPackage, FiClock, FiRefreshCw, FiTruck, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { formatKES } from '../ui/Price';

const StatCard = ({ icon: Icon, label, value, gradient = "from-yellow-600 to-orange-600" }) => (
  <div className="p-3 stat-card" data-aos="fade-up" data-aos-duration="800">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
      </div>
      <div className={`p-2 rounded-full bg-gradient-to-r ${gradient}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
  </div>
);

const OrderStats = ({ stats }) => {
  const statItems = [
    { icon: FiPackage, label: "Total", value: stats.total, gradient: "from-yellow-600 to-orange-600" },
    { icon: FiClock, label: "Pending", value: stats.pending, gradient: "from-yellow-600 to-orange-600" },
    { icon: FiRefreshCw, label: "Processing", value: stats.processing, gradient: "from-yellow-600 to-orange-600" },
    { icon: FiTruck, label: "Shipped", value: stats.shipped, gradient: "from-yellow-600 to-orange-600" },
    { icon: FiCheckCircle, label: "Delivered", value: stats.delivered, gradient: "from-yellow-600 to-orange-600" },
    { icon: FiDollarSign, label: "Spent", value: formatKES(stats.totalSpent), gradient: "from-yellow-600 to-orange-600" }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-3 lg:grid-cols-6">
      {statItems.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default OrderStats;