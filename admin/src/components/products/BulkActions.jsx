import React from 'react';
import { TrashIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const BulkActions = ({ selectedCount, onBulkDelete, onBulkStatusChange, onClearSelection }) => {
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);

  const statusOptions = [
    { value: 'active', label: 'Set as Active', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { value: 'inactive', label: 'Set as Inactive', color: 'text-gray-700', bg: 'bg-gray-100' },
    { value: 'out_of_stock', label: 'Set as Out of Stock', color: 'text-red-700', bg: 'bg-red-100' },
    { value: 'draft', label: 'Set as Draft', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold">{selectedCount}</span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
          </span>
        </div>
        
        <button
          onClick={onClearSelection}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          <XMarkIcon className="h-4 w-4 mr-1" />
          Clear selection
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Status Change Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Change Status
            <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showStatusMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowStatusMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onBulkStatusChange(option.value);
                      setShowStatusMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${option.color}`}
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
          className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default BulkActions;