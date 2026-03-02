// src/pages/PaymentMethods.jsx - COMPLETE with Yellow-Orange Theme, LoadingSpinner, and Algorithm Tracking
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCreditCard, 
  FiSmartphone, 
  FiDollarSign, 
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiHome,
  FiCalendar,
  FiLock,
  FiShield,
  FiMapPin
} from 'react-icons/fi';
import { BsArrowRight, BsCash } from 'react-icons/bs';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/LoadingSpinner';

// Font styles - Yellow-Orange theme
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  /* Section title styling */
  .section-title-wrapper {
    position: relative;
    display: inline-block;
    padding: 2px;
    border-radius: 12px;
    background: linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B);
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-weight: 800;
    font-size: 2rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin: 0;
    padding: 0.5rem 2rem;
    background: #111827;
    border-radius: 10px;
    display: inline-block;
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 1.5rem;
      padding: 0.4rem 1.5rem;
    }
  }
  
  .payment-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
  }
  
  .payment-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  /* COMPACT TEXT SIZES */
  .text-xs {
    font-size: 0.65rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .text-base {
    font-size: 0.9rem;
  }
  
  .text-lg {
    font-size: 1rem;
  }
  
  .text-xl {
    font-size: 1.1rem;
  }
`;

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;

// Gradient for header
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Header image
const headerImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Top Bar Component
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-1.5 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          <FiMapPin className="w-3 h-3" />
          <span>FIND STORE</span>
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ method, isDefault, onSetDefault, onRemove }) => {
  const getIcon = () => {
    switch (method.type) {
      case 'visa':
      case 'mastercard':
        return <FiCreditCard className="w-6 h-6 text-yellow-500" />;
      case 'mpesa':
        return <FiSmartphone className="w-6 h-6 text-yellow-500" />;
      case 'paypal':
        return <FiDollarSign className="w-6 h-6 text-yellow-500" />;
      default:
        return <FiCreditCard className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <div className="p-4 payment-card rounded-xl" data-aos="fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-600/10">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">
              {method.type === 'visa' ? 'Visa' : 
               method.type === 'mastercard' ? 'Mastercard' :
               method.type === 'mpesa' ? 'M-Pesa' :
               method.type === 'paypal' ? 'PayPal' : 'Card'} 
              {method.last4 && ` •••• ${method.last4}`}
            </h3>
            {method.expiry && (
              <p className="text-[10px] text-gray-400">Expires {method.expiry}</p>
            )}
            {method.phone && (
              <p className="text-[10px] text-gray-400">{method.phone}</p>
            )}
            {isDefault && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 text-[8px] font-medium text-green-500 bg-green-500/10 rounded-full">
                <FiCheckCircle className="w-2 h-2" />
                Default
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isDefault && (
            <button
              onClick={() => onSetDefault(method.id)}
              className="p-1.5 text-xs text-gray-400 transition-colors rounded-lg hover:text-yellow-500 hover:bg-white/5"
              title="Set as default"
            >
              <FiCheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onRemove(method.id)}
            className="p-1.5 text-xs text-gray-400 transition-colors rounded-lg hover:text-red-500 hover:bg-white/5"
            title="Remove"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Payment Method Form
const AddPaymentForm = ({ onClose, onAdd }) => {
  const [methodType, setMethodType] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newMethod = {
      id: Date.now().toString(),
      type: methodType,
      last4: cardNumber.slice(-4),
      expiry,
      name: cardName,
      phone: methodType === 'mpesa' ? phone : undefined,
      isDefault
    };
    
    onAdd(newMethod);
  };

  return (
    <div className="p-6 payment-card rounded-xl" data-aos="zoom-in">
      <h3 className="mb-4 text-sm font-semibold text-white">Add Payment Method</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-[10px] text-gray-400">Payment Method</label>
          <select
            value={methodType}
            onChange={(e) => setMethodType(e.target.value)}
            className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
          >
            <option value="card">Credit / Debit Card</option>
            <option value="mpesa">M-Pesa</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        {methodType === 'card' && (
          <>
            <div>
              <label className="block mb-1 text-[10px] text-gray-400">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-[10px] text-gray-400">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[10px] text-gray-400">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-[10px] text-gray-400">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                  required
                />
              </div>
            </div>
          </>
        )}

        {methodType === 'mpesa' && (
          <div>
            <label className="block mb-1 text-[10px] text-gray-400">M-Pesa Phone Number</label>
            <input
              type="tel"
              placeholder="07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
              required
            />
          </div>
        )}

        {methodType === 'paypal' && (
          <div>
            <label className="block mb-1 text-[10px] text-gray-400">PayPal Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
              required
            />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-3.5 h-3.5 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
          />
          <span className="text-xs text-gray-400">Set as default payment method</span>
        </label>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-3 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            Add Method
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-300 transition-colors border border-gray-700 rounded-lg hover:text-white hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2 p-3 mt-4 border rounded-lg border-yellow-600/20 bg-yellow-600/5">
        <FiShield className="w-4 h-4 text-yellow-500" />
        <p className="text-[10px] text-gray-400">
          Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
};

const PaymentMethods = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  // Algorithm performance states (internal only)
  const [loadTime, setLoadTime] = useState(null);
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 30,
      easing: 'ease-out-cubic',
    });
  }, []);

  // Inject styles and load data
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    // Simulate loading
    const loadData = async () => {
      const startTime = performance.now();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      setPaymentMethods([
        {
          id: '1',
          type: 'visa',
          last4: '4242',
          expiry: '12/25',
          name: 'John Doe',
          isDefault: true
        },
        {
          id: '2',
          type: 'mastercard',
          last4: '8888',
          expiry: '06/24',
          name: 'John Doe',
          isDefault: false
        },
        {
          id: '3',
          type: 'mpesa',
          phone: '0712 345 678',
          isDefault: false
        }
      ]);
      
      const endTime = performance.now();
      setLoadTime((endTime - startTime).toFixed(0));
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: 0
      }));
      
      console.log(`⚡ Payment methods loaded in ${(endTime - startTime).toFixed(0)}ms`);
      
      setLoading(false);
      setInitialLoad(false);
    };
    
    loadData();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSetDefault = (id) => {
    const updated = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
    setPaymentMethods(updated);
    toast.success('Default payment method updated');
  };

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(paymentMethods.filter(m => m.id !== id));
      toast.success('Payment method removed');
    }
  };

  const handleAddMethod = (newMethod) => {
    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddForm(false);
    toast.success('Payment method added successfully');
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        <TopBar />

        {/* Header Image */}
        <div 
          className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={headerImage}
              alt="Payment Methods"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="w-full px-4 mx-auto max-w-7xl">
              <div 
                className="max-w-2xl"
                data-aos="fade-right"
                data-aos-duration="1200"
              >
                <div className="section-title-wrapper">
                  <h1 className="section-title">PAYMENT METHODS</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading payment methods...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading payment methods..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>

      <TopBar />

      {/* Header Image */}
      <div 
        className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={headerImage}
            alt="Payment Methods"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
            >
              <div className="section-title-wrapper">
                <h1 className="section-title">PAYMENT METHODS</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                Manage your payment options
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-yellow-500">Dashboard</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Payment Methods</span>
        </nav>

        {/* Payment Methods List */}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isDefault={method.isDefault}
              onSetDefault={handleSetDefault}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Add New Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-full gap-2 p-4 mt-4 border border-dashed rounded-xl payment-card border-yellow-500/30 hover:border-yellow-500/50"
            data-aos="fade-up"
          >
            <FiPlus className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-white">Add New Payment Method</span>
          </button>
        )}

        {/* Add Payment Form */}
        {showAddForm && (
          <div className="mt-4">
            <AddPaymentForm
              onClose={() => setShowAddForm(false)}
              onAdd={handleAddMethod}
            />
          </div>
        )}

        {/* Security Note */}
        <div className="flex items-center gap-2 p-4 mt-6 payment-card rounded-xl">
          <FiLock className="w-5 h-5 text-yellow-500" />
          <p className="text-xs text-gray-400">
            Your payment information is stored securely and encrypted. We never store your full card details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;