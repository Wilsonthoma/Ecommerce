import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import Price, { formatKES } from '../ui/Price';

const SearchAutocomplete = ({ 
  searchValue, 
  onSearchChange, 
  suggestions = [], 
  showSuggestions = false,
  onSuggestionClick,
  loading = false
}) => {
  const [localShowSuggestions, setLocalShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setLocalShowSuggestions(showSuggestions && suggestions.length > 0);
  }, [showSuggestions, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setLocalShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onSearchChange(e);
  };

  const handleSuggestionClick = (productId) => {
    setLocalShowSuggestions(false);
    if (onSuggestionClick) {
      onSuggestionClick(productId);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block mb-0.5 text-[10px] font-medium text-gray-300">Search</label>
      <div className="relative">
        <FiSearch className="absolute w-3 h-3 text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => searchValue.length >= 2 && suggestions.length > 0 && setLocalShowSuggestions(true)}
          className="w-full py-1.5 pr-2 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg pl-7 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
        />
      </div>
      
      {/* Autocomplete Suggestions Dropdown */}
      {localShowSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
          <div className="overflow-y-auto max-h-60 custom-scrollbar">
            {suggestions.map(product => (
              <Link
                key={product._id || product.id}
                to={`/product/${product._id || product.id}`}
                className="flex items-center gap-3 p-2 transition-colors hover:bg-gray-800"
                onClick={() => handleSuggestionClick(product._id || product.id)}
              >
                <div className="flex-shrink-0 w-8 h-8 overflow-hidden bg-gray-800 rounded">
                  <img 
                    src={product.primaryImage || product.image || 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                    alt={product.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{product.name}</p>
                  <Price price={product.price} size="xs" />
                </div>
                <FiArrowRight className="w-3 h-3 text-gray-500" />
              </Link>
            ))}
            {loading && (
              <div className="p-2 text-center">
                <div className="w-4 h-4 mx-auto border-2 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
                <p className="mt-1 text-xs text-gray-500">Searching...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;