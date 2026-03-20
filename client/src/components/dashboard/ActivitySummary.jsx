// src/components/dashboard/ActivitySummary.jsx
import React from 'react';

const ActivitySummary = ({ stats, reviewsCount, wishlistCount }) => {
  const activities = [
    { label: 'Orders placed', value: stats.totalOrders, maxValue: 100, multiplier: 10, gradient: 'from-yellow-600 to-orange-600' },
    { label: 'Reviews written', value: reviewsCount, maxValue: 100, multiplier: 20, gradient: 'from-yellow-600 to-orange-600' },
    { label: 'Wishlist items', value: wishlistCount, maxValue: 100, multiplier: 10, gradient: 'from-pink-600 to-red-600' }
  ];

  return (
    <div className="p-6 dashboard-card rounded-xl">
      <h3 className="mb-4 text-lg font-bold text-white">Activity Summary</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{activity.label}</span>
              <span className="text-sm font-semibold text-white">{activity.value}</span>
            </div>
            <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${activity.gradient}`}
                style={{ width: `${Math.min(activity.value * activity.multiplier, activity.maxValue)}%` }}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ActivitySummary;