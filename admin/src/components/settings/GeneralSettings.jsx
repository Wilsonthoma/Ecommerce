import React from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import LogoUpload from './LogoUpload';
import { formatPhoneNumber } from '../../utils/formatters';

const GeneralSettings = ({ formData, onChange, onLogoChange, logoPreview }) => {
  const timezones = [
    'Africa/Nairobi',
    'UTC',
    'Africa/Dar_es_Salaam',
    'Africa/Kampala'
  ];

  return (
    <div className="space-y-8">
      <LogoUpload 
        logoPreview={logoPreview}
        storeLogo={formData.storeLogo}
        onLogoChange={onLogoChange}
        onUrlChange={(value) => onChange('storeLogo', value)}
      />

      {/* Store Information */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Store Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Store Name *
            </label>
            <input
              type="text"
              value={formData.storeName || ''}
              onChange={(e) => onChange('storeName', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Store Email *
            </label>
            <input
              type="email"
              value={formData.storeEmail || ''}
              onChange={(e) => onChange('storeEmail', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
              required
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="p-6 bg-gray-700/50 rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-white">Contact Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">+254</span>
              </div>
              <input
                type="tel"
                value={formData.storePhone || ''}
                onChange={(e) => onChange('storePhone', e.target.value)}
                className="w-full pl-14 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                placeholder="712 345 678"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {formatPhoneNumber(formData.storePhone, '+254')}
            </p>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Address
            </label>
            <input
              type="text"
              value={formData.storeAddress || ''}
              onChange={(e) => onChange('storeAddress', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Regional Settings</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Currency
            </label>
            <select
              value={formData.currency || 'KES'}
              onChange={(e) => onChange('currency', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            >
              <option value="KES">Kenyan Shilling (KSh)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Timezone
            </label>
            <select
              value={formData.timezone || 'Africa/Nairobi'}
              onChange={(e) => onChange('timezone', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Current time: {new Date().toLocaleTimeString('en-KE', { timeZone: formData.timezone })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;