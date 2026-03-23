import React from 'react';
import { ShoppingCartIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const CheckoutSettings = ({ formData, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Checkout Options */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <ShoppingCartIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Checkout Options
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Allow Guest Checkout</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.allowGuestCheckout !== false} 
                onChange={(e) => onChange('allowGuestCheckout', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-600 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Cart Expiry (Days)
            </label>
            <input 
              type="number" 
              value={formData?.cartExpiryDays || 30} 
              onChange={(e) => onChange('cartExpiryDays', parseInt(e.target.value))} 
              min="1" 
              max="90" 
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500" 
            />
          </div>
        </div>
      </div>

      {/* Required Fields */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
          <CreditCardIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Required Fields
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Require Phone Number</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.requirePhone !== false} 
                onChange={(e) => onChange('requirePhone', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-600 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Require Company Name</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.requireCompany || false} 
                onChange={(e) => onChange('requireCompany', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-600 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Enable Order Notes</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData?.enableNotes !== false} 
                onChange={(e) => onChange('enableNotes', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-600 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSettings;