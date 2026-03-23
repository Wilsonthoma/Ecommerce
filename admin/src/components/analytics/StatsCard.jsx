import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const StatsCard = ({ title, value, change, icon, color = 'yellow', loading = false }) => {
  // Define color classes safely
  const colorClasses = {
    yellow: 'bg-yellow-500/10 border-yellow-500/30',
    orange: 'bg-orange-500/10 border-orange-500/30',
    amber: 'bg-amber-500/10 border-amber-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    emerald: 'bg-emerald-500/10 border-emerald-500/30',
    blue: 'bg-blue-500/10 border-blue-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
    red: 'bg-red-500/10 border-red-500/30',
    gray: 'bg-gray-500/10 border-gray-500/30'
  };

  const iconColors = {
    yellow: 'text-yellow-500',
    orange: 'text-orange-500',
    amber: 'text-amber-500',
    green: 'text-green-500',
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
    gray: 'text-gray-500'
  };

  const changeColors = {
    positive: 'text-emerald-400 bg-emerald-500/10',
    negative: 'text-red-400 bg-red-500/10',
    neutral: 'text-gray-400 bg-gray-500/10'
  };

  const getChangeType = () => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const getSafeValue = (val) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'string') return parseFloat(val) || 0;
    return val;
  };

  const changeType = getChangeType();
  const safeChange = getSafeValue(change);
  
  const ChangeIcon = safeChange > 0 
    ? ArrowTrendingUpIcon 
    : safeChange < 0 
      ? ArrowTrendingDownIcon 
      : ArrowsRightLeftIcon;

  // Get safe color class with fallback
  const cardColorClass = colorClasses[color] || colorClasses.yellow;
  const iconColorClass = iconColors[color] || iconColors.yellow;

  if (loading) {
    return (
      <div className={`rounded-xl border p-5 ${cardColorClass} animate-pulse`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="w-1/2 h-4 bg-gray-700 rounded"></div>
            <div className="w-3/4 h-8 bg-gray-700 rounded"></div>
          </div>
          <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const formattedChange = safeChange > 0 ? `+${safeChange.toFixed(1)}%` : safeChange < 0 ? `${safeChange.toFixed(1)}%` : '0%';

  return (
    <div className={`rounded-xl border p-5 ${cardColorClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title || 'Metric'}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value || '0'}</p>
          
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-3 ${changeColors[changeType]}`}>
            <ChangeIcon className="w-3 h-3 mr-1" />
            <span>{formattedChange}</span>
            <span className="ml-1">from last period</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${cardColorClass}`}>
          <div className={iconColorClass}>
            {icon || <div className="w-6 h-6" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;