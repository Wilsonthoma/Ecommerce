// src/components/OrderSummary.jsx - UPDATED with indigo/blue/cyan theme
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiTag, FiTruck, FiCreditCard, FiInfo, FiShield } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { clientOrderService } from '../services/client/orders';
import { toast } from 'react-toastify';

// Font styles matching homepage
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  }
`;

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

  // Inject styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
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
  
  const formatKES = (amount) => {
    if (!amount && amount !== 0) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
  };
  
  const renderShippingOptions = () => {
    const options = [
      { id: 'standard', name: 'Standard Shipping', price: 300, time: '5-7 business days' },
      { id: 'express', name: 'Express Shipping', price: 500, time: '2-3 business days' },
    ];
    
    return (
      <div className="mt-4 space-y-2">
        {options.map(option => (
          <label key={option.id} className="flex items-center justify-between p-3 transition-all border border-gray-700 rounded-lg cursor-pointer bg-gray-800/95 hover:border-indigo-500/50 group">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shippingMethod"
                value={option.id}
                checked={cart.shippingMethod === option.id}
                onChange={() => handleShippingMethodChange(option.id)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-white">{option.name}</div>
                <div className="text-sm text-gray-400">{option.time}</div>
              </div>
            </div>
            <div className="font-semibold text-indigo-500">
              {option.price === 0 ? 'FREE' : formatKES(option.price)}
            </div>
          </label>
        ))}
        
        {summary.subtotal >= 6000 && (
          <div className="p-3 mt-3 border rounded-lg border-green-500/30 bg-green-600/10">
            <div className="flex items-center gap-2 text-green-500">
              <FiInfo />
              <span className="text-sm font-medium">Free shipping on orders over KSh 6,000!</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-xl ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Order Summary</h3>
          {compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 transition-colors hover:text-white"
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
                <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex items-center gap-4 pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-800 rounded-lg">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        <FiInfo size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.size && (
                        <span className="px-2 py-1 text-xs text-gray-300 bg-gray-800 rounded">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="px-2 py-1 text-xs text-gray-300 bg-gray-800 rounded">Color: {item.color}</span>
                      )}
                      {item.variant && (
                        <span className="px-2 py-1 text-xs text-gray-300 bg-gray-800 rounded">{item.variant}</span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-400">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-indigo-500">
                      {formatKES((item.discountPrice || item.price) * item.quantity)}
                    </div>
                    {item.discountPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatKES(item.price * item.quantity)}
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
              <div className="p-4 border rounded-lg border-green-500/30 bg-green-600/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiTag className="text-green-500" />
                    <div>
                      <div className="font-medium text-white">Promo Code Applied</div>
                      <div className="text-sm text-gray-400">
                        {appliedPromo.type === 'percentage' 
                          ? `${appliedPromo.value}% off` 
                          : `${formatKES(appliedPromo.value)} off`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-green-500">
                      -{formatKES(appliedPromo.discountAmount)}
                    </span>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-sm font-medium text-red-500 transition-colors hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount || !discountCode.trim()}
                    className="px-4 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <FiTruck className="text-indigo-500" />
                <span className="font-medium text-white">Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-500">
                  {summary.shipping === 0 ? 'FREE' : formatKES(summary.shipping)}
                </span>
                {shippingExpanded ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
              </div>
            </div>
            
            {shippingExpanded && renderShippingOptions()}
          </div>
        )}
        
        {/* Order Totals */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-medium text-white">{formatKES(summary.subtotal)}</span>
          </div>
          
          {summary.discount > 0 && (
            <div className="flex justify-between text-green-500">
              <span>Discount</span>
              <span className="font-medium">-{formatKES(summary.discount)}</span>
            </div>
          )}
          
          {showShipping && (
            <div className="flex justify-between">
              <span className="text-gray-400">Shipping</span>
              <span className="font-medium text-indigo-500">
                {summary.shipping === 0 ? 'FREE' : formatKES(summary.shipping)}
              </span>
            </div>
          )}
          
          {showTax && (
            <div className="flex justify-between">
              <span className="text-gray-400">Tax (16% VAT)</span>
              <span className="font-medium text-white">{formatKES(summary.tax)}</span>
            </div>
          )}
          
          <div className="pt-4 mt-4 border-t border-gray-700">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-indigo-500 glow-text">{formatKES(summary.total)}</span>
            </div>
            {summary.subtotal < 6000 && (
              <div className="mt-2 text-sm text-gray-400">
                Add {formatKES(6000 - summary.subtotal)} more for free shipping
              </div>
            )}
          </div>
        </div>
        
        {/* Checkout Button */}
        {showActions && onCheckout && (
          <button
            onClick={onCheckout}
            disabled={cart.items.length === 0}
            className="relative w-full py-3 mt-6 overflow-hidden text-sm font-medium text-white transition-all rounded-lg group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
            <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
            <span className="relative flex items-center justify-center gap-2">
              Proceed to Checkout
            </span>
          </button>
        )}
        
        {/* Payment Methods */}
        {showActions && (
          <div className="mt-4">
            <div className="mb-2 text-sm text-gray-400">Secure payment with:</div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 border border-gray-700 rounded">
                <FiCreditCard className="text-gray-400" />
              </div>
              <div className="text-sm text-gray-300">Visa • MasterCard • M-Pesa • PayPal</div>
            </div>
          </div>
        )}
        
        {/* Security Badge */}
        {showActions && (
          <div className="pt-6 mt-6 text-center border-t border-gray-700">
            <div className="text-xs text-gray-400">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FiShield className="w-4 h-4 text-indigo-500" />
                <span className="text-indigo-500">Secure SSL Encryption</span>
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