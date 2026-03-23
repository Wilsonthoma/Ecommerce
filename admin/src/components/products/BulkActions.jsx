import React from 'react';
import { TrashIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const BulkActions = ({ selectedCount, onBulkDelete, onBulkStatusChange, onClearSelection }) => {
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);

  const statusOptions = [
    { value: 'active', label: 'Set as Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { value: 'inactive', label: 'Set as Inactive', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
    { value: 'out_of_stock', label: 'Set as Out of Stock', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    { value: 'draft', label: 'Set as Draft', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  ];

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/20">
            <span className="font-semibold text-yellow-500">{selectedCount}</span>
          </div>
          <span className="text-sm font-medium text-gray-300">
            {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
          </span>
        </div>
        
        <button
          onClick={onClearSelection}
          className="flex items-center text-sm text-gray-500 transition-colors hover:text-gray-400"
        >
          <XMarkIcon className="w-4 h-4 mr-1" />
          Clear selection
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Status Change Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4 mr-2 text-yellow-500" />
            Change Status
            <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showStatusMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowStatusMenu(false)}
              />
              <div className="absolute right-0 z-50 w-48 py-1 mt-2 overflow-hidden bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onBulkStatusChange(option.value);
                      setShowStatusMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${option.color}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${option.bg}`} />
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={onBulkDelete}
          className="inline-flex items-center px-3 py-1.5 border border-red-600/50 rounded-lg text-sm font-medium text-red-400 bg-gray-800 hover:bg-red-500/10 hover:border-red-500 transition-colors"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default BulkActions;