import React from 'react';

// Define the 6 electronics categories
const ELECTRONICS_CATEGORIES = [
  { value: 'Smartphones', label: 'Smartphones' },
  { value: 'Laptops', label: 'Laptops' },
  { value: 'Tablets', label: 'Tablets' },
  { value: 'Cameras', label: 'Cameras' },
  { value: 'Headphones', label: 'Headphones' },
  { value: 'Speakers', label: 'Speakers' }
];

const ShopFilters = ({ 
  categories = [], 
  selectedCategories = [], 
  onToggleCategory, 
  minPrice, 
  maxPrice, 
  onPriceChange,
  onClearFilters
}) => {
  // Use the predefined categories if none provided
  const displayCategories = categories.length > 0 ? categories : ELECTRONICS_CATEGORIES;

  const handleToggleCategory = (categoryValue) => {
    // Ensure category is properly capitalized
    const capitalizedCategory = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1).toLowerCase();
    onToggleCategory(capitalizedCategory);
  };

  const handlePriceChange = (type, value) => {
    onPriceChange(type, value ? parseFloat(value) : '');
  };

  return (
    <div className="sticky p-3 bg-gray-900 border border-gray-800 rounded-xl top-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white">Filters</h2>
        <button
          onClick={onClearFilters}
          className="text-[10px] text-yellow-500 transition-colors hover:text-yellow-400"
        >
          Clear All
        </button>
      </div>

      {/* Categories - Only 6 electronics categories */}
      <div className="mb-3">
        <h3 className="mb-1.5 text-xs font-semibold text-white">Categories</h3>
        <div className="space-y-1 overflow-y-auto max-h-36">
          {displayCategories.map((category) => (
            <label key={category.value} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.value)}
                onChange={() => handleToggleCategory(category.value)}
                className="w-3.5 h-3.5 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-offset-0"
              />
              <span className="ml-1.5 text-[10px] text-gray-300 transition-colors group-hover:text-white">
                {category.label}
              </span>
              <span className="ml-auto text-[10px] text-gray-500">
                {category.count ? `(${category.count})` : ''}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-1.5 text-xs font-semibold text-white">Price Range (KSh)</h3>
        <div className="flex gap-1.5">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="w-full px-2 py-1.5 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-yellow-500/50"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="w-full px-2 py-1.5 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-yellow-500/50"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default ShopFilters;