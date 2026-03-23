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
          <div key={i} className="flex items-center p-3 bg-gray-800 rounded-lg animate-pulse">
            <div className="w-10 h-10 mr-4 bg-gray-700 rounded-lg"></div>
            <div className="flex-1">
              <div className="w-1/2 h-4 mb-2 bg-gray-700 rounded"></div>
              <div className="w-1/4 h-3 bg-gray-700 rounded"></div>
            </div>
            <div className="text-right">
              <div className="w-16 h-4 mb-2 bg-gray-700 rounded"></div>
              <div className="w-12 h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-2 text-gray-500">No products data available</div>
        <p className="text-sm text-gray-600">Start adding products to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={product.id} className="flex items-center p-3 transition-colors rounded-lg hover:bg-gray-800">
          <div className="flex items-center justify-center w-10 h-10 mr-4 text-sm font-semibold text-yellow-500 rounded-lg bg-yellow-500/20">
            #{index + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h4 className="font-medium text-white truncate">{product.name}</h4>
              <div className="flex items-center ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= Math.floor(product.rating || 4) ? (
                    <StarIcon key={star} className="w-3 h-3 text-yellow-500 fill-current" />
                  ) : (
                    <StarOutline key={star} className="w-3 h-3 text-yellow-500" />
                  )
                ))}
                <span className="ml-1 text-xs text-gray-500">{product.rating?.toFixed(1) || '4.0'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 truncate">
              {formatNumber(product.sales || 0)} units sold
            </p>
          </div>
          
          <div className="ml-4 text-right">
            <div className="font-semibold text-white">
              {formatCurrency(product.revenue || 0)}
            </div>
            <div className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full inline-block">
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