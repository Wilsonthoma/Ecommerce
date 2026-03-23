import React from 'react';
import { MagnifyingGlassIcon, ChartBarIcon, ShareIcon } from '@heroicons/react/24/outline';

const SeoSettings = ({ formData, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Meta Tags */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Meta Tags
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Meta Title
            </label>
            <input 
              type="text" 
              value={formData?.metaTitle || 'KwetuShop - Best Electronics Store in Kenya'} 
              onChange={(e) => onChange('metaTitle', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Meta Description
            </label>
            <textarea 
              rows={2} 
              value={formData?.metaDescription || 'Shop the latest smartphones, laptops, and electronics at KwetuShop. Free delivery in Nairobi. Best prices guaranteed!'} 
              onChange={(e) => onChange('metaDescription', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Meta Keywords
            </label>
            <input 
              type="text" 
              value={formData?.metaKeywords || 'electronics, smartphones, laptops, tablets, Kenya, Nairobi'} 
              onChange={(e) => onChange('metaKeywords', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Open Graph Image URL
            </label>
            <input 
              type="url" 
              value={formData?.ogImage || ''} 
              onChange={(e) => onChange('ogImage', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
              placeholder="https://example.com/og-image.jpg" 
            />
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <ChartBarIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Analytics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Enable Analytics</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableAnalytics !== false} 
                onChange={(e) => onChange('enableAnalytics', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-600 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Google Analytics ID
            </label>
            <input 
              type="text" 
              value={formData?.googleAnalyticsId || ''} 
              onChange={(e) => onChange('googleAnalyticsId', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
              placeholder="G-XXXXXXXXXX" 
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Facebook Pixel ID
            </label>
            <input 
              type="text" 
              value={formData?.facebookPixelId || ''} 
              onChange={(e) => onChange('facebookPixelId', e.target.value)} 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
              placeholder="123456789" 
            />
          </div>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <ShareIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Social Sharing
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Enable Social Share Buttons</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData?.enableSocialShare !== false} 
              onChange={(e) => onChange('enableSocialShare', e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-600 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SeoSettings;