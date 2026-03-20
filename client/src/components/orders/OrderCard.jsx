// src/components/orders/OrderCard.jsx
import React, { useState } from 'react';
import { FiPackage, FiCalendar, FiChevronDown, FiChevronUp, FiEye, FiStar, FiRefreshCw, FiXCircle, FiDownload, FiMapPin as FiMapIcon } from 'react-icons/fi';
import StatusBadge from '../ui/StatusBadge';
import Price from '../ui/Price';
import OrderTimeline from '../ui/OrderTimeline';
import { formatDate } from '../../utils/dateUtils';

const OrderCard = ({ order, onViewDetails, onReorder, onCancel, onDownloadInvoice }) => {
  const [expanded, setExpanded] = useState(false);
  const getFullImageUrl = (imagePath) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg';
    if (!imagePath) return FALLBACK_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="overflow-hidden transition-all duration-300 order-card">
      {/* Order Header */}
      <div className="p-3 border-b border-gray-800 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
              <FiPackage className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Order #{order.orderNumber || order._id?.slice(-8)}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusBadge status={order.status} size="sm" />
                <span className="text-[10px] text-gray-500">
                  <FiCalendar className="inline w-2.5 h-2.5 mr-0.5" />
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <Price price={order.totalAmount} size="xs" className="text-xs font-semibold" />
              <p className="text-[10px] text-gray-400">{order.items?.length || 0} items</p>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/5"
            >
              {expanded ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      {!expanded && order.items && order.items.length > 0 && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {order.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-8 h-8 overflow-hidden bg-gray-800 rounded-lg">
                  <img 
                    src={getFullImageUrl(item.image)} 
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-[10px]">
                  <p className="font-medium text-white truncate max-w-[80px]">{item.name}</p>
                  <p className="text-gray-400">x{item.quantity}</p>
                </div>
              </div>
            ))}
            {order.items.length > 3 && (
              <span className="text-[10px] text-gray-500">+{order.items.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="p-3 space-y-3 animate-fadeIn">
          {/* Order Items */}
          <div>
            <h4 className="mb-1.5 text-[10px] font-semibold text-gray-400">ITEMS</h4>
            <div className="space-y-1.5">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-800/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 overflow-hidden bg-gray-800 rounded-lg">
                      <img 
                        src={getFullImageUrl(item.image)} 
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <Price price={item.price * item.quantity} size="xs" />
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-gray-800/30">
            <div>
              <p className="text-[10px] text-gray-400">Subtotal</p>
              <Price price={order.subtotal || order.totalAmount} size="xs" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Shipping</p>
              <p className="text-xs font-medium text-white">{order.shippingCost ? `KSh ${order.shippingCost}` : 'Free'}</p>
            </div>
            {order.discount > 0 && (
              <div>
                <p className="text-[10px] text-gray-400">Discount</p>
                <p className="text-xs font-medium text-green-500">-KSh {order.discount}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-gray-400">Total</p>
              <Price price={order.totalAmount} size="sm" className="text-yellow-500" />
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <h4 className="mb-1 text-[10px] font-semibold text-gray-400">SHIPPING ADDRESS</h4>
              <div className="p-2 rounded-lg bg-gray-800/30">
                <div className="flex items-start gap-1.5">
                  <FiMapIcon className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white">{order.shippingAddress.fullName || order.shippingAddress.name}</p>
                    <p className="text-[10px] text-gray-400">{order.shippingAddress.address}</p>
                    <p className="text-[10px] text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <OrderTimeline status={order.status} estimatedDelivery={order.estimatedDelivery} compact />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => onViewDetails(order._id)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
            >
              <FiEye className="w-2.5 h-2.5" />
              View
            </button>
            
            {order.status?.toLowerCase() === 'delivered' && (
              <>
                <button
                  onClick={() => onReorder(order)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <FiRefreshCw className="w-2.5 h-2.5" />
                  Reorder
                </button>
                <button
                  onClick={() => onDownloadInvoice(order._id)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gray-700"
                >
                  <FiDownload className="w-2.5 h-2.5" />
                  Invoice
                </button>
              </>
            )}

            {['pending', 'processing'].includes(order.status?.toLowerCase()) && (
              <button
                onClick={() => onCancel(order._id)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gradient-to-r from-red-600 to-pink-600"
              >
                <FiXCircle className="w-2.5 h-2.5" />
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;