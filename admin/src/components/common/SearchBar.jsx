import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  onClear,
  className = '',
  size = 'medium',
  showClearButton = true,
  showFiltersButton = false,
  onFiltersClick,
  initialValue = '',
  debounceDelay = 300,
  autoSearch = true
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, debounceDelay);

  // Trigger search on debounced query change
  useEffect(() => {
    if (autoSearch && debouncedQuery !== undefined && onSearch) {
      onSearch(debouncedQuery.trim());
    }
  }, [debouncedQuery, onSearch, autoSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onClear) {
      onClear();
    }
    if (onSearch && autoSearch) {
      onSearch('');
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // If not using debounce, call onSearch directly
    if (!autoSearch && onSearch && value.trim() === '') {
      onSearch('');
    }
  };

  const sizeClasses = {
    small: 'py-2 px-3 text-sm h-9',
    medium: 'py-2.5 px-4 h-10',
    large: 'py-3 px-5 text-base h-11'
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative rounded-lg transition-all duration-200 ${
          isFocused 
            ? 'ring-2 ring-primary-500 ring-offset-1' 
            : 'hover:ring-1 hover:ring-gray-300'
        }`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className={`${iconSizes[size]} text-gray-400`} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`block w-full pl-10 ${showFiltersButton ? 'pr-20' : showClearButton ? 'pr-10' : 'pr-4'} border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-transparent ${
              sizeClasses[size]
            }`}
            placeholder={placeholder}
            aria-label="Search"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {query && showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                aria-label="Clear search"
              >
                <XMarkIcon className={iconSizes[size]} />
              </button>
            )}
            
            {showFiltersButton && (
              <button
                type="button"
                onClick={onFiltersClick}
                className="ml-1 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-150"
                aria-label="Open filters"
              >
                <FunnelIcon className={iconSizes[size]} />
              </button>
            )}
          </div>
        </div>
        
        {!autoSearch && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-150"
          >
            Search
          </button>
        )}
      </form>
      
      {/* Search suggestions (example) */}
      {isFocused && query && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recent Searches
            </div>
            {['iPhone 14', 'MacBook Pro', 'Samsung TV'].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  if (onSearch) onSearch(suggestion);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-3" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onClearAll,
  className = '',
  showSearch = true 
}) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...activeFilters };
    
    if (value === '' || value === null) {
      delete newFilters[filterName];
    } else {
      newFilters[filterName] = value;
    }
    
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilter = (filterName) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterName];
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
    if (onClearAll) {
      onClearAll();
    }
  };

  const getFilteredOptions = (options) => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <div className="flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        </div>
        
        {showSearch && (
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filters..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}
        
        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 hover:bg-red-50 rounded-md transition-colors duration-150"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            
            {filter.type === 'select' ? (
              <select
                value={activeFilters[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">All {filter.label}</option>
                {getFilteredOptions(filter.options).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={activeFilters[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            ) : filter.type === 'range' ? (
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={activeFilters[filter.name]?.min || ''}
                  onChange={(e) => handleFilterChange(filter.name, {
                    ...(activeFilters[filter.name] || {}),
                    min: e.target.value
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={activeFilters[filter.name]?.max || ''}
                  onChange={(e) => handleFilterChange(filter.name, {
                    ...(activeFilters[filter.name] || {}),
                    max: e.target.value
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ) : filter.type === 'checkbox' ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {getFilteredOptions(filter.options).map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(activeFilters[filter.name] || []).includes(option.value)}
                      onChange={(e) => {
                        const currentValues = activeFilters[filter.name] || [];
                        let newValues;
                        
                        if (e.target.checked) {
                          newValues = [...currentValues, option.value];
                        } else {
                          newValues = currentValues.filter(v => v !== option.value);
                        }
                        
                        handleFilterChange(filter.name, newValues);
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Active filters chips */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = filters.find(f => f.name === key);
              
              if (!filter) return null;
              
              // Handle different filter types
              let displayValue;
              
              if (filter.type === 'checkbox' && Array.isArray(value)) {
                if (value.length === 0) return null;
                const selectedOptions = filter.options
                  .filter(opt => value.includes(opt.value))
                  .map(opt => opt.label);
                displayValue = selectedOptions.join(', ');
              } else if (filter.type === 'range') {
                displayValue = `${value.min || 'Any'} - ${value.max || 'Any'}`;
              } else {
                const option = filter.options.find(opt => opt.value === value);
                displayValue = option?.label || value;
              }
              
              if (!displayValue) return null;
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100"
                >
                  <span className="font-semibold">{filter.label}:</span>
                  <span className="ml-1">{displayValue}</span>
                  <button
                    onClick={() => clearFilter(key)}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage of FilterBar:
/*
const productFilters = [
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'home', label: 'Home & Garden' },
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
    ]
  },
  {
    name: 'price_range',
    label: 'Price Range',
    type: 'range',
    options: []
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'checkbox',
    options: [
      { value: 'featured', label: 'Featured' },
      { value: 'new', label: 'New Arrival' },
      { value: 'sale', label: 'On Sale' },
    ]
  }
];
*/

export default SearchBar;