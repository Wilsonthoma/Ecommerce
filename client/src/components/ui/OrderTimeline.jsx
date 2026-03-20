// src/components/ui/OrderTimeline.jsx
import React from 'react';
import { FiClock, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';

const OrderTimeline = ({ status, estimatedDelivery, compact = false }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: FiClock },
    { key: 'processing', label: 'Processing', icon: FiPackage },
    { key: 'shipped', label: 'Shipped', icon: FiTruck },
    { key: 'delivered', label: 'Delivered', icon: FiCheckCircle }
  ];

  const currentStatus = status?.toLowerCase() || 'pending';
  let currentStepIndex = steps.findIndex(s => s.key === currentStatus);
  if (currentStepIndex === -1) currentStepIndex = 0;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' : isActive ? 'bg-yellow-500 animate-pulse' : 'bg-gray-700'
                }`}>
                  <step.icon className="w-3 h-3 text-white" />
                </div>
                <span className="mt-1 text-[8px] text-gray-400 hidden sm:block">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
      <h3 className="mb-4 text-sm font-semibold text-white">Order Timeline</h3>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-1">
                <div className={`timeline-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`} />
                <span className="mt-2 text-[10px] font-medium text-gray-400">{step.label}</span>
                {isActive && estimatedDelivery && (
                  <span className="mt-1 text-[8px] text-yellow-500">
                    Est: {formatDate(estimatedDelivery)}
                  </span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`timeline-line ${index < currentStepIndex ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;