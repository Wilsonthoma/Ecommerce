import React from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';
import { formatKSH } from '../../utils/formatters';

const ShippingSettings = ({ formData, onChange }) => {
  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping', description: '3-5 business days', icon: '🚚' },
    { id: 'express', name: 'Express Shipping', description: '1-2 business days', icon: '⚡' },
    { id: 'pickup', name: 'Store Pickup', description: 'Pick up from store', icon: '🏪' },
  ];

  const safeIncludes = (array, value) => {
    return Array.isArray(array) && array.includes(value);
  };

  const handleArrayChange = (field, value, checked) => {
    const currentArray = Array.isArray(formData[field]) ? formData[field] : [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    onChange(field, newArray);
  };

  const handleZoneChange = (index, field, value) => {
    const newZones = [...(formData.shippingZones || [])];
    newZones[index] = { ...newZones[index], [field]: value };
    onChange('shippingZones', newZones);
  };

  const addZone = () => {
    const newZones = [...(formData.shippingZones || []), { name: '', price: 0 }];
    onChange('shippingZones', newZones);
  };

  const removeZone = (index) => {
    const newZones = formData.shippingZones.filter((_, i) => i !== index);
    onChange('shippingZones', newZones);
  };

  return (
    <div className="space-y-8">
      {/* Shipping Methods */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Shipping Methods</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {shippingMethods.map((method) => {
            const isChecked = safeIncludes(formData.shippingMethods, method.id);
            
            return (
              <div key={method.id} className="relative">
                <input
                  type="checkbox"
                  id={`shipping-${method.id}`}
                  checked={isChecked}
                  onChange={(e) => handleArrayChange('shippingMethods', method.id, e.target.checked)}
                  className="hidden"
                />
                <label
                  htmlFor={`shipping-${method.id}`}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    isChecked
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                  }`}
                >
                  <div className="mb-2 text-2xl">{method.icon}</div>
                  <h4 className="font-medium text-white">{method.name}</h4>
                  <p className="mt-1 text-sm text-gray-400">{method.description}</p>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Rates */}
      <div className="p-6 border bg-orange-500/10 border-orange-500/30 rounded-xl">
        <h4 className="mb-4 font-semibold text-orange-400">Shipping Rates</h4>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Standard Shipping (KSh)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">KSh</span>
              </div>
              <input
                type="number"
                value={formData.standardShippingPrice || 0}
                onChange={(e) => onChange('standardShippingPrice', parseFloat(e.target.value) || 0)}
                className="w-full pl-12 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Express Shipping (KSh)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">KSh</span>
              </div>
              <input
                type="number"
                value={formData.expressShippingPrice || 0}
                onChange={(e) => onChange('expressShippingPrice', parseFloat(e.target.value) || 0)}
                className="w-full pl-12 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Free Shipping Threshold (KSh)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">KSh</span>
              </div>
              <input
                type="number"
                value={formData.freeShippingThreshold || 0}
                onChange={(e) => onChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                className="w-full pl-12 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                min="0"
              />
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Free shipping will be applied when order total is {formatKSH(formData.freeShippingThreshold)} or more.
        </p>
      </div>

      {/* Shipping Zones */}
      <div>
        <h4 className="mb-4 font-semibold text-white">Shipping Zones</h4>
        <div className="overflow-hidden bg-gray-700 border border-gray-600 rounded-lg">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800 border-b border-gray-600">
            <div className="col-span-6 text-sm font-medium text-gray-300">Zone Name</div>
            <div className="col-span-4 text-sm font-medium text-gray-300">Shipping Price (KSh)</div>
            <div className="col-span-2"></div>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto max-h-64">
            {(formData.shippingZones || []).map((zone, index) => (
              <div key={index} className="grid items-center grid-cols-12 gap-4">
                <div className="col-span-6">
                  <input
                    type="text"
                    value={zone.name || ''}
                    onChange={(e) => handleZoneChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 text-white transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Zone name"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    value={zone.price || 0}
                    onChange={(e) => handleZoneChange(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-white transition bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => removeZone(index)}
                    className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-600">
            <button
              type="button"
              onClick={addZone}
              className="px-4 py-2 text-sm font-medium text-orange-500 transition-colors rounded-lg hover:text-orange-400 hover:bg-orange-500/10"
            >
              + Add Shipping Zone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettings;