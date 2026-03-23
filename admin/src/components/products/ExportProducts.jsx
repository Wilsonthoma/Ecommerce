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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Exporting products:', {
        format: exportFormat,
        fields: includeFields,
        filters,
        count: products.length,
      });
      
      setExported(true);
      
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-hidden animate-fadeInUp">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <ArrowDownTrayIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Export Products</h2>
                <p className="text-sm text-gray-400">Export {products.length} products</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-300"
              disabled={exporting}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {exported ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20">
              <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Export Complete!</h3>
            <p className="mb-4 text-gray-400">
              Your export file has been downloaded successfully.
            </p>
            <div className="text-sm text-gray-500">
              {products.length} products exported • {exportFormat.toUpperCase()} format
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Export Format */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-300">Export Format</h3>
              <div className="grid grid-cols-2 gap-3">
                {['csv', 'excel', 'json'].map((format) => (
                  <label
                    key={format}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                      exportFormat === format
                        ? 'border-yellow-500 ring-2 ring-yellow-500/20 bg-yellow-500/10'
                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
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
                          ? 'border-yellow-500 bg-yellow-500'
                          : 'border-gray-500'
                      }`}>
                        {exportFormat === format && (
                          <div className="w-2 h-2 m-1 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{format.toUpperCase()}</div>
                        <div className="mt-1 text-xs text-gray-400">
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
                <h3 className="text-sm font-medium text-gray-300">Include Fields</h3>
                <button
                  type="button"
                  onClick={() => toggleAllFields(!Object.values(includeFields).every(Boolean))}
                  className="text-sm font-medium text-yellow-500 hover:text-yellow-400"
                >
                  {Object.values(includeFields).every(Boolean) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="p-2 space-y-2 overflow-y-auto max-h-60 custom-scrollbar">
                {Object.entries(fieldLabels).map(([field, label]) => (
                  <label
                    key={field}
                    className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-gray-700"
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
                        className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                      />
                      <span className="ml-3 text-sm text-gray-300">{label}</span>
                    </div>
                    <span className="font-mono text-xs text-gray-500">{field}</span>
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
              <div className="p-4 border border-gray-600 rounded-lg bg-gray-700/50">
                <h4 className="mb-2 text-sm font-medium text-gray-300">Filters Applied</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  {filters.category && (
                    <div>Category: <span className="font-medium text-yellow-500">{filters.category}</span></div>
                  )}
                  {filters.status && (
                    <div>Status: <span className="font-medium text-yellow-500">{filters.status}</span></div>
                  )}
                  {(filters.priceRange.min || filters.priceRange.max) && (
                    <div>
                      Price: 
                      <span className="ml-1 font-medium text-yellow-500">
                        ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Export will include products matching these filters
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex justify-end space-x-3">
            {!exported && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-300 transition-colors border border-gray-600 rounded-lg hover:bg-gray-700"
                  disabled={exporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center px-6 py-2 font-medium text-white transition-colors rounded-lg shadow-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
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