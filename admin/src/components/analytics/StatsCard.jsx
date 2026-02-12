import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const StatsCard = ({ title, value, change, icon, color = 'blue', loading = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    purple: 'bg-purple-50 border-purple-100',
    amber: 'bg-amber-50 border-amber-100',
    red: 'bg-red-50 border-red-100',
    gray: 'bg-gray-50 border-gray-100'
  };

  const iconColors = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  };

  const changeColors = {
    positive: 'text-emerald-600 bg-emerald-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const getChangeType = () => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const changeType = getChangeType();
  
  const ChangeIcon = change > 0 
    ? ArrowTrendingUpIcon 
    : change < 0 
      ? ArrowTrendingDownIcon 
      : ArrowsRightLeftIcon;

  if (loading) {
    return (
      <div className={`rounded-xl border p-5 ${colorClasses[color]} animate-pulse`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-5 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-3 ${changeColors[changeType]}`}>
            <ChangeIcon className="h-3 w-3 mr-1" />
            <span>{change > 0 ? '+' : ''}{change}%</span>
            <span className="ml-1">from last period</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${colorClasses[color].replace('-50', '-100').replace('border-', 'bg-')}`}>
          <div className={iconColors[color]}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;