import React from 'react';
import { UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';

const CustomerSettings = ({ formData, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Registration Settings */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <UserGroupIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Registration Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Allow New Registrations</p>
              <p className="text-sm text-gray-400">Allow customers to create new accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.allowRegistration !== false} 
                onChange={(e) => onChange('allowRegistration', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Require Email Verification</p>
              <p className="text-sm text-gray-400">Send verification email after registration</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.requireEmailVerification !== false} 
                onChange={(e) => onChange('requireEmailVerification', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Require Phone Verification</p>
              <p className="text-sm text-gray-400">Send verification SMS after registration</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.requirePhoneVerification || false} 
                onChange={(e) => onChange('requirePhoneVerification', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Account Features */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <StarIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Account Features
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable Wishlist</p>
              <p className="text-sm text-gray-400">Allow customers to save favorite products</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableWishlist !== false} 
                onChange={(e) => onChange('enableWishlist', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable Product Reviews</p>
              <p className="text-sm text-gray-400">Allow customers to rate and review products</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableReviews !== false} 
                onChange={(e) => onChange('enableReviews', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable Order Tracking</p>
              <p className="text-sm text-gray-400">Allow customers to track their orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableOrderTracking !== false} 
                onChange={(e) => onChange('enableOrderTracking', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable Returns</p>
              <p className="text-sm text-gray-400">Allow customers to return products</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableReturns !== false} 
                onChange={(e) => onChange('enableReturns', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Returns Window (Days)
            </label>
            <input 
              type="number" 
              value={formData?.returnsWindowDays || 14} 
              onChange={(e) => onChange('returnsWindowDays', parseInt(e.target.value))} 
              min="7" 
              max="60" 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Enable Saved Addresses</p>
              <p className="text-sm text-gray-400">Allow customers to save multiple addresses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableSavedAddresses !== false} 
                onChange={(e) => onChange('enableSavedAddresses', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;