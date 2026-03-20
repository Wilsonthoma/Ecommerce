// src/components/ui/Price.jsx
import React from 'react';

export const formatKES = (price) => {
  if (!price && price !== 0) return "KSh 0";
  return `KSh ${Math.round(price).toLocaleString()}`;
};

const Price = ({ price, comparePrice, size = 'large', quantity = 1 }) => {
  const totalPrice = price * quantity;
  const totalComparePrice = comparePrice ? comparePrice * quantity : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : 0;
  const totalSavings = hasDiscount ? (comparePrice - price) * quantity : 0;

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl md:text-3xl',
    xl: 'text-3xl md:text-4xl'
  };

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-bold ${sizeClasses[size]} text-gradient-yellow-orange`}>
        {formatKES(totalPrice)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-gray-400 line-through">
            {formatKES(totalComparePrice)}
          </span>
          <span className="badge-discount">-{discountPercentage}%</span>
          {quantity > 1 && (
            <span className="text-xs text-green-500">Save {formatKES(totalSavings)}</span>
          )}
        </>
      )}
    </div>
  );
};

export default Price;