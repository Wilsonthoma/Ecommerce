// src/components/dashboard/StatsCard.jsx
import React from 'react';

const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  subtitleIcon: SubtitleIcon, 
  subtitleText,
  gradient = "from-yellow-600 to-orange-600",
  onClick,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-5 dashboard-card rounded-xl animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
          <div className="w-12 h-4 bg-gray-700 rounded"></div>
        </div>
        <div className="w-24 h-8 mb-2 bg-gray-700 rounded"></div>
        <div className="w-20 h-4 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div 
      className={`p-5 dashboard-card rounded-xl ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick}
      data-aos="flip-up"
      data-aos-duration="1000"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-gray-500">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtitle && (
        <div className="flex items-center gap-2 mt-2">
          {SubtitleIcon && <SubtitleIcon className="w-3 h-3 text-yellow-500" />}
          <span className="text-xs text-gray-400">{subtitleText || subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;