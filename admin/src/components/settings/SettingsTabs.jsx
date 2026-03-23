import React from 'react';
import {
  BuildingStorefrontIcon,
  CreditCardIcon,
  TruckIcon,
  BellIcon,
  ShieldCheckIcon,
  UsersIcon,
  PhotoIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const iconMap = {
  BuildingStorefrontIcon,
  CreditCardIcon,
  TruckIcon,
  BellIcon,
  ShieldCheckIcon,
  UsersIcon,
  PhotoIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon
};

const SettingsTabs = ({ tabs, activeTab, onTabChange }) => {
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const getActiveColor = (tabId) => {
    const colors = {
      general: 'text-yellow-500 bg-yellow-500/10',
      payment: 'text-green-500 bg-green-500/10',
      shipping: 'text-orange-500 bg-orange-500/10',
      notifications: 'text-purple-500 bg-purple-500/10',
      security: 'text-red-500 bg-red-500/10',
      customer: 'text-blue-500 bg-blue-500/10',
      productDisplay: 'text-cyan-500 bg-cyan-500/10',
      checkout: 'text-emerald-500 bg-emerald-500/10',
      email: 'text-indigo-500 bg-indigo-500/10',
      sms: 'text-pink-500 bg-pink-500/10',
      legal: 'text-gray-500 bg-gray-500/10',
      paymentDisplay: 'text-amber-500 bg-amber-500/10',
      seo: 'text-teal-500 bg-teal-500/10'
    };
    return colors[tabId] || 'text-blue-500 bg-blue-500/10';
  };

  return (
    <div className="lg:w-64">
      <div className="sticky p-4 bg-gray-800 border border-gray-700 top-6 rounded-xl">
        <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
          Settings Categories
        </h3>
        <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? `${getActiveColor(tab.id)} shadow-sm`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{getIcon(tab.icon)}</span>
              {tab.name}
              {activeTab === tab.id && (
                <span className="ml-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SettingsTabs;