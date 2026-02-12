import React, { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ExportProducts = ({ onClose, products, filters }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeFields, setIncludeFields] = useState({
    name: true,
    sku: true,
    category: true,
    price: true,
    stock: true,
    status: true,
    description: false,
    weight: false,
    dimensions: false,
    createdAt: true,
    updatedAt: false,
  });
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would make an API call to export
      console.log('Exporting products:', {
        format: exportFormat,
        fields: includeFields,
        filters,
        count: products.length,
      });
      
      setExported(true);
      
      // Simulate file download
      setTimeout(() => {
        const data = {
          message: 'Export completed successfully',
          count: products.length,
          format: exportFormat,
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Close after delay
        setTimeout(onClose, 2000);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const toggleAllFields = (checked) => {
    setIncludeFields(
      Object.fromEntries(
        Object.keys(includeFields).map(key => [key, checked])
      )
    );
  };

  const fieldLabels = {
    name: 'Product Name',
    sku: 'SKU',
    category: 'Category',
    price: 'Price',
    stock: 'Stock Quantity',
    status: 'Status',
    description: 'Description',
    weight: 'Weight',
    dimensions: 'Dimensions',
    createdAt: 'Created Date',
    updatedAt: 'Updated Date',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowDownTrayIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Export Products</h2>
                <p className="text-sm text-gray-600">Export {products.length} products</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={exporting}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {exported ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Complete!</h3>
            <p className="text-gray-600 mb-4">
              Your export file has been downloaded successfully.
            </p>
            <div className="text-sm text-gray-500">
              {products.length} products exported • {exportFormat.toUpperCase()} format
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Export Format */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Export Format</h3>
              <div className="grid grid-cols-2 gap-3">
                {['csv', 'excel', 'json'].map((format) => (
                  <label
                    key={format}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                      exportFormat === format
                        ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format}
                      checked={exportFormat === format}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`h-4 w-4 rounded-full border mr-3 ${
                        exportFormat === format
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {exportFormat === format && (
                          <div className="h-2 w-2 bg-white rounded-full m-1" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{format.toUpperCase()}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format === 'csv' && 'Comma separated values'}
                          {format === 'excel' && 'Microsoft Excel format'}
                          {format === 'json' && 'JSON data format'}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Fields Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Include Fields</h3>
                <button
                  type="button"
                  onClick={() => toggleAllFields(!Object.values(includeFields).every(Boolean))}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {Object.values(includeFields).every(Boolean) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                {Object.entries(fieldLabels).map(([field, label]) => (
                  <label
                    key={field}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeFields[field]}
                        onChange={(e) =>
                          setIncludeFields(prev => ({
                            ...prev,
                            [field]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-900">{label}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{field}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filters Summary */}
            {Object.keys(filters).some(key => 
              typeof filters[key] === 'string' 
                ? filters[key] 
                : Object.values(filters[key] || {}).some(val => val)
            ) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Filters Applied</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {filters.category && (
                    <div>Category: <span className="font-medium">{filters.category}</span></div>
                  )}
                  {filters.status && (
                    <div>Status: <span className="font-medium">{filters.status}</span></div>
                  )}
                  {(filters.priceRange.min || filters.priceRange.max) && (
                    <div>
                      Price: 
                      <span className="font-medium ml-1">
                        ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Export will include products matching these filters
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            {!exported && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={exporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Export Products
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportProducts;