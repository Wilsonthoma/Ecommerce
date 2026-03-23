import React from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

const FiltersPanel = ({ filters, onFilterChange, categories, onClose }) => {
  const handleFilterChange = (name, value) => {
    onFilterChange({ [name]: value });
  };

  const handleRangeChange = (rangeName, field, value) => {
    onFilterChange({
      [rangeName]: {
        ...filters[rangeName],
        [field]: value,
      },
    });
  };

  const handleSortChange = (sortBy) => {
    const newOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFilterChange({
      sortBy,
      sortOrder: newOrder,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      category: '',
      status: '',
      priceRange: { min: '', max: '' },
      stockRange: { min: '', max: '' },
      dateRange: { start: '', end: '' },
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'draft', label: 'Draft' },
  ];

  return (
    <div className="p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FunnelIcon className="w-5 h-5 mr-2 text-yellow-500" />
          <h3 className="text-lg font-semibold text-white">Filters & Sorting</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 transition-colors hover:text-gray-300"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 text-white transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  filters.status === option.value
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={filters.status === option.value}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Price Range ($)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => handleRangeChange('priceRange', 'min', e.target.value)}
                className="w-full px-3 py-2 text-white placeholder-gray-500 transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => handleRangeChange('priceRange', 'max', e.target.value)}
                className="w-full px-3 py-2 text-white placeholder-gray-500 transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Stock Range */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Stock Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={filters.stockRange.min}
                onChange={(e) => handleRangeChange('stockRange', 'min', e.target.value)}
                className="w-full px-3 py-2 text-white placeholder-gray-500 transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max"
                value={filters.stockRange.max}
                onChange={(e) => handleRangeChange('stockRange', 'max', e.target.value)}
                className="w-full px-3 py-2 text-white placeholder-gray-500 transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Date Created
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleRangeChange('dateRange', 'start', e.target.value)}
                className="w-full px-3 py-2 text-white transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleRangeChange('dateRange', 'end', e.target.value)}
                className="w-full px-3 py-2 text-white transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Sort By
          </label>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg transition-colors ${
                  filters.sortBy === option.value
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:bg-gray-700'
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {filters.sortBy === option.value && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    filters.sortOrder === 'asc' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {filters.sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 transition-colors border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              Clear All Filters
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 font-medium text-white transition-colors rounded-lg shadow-sm bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;