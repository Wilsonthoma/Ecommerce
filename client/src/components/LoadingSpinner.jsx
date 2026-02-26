// src/components/LoadingSpinner.jsx - IMPROVED with real logo
import React from 'react';
import { assets } from '../assets/assets'; // Import your assets

const LoadingSpinner = ({ message = "Loading...", fullScreen = true, size = "md" }) => {
  // Size configurations
  const sizes = {
    sm: {
      container: "w-16 h-16",
      logo: "w-8 h-8",
      text: "text-xs",
      border: "border-2"
    },
    md: {
      container: "w-24 h-24",
      logo: "w-12 h-12",
      text: "text-sm",
      border: "border-4"
    },
    lg: {
      container: "w-32 h-32",
      logo: "w-16 h-16",
      text: "text-base",
      border: "border-4"
    }
  };

  const selectedSize = sizes[size] || sizes.md;

  // Determine container classes
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative inline-block">
          {/* Logo in the center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={assets.logo} 
              alt="KwetuShop" 
              className={`${selectedSize.logo} object-contain z-10`}
            />
          </div>
          
          {/* Spinning ring */}
          <div className={`${selectedSize.container} ${selectedSize.border} border-t-4 border-gray-700 rounded-full border-t-indigo-600 animate-spin`}></div>
          
          {/* Glow effect */}
          <div className={`absolute inset-0 ${selectedSize.container} rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-20 animate-pulse`}></div>
        </div>
        
        {/* Message */}
        <p className={`mt-6 text-gray-400 ${selectedSize.text}`}>{message}</p>
      </div>
    </div>
  );
};

// Preloader component for initial app loading
export const AppPreloader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="relative inline-block">
          {/* Logo with pulse animation */}
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className="relative z-10 object-contain w-20 h-20 animate-pulse"
          />
          
          {/* Glow rings */}
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-30 animate-ping"></div>
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-2xl opacity-20"></div>
        </div>
        
        <h2 className="mt-6 text-2xl font-bold text-white">KwetuShop</h2>
        <p className="mt-2 text-sm text-gray-400">Loading your experience...</p>
      </div>
    </div>
  );
};

// Page transition loader
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative inline-block">
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className="relative z-10 object-contain w-16 h-16 animate-bounce"
          />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading page...</p>
      </div>
    </div>
  );
};

// Content loader for inline loading
export const ContentLoader = ({ message = "Loading content..." }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="relative inline-block">
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className="relative z-10 object-contain w-12 h-12 animate-spin-slow"
          />
          <div className="absolute inset-0 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-3 text-xs text-gray-400">{message}</p>
      </div>
    </div>
  );
};

// Add custom animation for slow spin
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;
document.head.appendChild(style);

export default LoadingSpinner;