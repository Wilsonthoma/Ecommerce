// src/components/OrderSummary.jsx
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiTag, FiTruck, FiCreditCard, FiInfo } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { clientOrderService } from '../services/client/orders';
import { toast } from 'react-hot-toast';

const OrderSummary = ({ 
  showItems = true, 
  showDiscount = true, 
  showShipping = true, 
  showTax = true,
  showActions = true,
  compact = false,
  editable = false,
  onCheckout,
  className = ''
}) => {
  const { 
    cart, 
    appliedPromo, 
    applyDiscount, 
    removeDiscount,
    calculateShipping,
    calculateTax,
    calculateTotal,
    getCartSummary,
    setShippingMethod
  } = useCart();
  
  const [expanded, setExpanded] = useState(!compact);
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [shippingExpanded, setShippingExpanded] = useState(false);
  
  const summary = getCartSummary();
  
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    
    setApplyingDiscount(true);
    try {
      await applyDiscount(discountCode);
      setDiscountCode('');
    } catch (error) {
      // Error handled in applyDiscount
    } finally {
      setApplyingDiscount(false);
    }
  };
  
  const handleRemoveDiscount = () => {
    removeDiscount();
  };
  
  const handleShippingMethodChange = (method) => {
    setShippingMethod(method);
    toast.success('Shipping method updated');
  };
  
  const renderShippingOptions = () => {
    const options = [
      { id: 'standard', name: 'Standard Shipping', price: 300, time: '5-7 business days' },
      { id: 'express', name: 'Express Shipping', price: 500, time: '2-3 business days' },
    ];
    
    return (
      <div className="mt-4 space-y-2">
        {options.map(option => (
          <label key={option.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shippingMethod"
                value={option.id}
                checked={cart.shippingMethod === option.id}
                onChange={() => handleShippingMethodChange(option.id)}
                className="text-blue-600"
              />
              <div>
                <div className="font-medium">{option.name}</div>
                <div className="text-sm text-gray-600">{option.time}</div>
              </div>
            </div>
            <div className="font-semibold">
              {option.price === 0 ? 'FREE' : `KSh ${option.price}`}
            </div>
          </label>
        ))}
        
        {summary.subtotal >= 6000 && (
          <div className="p-3 mt-3 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2 text-green-700">
              <FiInfo />
              <span className="text-sm font-medium">Free shipping on orders over KSh 6,000!</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`bg-white rounded-xl border ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Order Summary</h3>
          {compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
          )}
        </div>
        
        {/* Items List */}
        {expanded && showItems && cart.items.length > 0 && (
          <div className="mb-6">
            <div className="pr-2 space-y-4 overflow-y-auto max-h-60">
              {cart.items.map((item, index) => (
                <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-100 rounded-lg">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <FiInfo size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.size && (
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded">Color: {item.color}</span>
                      )}
                      {item.variant && (
                        <span className="px-2 py-1 text-xs bg-gray-100 rounded">{item.variant}</span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      KSh {((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                    </div>
                    {item.discountPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        KSh {(item.price * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Discount Code */}
        {expanded && showDiscount && editable && (
          <div className="mb-6">
            {appliedPromo ? (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiTag className="text-green-600" />
                    <div>
                      <div className="font-medium">Promo Code Applied</div>
                      <div className="text-sm text-gray-600">
                        {appliedPromo.type === 'percentage' 
                          ? `${appliedPromo.value}% off` 
                          : `KSh ${appliedPromo.value} off`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-green-700">
                      -KSh {appliedPromo.discountAmount.toFixed(2)}
                    </span>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-medium">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount || !discountCode.trim()}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applyingDiscount ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Shipping Options */}
        {expanded && showShipping && editable && (
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShippingExpanded(!shippingExpanded)}
            >
              <div className="flex items-center gap-2">
                <FiTruck />
                <span className="font-medium">Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {summary.shipping === 0 ? 'FREE' : `KSh ${summary.shipping.toFixed(2)}`}
                </span>
                {shippingExpanded ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </div>
            
            {shippingExpanded && renderShippingOptions()}
          </div>
        )}
        
        {/* Order Totals */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">KSh {summary.subtotal.toFixed(2)}</span>
          </div>
          
          {summary.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span className="font-medium">-KSh {summary.discount.toFixed(2)}</span>
            </div>
          )}
          
          {showShipping && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {summary.shipping === 0 ? 'FREE' : `KSh ${summary.shipping.toFixed(2)}`}
              </span>
            </div>
          )}
          
          {showTax && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (16% VAT)</span>
              <span className="font-medium">KSh {summary.tax.toFixed(2)}</span>
            </div>
          )}
          
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>KSh {summary.total.toFixed(2)}</span>
            </div>
            {summary.subtotal < 6000 && (
              <div className="mt-2 text-sm text-gray-600">
                Add KSh {(6000 - summary.subtotal).toFixed(2)} more for free shipping
              </div>
            )}
          </div>
        </div>
        
        {/* Checkout Button */}
        {showActions && onCheckout && (
          <button
            onClick={onCheckout}
            disabled={cart.items.length === 0}
            className="w-full py-3 mt-6 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Checkout
          </button>
        )}
        
        {/* Payment Methods */}
        {showActions && (
          <div className="mt-4">
            <div className="mb-2 text-sm text-gray-600">Secure payment with:</div>
            <div className="flex items-center gap-3">
              <div className="p-2 border rounded">
                <FiCreditCard className="text-gray-500" />
              </div>
              <div className="text-sm">Visa • MasterCard • M-Pesa • PayPal</div>
            </div>
          </div>
        )}
        
        {/* Security Badge */}
        {showActions && (
          <div className="pt-6 mt-6 text-center border-t">
            <div className="text-xs text-gray-500">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure SSL Encryption</span>
              </div>
              <p>Your payment information is protected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;