import React from 'react';
import { PhotoIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';

const ProductDisplaySettings = ({ formData, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Product Display Options */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <StarIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Product Display Options
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-300">Show Product Rating</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.showProductRating !== false} 
                onChange={(e) => onChange('showProductRating', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-300">Show Product Badges</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.showProductBadges !== false} 
                onChange={(e) => onChange('showProductBadges', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-300">Show Discount Badge</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.showDiscountBadge !== false} 
                onChange={(e) => onChange('showDiscountBadge', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-300">Show Stock Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.showStockStatus !== false} 
                onChange={(e) => onChange('showStockStatus', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Image Settings */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <PhotoIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Image Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Enable Zoom on Hover</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableZoomOnHover !== false} 
                onChange={(e) => onChange('enableZoomOnHover', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Enable Gallery Lightbox</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableGalleryLightbox !== false} 
                onChange={(e) => onChange('enableGalleryLightbox', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <EyeIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Related Products
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Show Related Products</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.showRelatedProducts !== false} 
                onChange={(e) => onChange('showRelatedProducts', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Recently Viewed Products Count
            </label>
            <input 
              type="number" 
              value={formData?.recentlyViewedCount || 4} 
              onChange={(e) => onChange('recentlyViewedCount', parseInt(e.target.value))} 
              min="0" 
              max="12" 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplaySettings;