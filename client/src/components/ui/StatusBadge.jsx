// src/components/ui/StatusBadge.jsx
import React from 'react';
import { FiClock, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const StatusBadge = ({ status, size = 'sm', showIcon = true }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        icon: FiClock,
        class: 'status-pending',
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      },
      processing: {
        label: 'Processing',
        icon: FiPackage,
        class: 'status-processing',
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      },
      shipped: {
        label: 'Shipped',
        icon: FiTruck,
        class: 'status-shipped',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/30'
      },
      delivered: {
        label: 'Delivered',
        icon: FiCheckCircle,
        class: 'status-delivered',
        color: 'bg-green-500/10 text-green-500 border-green-500/30'
      },
      cancelled: {
        label: 'Cancelled',
        icon: FiXCircle,
        class: 'status-cancelled',
        color: 'bg-red-500/10 text-red-500 border-red-500/30'
      }
    };
    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.color} ${sizeClasses[size]}`}>
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
};

export default StatusBadge;