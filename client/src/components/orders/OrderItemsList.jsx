// src/components/orders/OrderItemsList.jsx
import React from 'react';
import { FiPackage } from 'react-icons/fi';
import Price from '../ui/Price';

const OrderItemsList = ({ items }) => {
  const getFullImageUrl = (imagePath) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg';
    if (!imagePath) return FALLBACK_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="p-6 border border-gray-800 rounded-2xl confirmation-card">
      <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
        <FiPackage className="text-yellow-500" />
        Order Items
      </h3>
      <div className="space-y-4">
        {items?.map((item, index) => (
          <div key={item._id || index} className="flex items-center pb-4 border-b border-gray-700 last:border-0 last:pb-0">
            <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 bg-gray-800 rounded-lg">
              {item.image ? (
                <img src={getFullImageUrl(item.image)} alt={item.name} className="object-cover w-full h-full rounded-lg" />
              ) : (
                <FiPackage className="text-2xl text-gray-500" />
              )}
            </div>
            <div className="flex-1 ml-4">
              <h4 className="font-semibold text-white">{item.name}</h4>
              <p className="mt-1 text-sm text-gray-400">Quantity: {item.quantity}</p>
            </div>
            <div className="text-right">
              <Price price={item.price * item.quantity} size="lg" />
              <div className="text-sm text-gray-400">{item.price} each</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItemsList;