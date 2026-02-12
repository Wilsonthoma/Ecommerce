import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const TopProducts = ({ products, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-lg mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">No products data available</div>
        <p className="text-sm text-gray-500">Start adding products to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={product.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg font-semibold text-sm mr-4">
            #{index + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
              <div className="flex items-center ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= Math.floor(product.rating || 4) ? (
                    <StarIcon key={star} className="h-3 w-3 text-amber-400 fill-current" />
                  ) : (
                    <StarOutline key={star} className="h-3 w-3 text-amber-400" />
                  )
                ))}
                <span className="text-xs text-gray-500 ml-1">{product.rating?.toFixed(1) || '4.0'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {formatNumber(product.sales || 0)} units sold
            </p>
          </div>
          
          <div className="text-right ml-4">
            <div className="font-semibold text-gray-900">
              {formatCurrency(product.revenue || 0)}
            </div>
            <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              {product.revenue && product.sales 
                ? formatCurrency(Math.round(product.revenue / product.sales))
                : formatCurrency(0)}
              /unit
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopProducts;