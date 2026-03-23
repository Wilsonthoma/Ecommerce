import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-yellow-500',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent`}></div>
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-400">{text}</p>
      )}
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <LoadingSpinner size="large" text="Loading dashboard..." />
  </div>
);

export const TableLoader = () => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="medium" text="Loading data..." />
  </div>
);

export const ButtonLoader = ({ color = 'white' }) => (
  <div className="flex items-center justify-center">
    <div className={`animate-spin rounded-full h-4 w-4 border-2 ${color === 'white' ? 'border-white' : 'border-yellow-500'} border-t-transparent`}></div>
  </div>
);

export const CardLoader = () => (
  <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl animate-pulse">
    <div className="w-3/4 h-4 mb-4 bg-gray-700 rounded"></div>
    <div className="w-1/2 h-4 mb-2 bg-gray-700 rounded"></div>
    <div className="w-5/6 h-4 bg-gray-700 rounded"></div>
  </div>
);

export default LoadingSpinner;