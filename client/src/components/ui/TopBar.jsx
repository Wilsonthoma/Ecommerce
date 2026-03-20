// src/components/ui/TopBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-2 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl sm:px-6">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-yellow-500 sm:text-sm"
        >
          <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>FIND STORE</span>
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs text-gray-400 transition-colors hover:text-yellow-500 sm:text-sm"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

export default TopBar;