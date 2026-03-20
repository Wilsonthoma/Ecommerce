// src/components/auth/AuthHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

const AuthHeader = ({ showBackButton = true }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Logo */}
      <div 
        onClick={() => navigate("/")} 
        className="absolute z-30 cursor-pointer left-5 sm:left-20 top-20 group"
      >
        <div className="relative">
          <div className="absolute transition-opacity rounded-full opacity-0 -inset-2 bg-gradient-to-r from-yellow-600 to-orange-600 group-hover:opacity-30 blur-xl"></div>
          <img 
            src={assets.logo} 
            alt="Logo" 
            className="relative transition-transform w-28 sm:w-32 group-hover:scale-105" 
          />
        </div>
      </div>

      {/* Back button */}
      {showBackButton && (
        <div className="absolute z-30 top-4 right-4">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white transition-all border border-gray-700 rounded-full bg-black/50 backdrop-blur-sm hover:border-yellow-500/50"
          >
            <span className="text-yellow-500">←</span> Back to Home
          </button>
        </div>
      )}
    </>
  );
};

export default AuthHeader;