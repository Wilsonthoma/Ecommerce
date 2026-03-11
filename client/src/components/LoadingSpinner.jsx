// src/components/LoadingSpinner.jsx - IMPROVED with yellow-orange theme (no glow)
import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets'; // Import your assets

// Add custom animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .animate-bounce {
    animation: bounce 1s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

const LoadingSpinner = ({ 
  message = "Loading...", 
  fullScreen = true, 
  size = "md",
  showLogo = true,
  overlay = true
}) => {
  // Size configurations
  const sizes = {
    sm: {
      container: "w-12 h-12",
      logo: "w-6 h-6",
      text: "text-xs",
      border: "border-2",
      spacing: "mt-3"
    },
    md: {
      container: "w-20 h-20",
      logo: "w-10 h-10",
      text: "text-sm",
      border: "border-3",
      spacing: "mt-4"
    },
    lg: {
      container: "w-28 h-28",
      logo: "w-14 h-14",
      text: "text-base",
      border: "border-4",
      spacing: "mt-5"
    },
    xl: {
      container: "w-36 h-36",
      logo: "w-18 h-18",
      text: "text-lg",
      border: "border-4",
      spacing: "mt-6"
    }
  };

  const selectedSize = sizes[size] || sizes.md;

  // Determine container classes
  const containerClasses = fullScreen 
    ? `fixed inset-0 z-50 flex items-center justify-center ${overlay ? 'bg-black/80' : 'bg-black'}`
    : "flex items-center justify-center py-12 w-full";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative inline-block">
          {/* Spinning ring - Simple border with yellow-orange gradient */}
          <div className={`${selectedSize.container} rounded-full border-2 border-gray-700 border-t-yellow-500 animate-spin`}></div>
          
          {/* Logo in the center (optional) */}
          {showLogo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={assets.logo} 
                alt="KwetuShop" 
                className={`${selectedSize.logo} object-contain`}
              />
            </div>
          )}
        </div>
        
        {/* Message */}
        <p className={`text-gray-400 ${selectedSize.text} ${selectedSize.spacing}`}>{message}</p>
      </div>
    </div>
  );
};

// Preloader component for initial app loading
export const AppPreloader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="w-full max-w-md px-6 text-center">
        <div className="relative inline-block mb-8">
          {/* Main logo with pulse animation */}
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className="relative z-10 object-contain w-24 h-24 animate-pulse"
          />
        </div>
        
        <h2 className="mb-2 text-3xl font-bold text-white">KwetuShop</h2>
        <p className="mb-6 text-sm text-gray-400">Preparing your experience...</p>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-xs text-gray-500">{progress}%</p>
      </div>
    </div>
  );
};

// Page transition loader
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="text-center">
        <div className="relative inline-block">
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className="relative z-10 object-contain w-16 h-16 animate-bounce"
          />
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading page...</p>
      </div>
    </div>
  );
};

// Content loader for inline loading
export const ContentLoader = ({ message = "Loading content...", size = "md" }) => {
  const sizes = {
    sm: { container: "w-10 h-10", logo: "w-5 h-5", text: "text-xs" },
    md: { container: "w-14 h-14", logo: "w-7 h-7", text: "text-sm" },
    lg: { container: "w-20 h-20", logo: "w-10 h-10", text: "text-base" }
  };

  const selectedSize = sizes[size] || sizes.md;

  return (
    <div className="flex items-center justify-center w-full py-8">
      <div className="text-center">
        <div className="relative inline-block">
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className={`relative z-10 object-contain ${selectedSize.logo} animate-spin-slow`}
          />
        </div>
        <p className={`mt-3 text-gray-400 ${selectedSize.text}`}>{message}</p>
      </div>
    </div>
  );
};

// Skeleton loader for cards
export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 bg-gray-900 border border-gray-800 rounded-xl animate-pulse">
          <div className="w-full h-40 mb-4 bg-gray-800 rounded-lg"></div>
          <div className="w-3/4 h-4 mb-2 bg-gray-800 rounded"></div>
          <div className="w-1/2 h-4 mb-3 bg-gray-800 rounded"></div>
          <div className="w-1/3 h-5 bg-gray-800 rounded"></div>
        </div>
      ))}
    </div>
  );
};

// Skeleton loader for product page
export const ProductSkeleton = () => {
  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left column - Image skeleton */}
        <div className="flex-shrink-0 lg:w-72">
          <div className="w-56 h-56 mx-auto bg-gray-800 lg:mx-0 lg:w-72 lg:h-72 rounded-xl animate-pulse"></div>
          <div className="flex w-56 gap-2 mx-auto mt-3 lg:mx-0 lg:w-72">
            <div className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Right column - Content skeleton */}
        <div className="flex-1 space-y-4">
          <div className="w-1/3 h-4 bg-gray-800 rounded animate-pulse"></div>
          <div className="w-2/3 h-8 bg-gray-800 rounded animate-pulse"></div>
          <div className="w-1/2 h-6 bg-gray-800 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-full h-4 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-3/4 h-4 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;