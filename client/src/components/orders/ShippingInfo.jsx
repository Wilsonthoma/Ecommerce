// src/components/orders/ShippingInfo.jsx
import React from 'react';
import { FiMapPin, FiMail, FiPhone, FiTruck, FiClock, FiShield } from 'react-icons/fi';

const ShippingInfo = ({ order }) => {
  const shippingAddress = order.shippingAddress || order.shippingInfo;
  const getShippingTime = (method) => {
    const times = {
      next_day: '1 business day',
      express: '2-3 business days',
      standard: '5-7 business days'
    };
    return times[method] || '5-7 business days';
  };

  const formatAddress = () => {
    if (!shippingAddress) return '';
    return `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}, ${shippingAddress.country || 'Kenya'}`;
  };

  return (
    <div className="p-6 border border-gray-800 rounded-2xl confirmation-card">
      <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
        <FiTruck className="text-yellow-500" />
        Shipping & Delivery
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-2 mb-3 font-semibold text-white">
            <FiMapPin className="text-yellow-500" />
            Shipping Address
          </h4>
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/95">
            <p className="font-medium text-white">
              {shippingAddress?.fullName || shippingAddress?.name}
            </p>
            <p className="text-gray-300">{formatAddress()}</p>
            <div className="pt-3 mt-3 border-t border-gray-700">
              <p className="flex items-center gap-2 text-sm text-gray-300">
                <FiMail className="text-gray-500" />
                {shippingAddress?.email}
              </p>
              <p className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                <FiPhone className="text-gray-500" />
                {shippingAddress?.phone}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h4 className="flex items-center gap-2 mb-3 font-semibold text-white">
            <FiClock className="text-yellow-500" />
            Delivery Timeline
          </h4>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg border-yellow-500/30 bg-yellow-600/10">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-300">Estimated Delivery</span>
                <span className="font-bold text-yellow-500">{getShippingTime(order.shippingMethod)}</span>
              </div>
              <p className="text-sm text-gray-400">
                You will receive tracking information once your order ships.
              </p>
            </div>
            <div className="p-4 border rounded-lg border-green-500/30 bg-green-600/10">
              <div className="flex items-center gap-2 mb-1">
                <FiShield className="text-green-500" />
                <span className="font-medium text-white">Delivery Protection</span>
              </div>
              <p className="text-sm text-gray-400">
                Your order is protected by our delivery guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;