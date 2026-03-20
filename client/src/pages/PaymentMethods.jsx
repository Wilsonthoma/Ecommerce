// src/pages/PaymentMethods.jsx - COMPLETE with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCreditCard, 
  FiSmartphone, 
  FiDollarSign, 
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiChevronRight,
  FiLock,
  FiShield
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// Header image
const headerImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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
            className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
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
                className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
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
                className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
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
                  className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
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
                  className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
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
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
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
              className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
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

  // Load data
  useEffect(() => {
    setTimeout(() => {
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
      setLoading(false);
      setInitialLoad(false);
    }, 500);
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
        <TopBar />
        <PageHeader 
          title="PAYMENT METHODS" 
          subtitle="Loading payment methods..."
          image={headerImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading payment methods..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="PAYMENT METHODS" 
        subtitle="Manage your payment options"
        image={headerImage}
      />

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