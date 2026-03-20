// src/pages/Checkout.jsx - COMPACT with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { clientOrderService } from '../services/client/orders';
import { clientProductService } from '../services/client/products';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import Price, { formatKES } from '../components/ui/Price';
import { toast } from 'react-toastify';
import {
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiHome,
  FiChevronRight,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiShield,
  FiPackage,
  FiCheckCircle,
  FiEdit2
} from 'react-icons/fi';
import { BsArrowRight, BsCash } from 'react-icons/bs';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';

// Header image
const checkoutHeaderImage = "https://images.pexels.com/photos/4481256/pexels-photo-4481256.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
  return `${API_URL}/uploads/products/${imagePath}`;
};

// Payment Method Card
const PaymentMethodCard = ({ method, selected, onSelect, icon: Icon, title, description }) => {
  return (
    <div
      onClick={() => onSelect(method)}
      className={`payment-method-card ${selected ? 'selected' : ''}`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${selected ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'}`}>
          <Icon className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        {selected && (
          <FiCheckCircle className="w-4 h-4 text-yellow-500" />
        )}
      </div>
    </div>
  );
};

// Order Item Component
const OrderItem = ({ item }) => {
  const price = item.discountPrice || item.price || 0;
  const image = item.images?.[0]?.url || item.image || FALLBACK_IMAGE;
  
  return (
    <div className="flex gap-1.5 py-1.5 border-b border-gray-800 last:border-0">
      <div className="relative flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-800 rounded-lg">
        <img
          src={getFullImageUrl(image)}
          alt={item.name}
          className="object-cover w-full h-full"
          onError={(e) => e.target.src = FALLBACK_IMAGE}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-medium text-white truncate">{item.name}</h4>
        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
        <Price price={price * item.quantity} size="xs" className="text-yellow-500" />
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartSummary, clearCart } = useCart();

  // Check if this is a direct checkout
  const isDirectCheckout = location.state?.directCheckout || false;
  const directItems = location.state?.items || [];
  const directTotal = location.state?.totalAmount || 0;

  // Use either cart items or direct items
  const checkoutItems = isDirectCheckout ? directItems : cart.items;
  const checkoutTotal = isDirectCheckout ? directTotal : getCartSummary().subtotal;

  // State
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    county: '',
    town: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Payment methods
  const paymentMethods = [
    { id: 'mpesa', title: 'M-Pesa', description: 'Pay via M-Pesa', icon: FiSmartphone },
    { id: 'card', title: 'Card', description: 'Visa, Mastercard', icon: FiCreditCard },
    { id: 'cash', title: 'Cash on Delivery', description: 'Pay on delivery', icon: BsCash }
  ];

  // Load saved addresses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }
  }, []);

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

  // Simulate loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
    }, 500);
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isDirectCheckout && cart.items.length === 0 && !loading) {
      toast.info('Your cart is empty');
      navigate('/cart');
    }
  }, [cart.items, navigate, isDirectCheckout, loading]);

  const validateAddress = () => {
    const newErrors = {};
    if (!address.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!address.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!address.addressLine.trim()) newErrors.addressLine = 'Address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateAddress()) {
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (step === 2) {
      if (!paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveAddress = () => {
    const updated = [...savedAddresses, { ...address, id: Date.now() }];
    setSavedAddresses(updated);
    localStorage.setItem('savedAddresses', JSON.stringify(updated));
    toast.success('Address saved');
  };

  const loadAddress = (saved) => {
    setAddress(saved);
    setShowSavedAddresses(false);
  };

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) {
      toast.error('No items to order');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = checkoutItems.map(item => ({
        productId: item.id || item.productId,
        name: item.name,
        price: item.discountPrice || item.price || 0,
        quantity: item.quantity,
        image: item.images?.[0]?.url || item.image
      }));

      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal + shippingFee;
      
      const shippingAddress = `${address.addressLine}, ${address.town}, ${address.city}`;

      const orderData = {
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          email: address.email || undefined,
          address: shippingAddress,
          city: address.city,
          county: address.county,
          town: address.town,
          postalCode: address.postalCode || undefined
        },
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shippingCost: shippingFee,
        totalAmount: total,
        status: 'pending',
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'processing'
      };

      const response = await clientOrderService.createOrder(orderData);

      if (response && response.success) {
        toast.success('Order placed successfully!');
        
        if (window.confirm('Would you like to save this address for future orders?')) {
          saveAddress();
        }

        if (!isDirectCheckout) {
          clearCart();
        }

        sessionStorage.removeItem('directCheckout');

        if (response.order && response.order._id) {
          navigate(`/order-confirmation/${response.order._id}`);
        } else {
          navigate('/orders');
        }
      } else {
        toast.error(response?.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = isDirectCheckout ? checkoutTotal : getCartSummary().subtotal;
  const total = subtotal + shippingFee;

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="CHECKOUT" 
          subtitle="Loading checkout..."
          image={checkoutHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading checkout..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="CHECKOUT" 
        subtitle={isDirectCheckout ? 'Complete your purchase' : 'Complete your order'}
        image={checkoutHeaderImage}
      />

      <div className="container px-3 py-3 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-2 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-2 h-2 text-gray-600" />
          <button onClick={() => navigate('/shop')} className="text-gray-400 hover:text-yellow-500">Shop</button>
          <FiChevronRight className="w-2 h-2 text-gray-600" />
          {!isDirectCheckout && (
            <>
              <button onClick={() => navigate('/cart')} className="text-gray-400 hover:text-yellow-500">Cart</button>
              <FiChevronRight className="w-2 h-2 text-gray-600" />
            </>
          )}
          <span className="font-medium text-white truncate">Checkout</span>
        </nav>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
              step >= 1 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'
            }`}>
              <span className="text-xs font-medium text-white">1</span>
            </div>
            <span className={`ml-1 text-xs hidden sm:inline ${step >= 1 ? 'text-yellow-500' : 'text-gray-500'}`}>Address</span>
          </div>
          <div className={`w-8 h-0.5 mx-1.5 ${step >= 2 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
              step >= 2 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'
            }`}>
              <span className="text-xs font-medium text-white">2</span>
            </div>
            <span className={`ml-1 text-xs hidden sm:inline ${step >= 2 ? 'text-yellow-500' : 'text-gray-500'}`}>Payment</span>
          </div>
          <div className={`w-8 h-0.5 mx-1.5 ${step >= 3 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
              step >= 3 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gray-800'
            }`}>
              <span className="text-xs font-medium text-white">3</span>
            </div>
            <span className={`ml-1 text-xs hidden sm:inline ${step >= 3 ? 'text-yellow-500' : 'text-gray-500'}`}>Review</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Left Column - Forms */}
          <div className="space-y-3 lg:w-2/3">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div className="order-summary-card">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-white">Shipping Address</h2>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                      className="text-xs text-yellow-500 hover:text-yellow-400"
                    >
                      {showSavedAddresses ? 'Hide' : 'Use saved'}
                    </button>
                  )}
                </div>

                {/* Saved Addresses */}
                {showSavedAddresses && savedAddresses.length > 0 && (
                  <div className="mb-2 space-y-1 overflow-y-auto max-h-28 custom-scrollbar">
                    {savedAddresses.map((saved) => (
                      <div
                        key={saved.id}
                        onClick={() => loadAddress(saved)}
                        className="flex items-center justify-between p-1.5 text-xs transition-colors border border-gray-800 rounded-lg cursor-pointer bg-gray-800/30 hover:border-yellow-500/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">{saved.fullName}</p>
                          <p className="text-gray-400">{saved.addressLine}, {saved.town}</p>
                        </div>
                        <FiEdit2 className="w-3 h-3 text-gray-500" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Address Form */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-400">Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        className={`w-full pl-7 input-field ${errors.fullName ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.fullName && <p className="mt-0.5 text-xs text-red-500">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400">Phone Number *</label>
                    <div className="relative">
                      <FiPhone className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        className={`w-full pl-7 input-field ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="mt-0.5 text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400">Email Address (optional)</label>
                    <div className="relative">
                      <FiMail className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
                      <input
                        type="email"
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        className="w-full pl-7 input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400">Address Line *</label>
                    <div className="relative">
                      <FiHome className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
                      <input
                        type="text"
                        value={address.addressLine}
                        onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                        className={`w-full pl-7 input-field ${errors.addressLine ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.addressLine && <p className="mt-0.5 text-xs text-red-500">{errors.addressLine}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400">City *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className={`w-full input-field ${errors.city ? 'border-red-500' : ''}`}
                    />
                    {errors.city && <p className="mt-0.5 text-xs text-red-500">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400">County</label>
                    <input
                      type="text"
                      value={address.county}
                      onChange={(e) => setAddress({ ...address, county: e.target.value })}
                      className="w-full input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400">Town/Area</label>
                    <input
                      type="text"
                      value={address.town}
                      onChange={(e) => setAddress({ ...address, town: e.target.value })}
                      className="w-full input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400">Postal Code (optional)</label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="w-full input-field"
                    />
                  </div>
                </div>

                {/* Shipping Fee Preview */}
                {shippingFee > 0 && (
                  <div className="flex items-center justify-between p-1.5 mt-2 text-xs border border-yellow-500/20 rounded-lg bg-yellow-600/10">
                    <span className="text-gray-400">Shipping Fee:</span>
                    <span className="font-semibold text-yellow-500">{formatKES(shippingFee)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="order-summary-card">
                <h2 className="mb-2 text-sm font-semibold text-white">Payment Method</h2>
                <div className="space-y-1.5">
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method.id}
                      selected={paymentMethod === method.id}
                      onSelect={setPaymentMethod}
                      icon={method.icon}
                      title={method.title}
                      description={method.description}
                    />
                  ))}
                </div>

                {paymentMethod === 'mpesa' && (
                  <div className="p-1.5 mt-2 text-xs border rounded-lg border-yellow-500/20 bg-yellow-600/10">
                    <p className="text-yellow-500">You'll receive an M-Pesa prompt</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="order-summary-card">
                <h2 className="mb-2 text-sm font-semibold text-white">Review Order</h2>
                
                {/* Shipping Address Review */}
                <div className="p-1.5 mb-1.5 text-xs border border-gray-800 rounded-lg">
                  <h3 className="mb-0.5 font-medium text-yellow-500">Shipping Address</h3>
                  <p className="text-white">{address.fullName}</p>
                  <p className="text-gray-400">{address.addressLine}, {address.town}</p>
                  <p className="text-gray-400">{address.city}</p>
                  <p className="text-gray-400">Phone: {address.phone}</p>
                </div>

                {/* Payment Method Review */}
                <div className="p-1.5 mb-1.5 text-xs border border-gray-800 rounded-lg">
                  <h3 className="mb-0.5 font-medium text-yellow-500">Payment Method</h3>
                  <p className="text-white capitalize">
                    {paymentMethods.find(m => m.id === paymentMethod)?.title || paymentMethod}
                  </p>
                </div>

                {/* Items Review */}
                <div>
                  <h3 className="mb-1 text-xs font-medium text-yellow-500">Items</h3>
                  <div className="space-y-1 overflow-y-auto max-h-32 custom-scrollbar">
                    {checkoutItems.map((item) => (
                      <OrderItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="sticky order-summary-card top-4">
              <h2 className="flex items-center gap-1 mb-2 text-sm font-semibold text-white">
                <FiPackage className="w-4 h-4 text-yellow-500" />
                Order Summary
              </h2>

              {/* Items Preview */}
              <div className="mb-2 space-y-1 overflow-y-auto text-xs max-h-32 custom-scrollbar">
                {checkoutItems.map((item) => {
                  const price = item.discountPrice || item.price || 0;
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-400 truncate max-w-[100px]">
                        {item.name} <span className="text-gray-500">×{item.quantity}</span>
                      </span>
                      <span className="text-white">{formatKES(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="pt-1.5 space-y-1 text-xs border-t border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-yellow-500">{formatKES(shippingFee)}</span>
                </div>
                <div className="pt-1 mt-1 text-sm font-bold border-t border-gray-800">
                  <div className="flex justify-between">
                    <span className="text-white">Total</span>
                    <span className="text-yellow-500">{formatKES(total)}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-1.5 mt-3">
                {step > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-300 transition-colors border border-gray-700 rounded-full btn-outline"
                  >
                    Back
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-white rounded-full btn-gradient"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-white rounded-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-1">
                        <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        <span>Processing</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        Place Order
                        <BsArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-yellow-500">
                <FiShield className="w-3 h-3" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .order-summary-card {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 0.6rem;
          padding: 0.8rem;
        }
        
        .input-field {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 0.4rem;
          padding: 0.4rem 0.6rem;
          color: white;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }
        
        .input-field:focus {
          border-color: #F59E0B;
          outline: none;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }
        
        .payment-method-card {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 0.6rem;
          padding: 0.6rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .payment-method-card:hover {
          border-color: #F59E0B;
          transform: translateY(-1px);
          box-shadow: 0 5px 15px -5px rgba(245, 158, 11, 0.3);
        }
        
        .payment-method-card.selected {
          border-color: #F59E0B;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
        }
        
        .btn-gradient {
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          transition: all 0.3s ease;
        }
        
        .btn-gradient:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.5);
        }
        
        .btn-outline {
          background: transparent;
          border: 1px solid rgba(75, 85, 99, 0.5);
          transition: all 0.3s ease;
        }
        
        .btn-outline:hover {
          border-color: #F59E0B;
          background: rgba(245, 158, 11, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.5);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default Checkout;