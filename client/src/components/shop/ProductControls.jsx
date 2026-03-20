import React from 'react';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { BsGridFill, BsListUl } from 'react-icons/bs';

const ProductControls = ({ 
  totalProducts, 
  currentProductsCount, 
  viewMode, 
  onViewModeChange, 
  sortValue, 
  onSortChange,
  sortOptions,
  showFilters,
  onToggleFilters,
  isMobile = false
}) => {
  return (
    <div className="p-2 mb-4 bg-gray-900 border border-gray-800 rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] text-gray-400">
          Showing <span className="font-semibold text-white">{currentProductsCount}</span> of{' '}
          <span className="font-semibold text-white">{totalProducts}</span> products
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div className="flex overflow-hidden bg-gray-800 border border-gray-700 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`relative p-1.5 transition-all ${
                viewMode === 'grid' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Grid view"
            >
              {viewMode === 'grid' && (
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
              )}
              <span className="relative">
                <BsGridFill className="w-3.5 h-3.5" />
              </span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`relative p-1.5 transition-all ${
                viewMode === 'list' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="List view"
            >
              {viewMode === 'list' && (
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
              )}
              <span className="relative">
                <BsListUl className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-2 py-1.5 pr-6 text-xs text-white bg-gray-800 border border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-1 focus:ring-yellow-500/50"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute w-3 h-3 text-gray-400 transform -translate-y-1/2 pointer-events-none right-1.5 top-1/2" />
          </div>
          
          {/* Mobile Filter Toggle */}
          {isMobile && (
            <button
              onClick={onToggleFilters}
              className="relative px-2 py-1.5 overflow-hidden text-xs font-medium text-white transition-all rounded-lg group"
            >
              <span className="absolute inset-0 bg-gray-800"></span>
              <span className="relative flex items-center gap-0.5">
                {showFilters ? <FiX className="w-3 h-3" /> : <FiFilter className="w-3 h-3" />}
                <span className="text-[10px]">{showFilters ? 'Hide' : 'Filter'}</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductControls;