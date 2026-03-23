
import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const SettingsHeader = ({ onRefresh, onReset, saving, loading }) => {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text">
          Settings
        </h1>
        <p className="mt-1 text-gray-400">Configure your store preferences</p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={onReset}
          className="px-4 py-2 text-gray-300 transition-colors border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          disabled={saving || loading}
        >
          Reset Defaults
        </button>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-white transition-colors rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
          disabled={saving}
        >
          <ArrowPathIcon className="inline w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default SettingsHeader;