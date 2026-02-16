// src/components/GoogleLoginButton.jsx - TRANSFORMED with oraimo black gradients and glowing effects
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { BsArrowRight } from 'react-icons/bs';

const GoogleLoginButton = ({ 
  isLoading = false, 
  onClick, 
  size = "default",
  variant = "default",
  className = "" 
}) => {
  const baseStyles = "group relative flex items-center justify-center gap-3 font-medium transition-all duration-300 rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    small: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg"
  };

  const variantStyles = {
    default: "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-white hover:border-blue-500/50",
    outline: "bg-transparent border-2 border-blue-500/50 text-blue-500 hover:bg-blue-500/10",
    solid: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
  };

  // Glow effects for each variant
  const glowStyles = {
    default: "group-hover:opacity-100 bg-gradient-to-r from-blue-600 to-purple-600",
    outline: "group-hover:opacity-30 bg-gradient-to-r from-blue-600 to-purple-600",
    solid: "group-hover:opacity-100 bg-gradient-to-r from-blue-600 to-purple-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 ${glowStyles[variant]} rounded-full opacity-0 blur-xl transition-opacity duration-500`}></div>
      
      {/* Background Gradient for solid variant */}
      {variant === 'solid' && (
        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
      )}
      
      {/* Content */}
      <span className="relative flex items-center justify-center gap-3">
        {isLoading ? (
          <>
            <div className="relative">
              <div className="w-5 h-5 border-2 border-gray-600 rounded-full border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-0 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 blur"></div>
            </div>
            <span className="text-gray-300">Connecting...</span>
          </>
        ) : (
          <>
            <div className="relative">
              <FcGoogle className="w-5 h-5 relative z-10" />
              <div className="absolute inset-0 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-30 blur transition-opacity"></div>
            </div>
            <span className="group-hover:glow-text transition-all">Continue with Google</span>
            <BsArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </>
        )}
      </span>
    </button>
  );
};

export default GoogleLoginButton;