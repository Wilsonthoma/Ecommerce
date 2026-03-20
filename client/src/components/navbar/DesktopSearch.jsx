// src/components/navbar/DesktopSearch.jsx
import React from 'react';
import { FiSearch } from 'react-icons/fi';

const DesktopSearch = ({ searchQuery, onSearchChange, onSearchSubmit, onKeyDown }) => {
  return (
    <div className="flex-1 hidden max-w-3xl mx-6 lg:flex">
      <div className="relative flex items-center w-full overflow-hidden transition-all duration-300 border-2 rounded-full group bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/50">
        <input
          type="text"
          placeholder="Search products, brands & categories..."
          value={searchQuery}
          onChange={onSearchChange}
          onKeyDown={onKeyDown}
          className="flex-1 py-2.5 px-4 text-gray-300 placeholder-gray-600 bg-transparent focus:outline-none"
        />
        <button
          onClick={onSearchSubmit}
          className="group relative px-6 py-2.5 text-white font-medium transition-all overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
          <span className="relative flex items-center gap-2">
            <FiSearch className="w-5 h-5" />
            <span className="hidden xl:inline">Search</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default DesktopSearch;