// src/components/orders/OrderSummary.jsx
import React from 'react';
import { FiDollarSign } from 'react-icons/fi';
import Price from '../ui/Price';

const OrderSummary = ({ order }) => {
  return (
    <div className="p-6 border border-gray-800 rounded-2xl confirmation-card">
      <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
        <FiDollarSign className="text-yellow-500" />
        Order Summary
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-gray-300">
          <span className="text-gray-400">Subtotal</span>
          <Price price={order.subtotal || order.totalAmount} size="md" />
        </div>
        <div className="flex justify-between text-gray-300">
          <span className="text-gray-400">Shipping</span>
          <span className="text-yellow-500">{order.shippingCost === 0 ? 'Free' : `KSh ${order.shippingCost}`}</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span className="text-gray-400">Tax</span>
          <Price price={order.tax || 0} size="md" />
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-gray-300">
            <span className="text-gray-400">Discount</span>
            <span className="text-green-500">-KSh {order.discount}</span>
          </div>
        )}
        <div className="pt-3 mt-3 border-t border-gray-700">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">Total</span>
            <Price price={order.totalAmount} size="xl" className="text-yellow-500 glow-text" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;