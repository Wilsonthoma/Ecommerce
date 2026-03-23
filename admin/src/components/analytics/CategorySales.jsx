import React from 'react';

const CategorySales = ({ data, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const colors = [
    'bg-yellow-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-600',
    'bg-orange-600',
    'bg-amber-600',
    'bg-yellow-400',
    'bg-orange-400'
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between mb-1">
              <div className="w-1/4 h-4 bg-gray-700 rounded"></div>
              <div className="w-1/6 h-4 bg-gray-700 rounded"></div>
            </div>
            <div className="h-2 bg-gray-700 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-2 text-gray-500">No category data available</div>
        <p className="text-sm text-gray-600">Add categories to products to see distribution</p>
      </div>
    );
  }

  const totalSales = data.reduce((sum, item) => sum + (item.sales || 0), 0);

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = ((item.sales || 0) / totalSales * 100).toFixed(1);
        const color = colors[index % colors.length];
        
        return (
          <div key={item.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${color} mr-2`}></div>
                <span className="text-sm font-medium text-gray-200">{item.category}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">{formatCurrency(item.sales || 0)}</span>
                <span className="text-sm font-medium text-gray-200">{percentage}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <div 
                className={`h-2 rounded-full ${color}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
      
      <div className="pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-200">Total Revenue</span>
          <span className="text-lg font-bold text-white">{formatCurrency(totalSales)}</span>
        </div>
      </div>
    </div>
  );
};

export default CategorySales;