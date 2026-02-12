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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  filters.status === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Price Range ($)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => handleRangeChange('priceRange', 'min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Stock Range */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Stock Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={filters.stockRange.min}
                onChange={(e) => handleRangeChange('stockRange', 'min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max"
                value={filters.stockRange.max}
                onChange={(e) => handleRangeChange('stockRange', 'max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Date Created
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleRangeChange('dateRange', 'start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleRangeChange('dateRange', 'end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Sort By
          </label>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg transition-colors ${
                  filters.sortBy === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
                {filters.sortBy === option.value && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    filters.sortOrder === 'asc' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {filters.sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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