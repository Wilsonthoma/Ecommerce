// src/components/ui/QuantitySelector.jsx
import React from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';

const QuantitySelector = ({ quantity, setQuantity, maxStock = 999, size = 'small' }) => {
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const sizeClasses = {
    small: {
      button: 'px-2 py-1.5',
      text: 'w-8 text-xs',
      icon: 'w-3 h-3'
    },
    medium: {
      button: 'px-3 py-2',
      text: 'w-10 text-sm',
      icon: 'w-4 h-4'
    },
    large: {
      button: 'px-4 py-2.5',
      text: 'w-12 text-base',
      icon: 'w-5 h-5'
    }
  };

  const styles = sizeClasses[size] || sizeClasses.small;

  return (
    <div className="flex items-center border border-gray-700 rounded-full bg-gradient-to-br from-gray-800 to-gray-900">
      <button
        onClick={handleDecrease}
        disabled={quantity <= 1}
        className={`${styles.button} text-gray-400 hover:text-white disabled:opacity-50 transition-colors`}
      >
        <FiMinus className={styles.icon} />
      </button>
      <span className={`${styles.text} font-medium text-center text-white`}>{quantity}</span>
      <button
        onClick={handleIncrease}
        disabled={quantity >= maxStock}
        className={`${styles.button} text-gray-400 hover:text-white disabled:opacity-50 transition-colors`}
      >
        <FiPlus className={styles.icon} />
      </button>
    </div>
  );
};

export default QuantitySelector;