import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent`}></div>
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className={`animate-spin rounded-full h-4 w-4 border-2 ${color === 'white' ? 'border-white' : 'border-blue-600'} border-t-transparent`}></div>
  </div>
);

export default LoadingSpinner;