// src/components/ui/LoadingSpinner.jsx
import React from 'react';

export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="bg-gray-900 rounded-lg overflow-hidden animate-pulse"
          style={{ aspectRatio: '3/4' }}
        >
          <div className="w-full h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"></div>
        </div>
      ))}
    </div>
  );
};

export const ContentLoader = ({ height = 'h-64', width = 'w-full' }) => {
  return (
    <div className={`${width} ${height} bg-gray-900 rounded-lg overflow-hidden animate-pulse`}>
      <div className="w-full h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"></div>
    </div>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-yellow-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
export const ProductSkeleton = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64 bg-gray-900 animate-pulse"></div>
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="flex-shrink-0 lg:w-72">
            <div className="space-y-3">
              <div className="w-56 h-56 mx-auto bg-gray-800 rounded-xl animate-pulse lg:mx-0 sm:w-64 sm:h-64 lg:w-72 lg:h-72"></div>
              <div className="flex w-56 gap-2 mx-auto lg:w-72 lg:mx-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="w-24 h-5 bg-gray-800 rounded-full animate-pulse"></div>
            <div className="w-3/4 h-8 bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="flex gap-1">
              <div className="w-32 h-4 bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="w-32 h-8 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-full h-20 bg-gray-800 rounded animate-pulse"></div>
            <div className="flex gap-3">
              <div className="w-24 h-8 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="w-24 h-8 bg-gray-800 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
