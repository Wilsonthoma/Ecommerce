// src/components/orders/PaymentInfo.jsx
import React from 'react';
import { FiCreditCard, FiCalendar } from 'react-icons/fi';

const PaymentInfo = ({ order }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paymentMethodLabels = {
    credit_card: 'Credit Card',
    paypal: 'PayPal',
    mpesa: 'M-Pesa',
    cash: 'Cash on Delivery',
    delivery: 'Pay on Delivery'
  };

  return (
    <div className="p-6 border border-gray-800 rounded-2xl confirmation-card">
      <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
        <FiCreditCard className="text-yellow-500" />
        Payment Information
      </h3>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400">Payment Method</div>
          <div className="flex items-center gap-2 font-medium text-white">
            <FiCreditCard className="text-yellow-500" />
            {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Payment Status</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="font-medium text-white capitalize">{order.paymentStatus || 'pending'}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Order Date</div>
          <div className="flex items-center gap-2 font-medium text-gray-300">
            <FiCalendar className="text-yellow-500" />
            {formatDate(order.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;