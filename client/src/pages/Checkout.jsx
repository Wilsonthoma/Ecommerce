// src/pages/Checkout.jsx - UPDATED with full-page background and indigo/blue/cyan theme
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { clientOrderService } from '../services/client/orders';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiLock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiShield,
  FiClock,
  FiGlobe,
  FiDollarSign,
  FiScale,
  FiRuler,
  FiMapPin as FiMapPinIcon
} from 'react-icons/fi';

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

// Animation styles
const animationStyles = `
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  .animate-pulse {
    animation: pulse 3s ease-in-out infinite;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .delay-1000 {
    animation-delay: 1s;
  }
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d-content {
    transform: translateZ(20px);
  }
`;

// Background image
const checkoutBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for bottom transition - indigo/blue/cyan
const bottomGradient = "from-indigo-600/20 via-blue-600/20 to-cyan-600/20";

// Top Bar Component (matching homepage)
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-3 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-end px-6 mx-auto space-x-6 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <FiMapPinIcon className="w-4 h-4" />
          FIND STORE
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Kenya',
    paymentMethod: 'mpesa',
    shippingMethod: 'standard',
    notes: ''
  });
  
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  const steps = [
    { id: 1, title: 'Shipping', icon: <FiTruck /> },
    { id: 2, title: 'Payment', icon: <FiCreditCard /> },
    { id: 3, title: 'Confirm', icon: <FiCheck /> }
  ];

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart?.items?.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0;
      return sum + (price * item.quantity);
    }, 0) || 0;
  };

  // Calculate shipping cost based on items and selected method
  const calculateShippingCost = () => {
    let totalShipping = 0;
    
    cart.items.forEach(item => {
      if (item.freeShipping) return;
      if (item.flatShippingRate > 0) {
        totalShipping += item.flatShippingRate * item.quantity;
      } else {
        // Default rates based on shipping method
        switch (formData.shippingMethod) {
          case 'express':
            totalShipping += 500 * item.quantity;
            break;
          case 'overnight':
            totalShipping += 1500 * item.quantity;
            break;
          default:
            // Standard shipping free for now
            break;
        }
      }
    });
    
    return totalShipping;
  };

  // Calculate tax (8%)
  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + shippingCost + calculateTax();
  };

  useEffect(() => {
    setShippingCost(calculateShippingCost());
  }, [formData.shippingMethod, cart.items]);

  // Format KES
  const formatKES = (amount) => {
    if (!amount && amount !== 0) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
  };

  // Format zone name
  const formatZoneName = (zone) => {
    const zoneNames = {
      'na': 'North America',
      'eu': 'Europe',
      'asia': 'Asia',
      'africa': 'Africa',
      'sa': 'South America',
      'oceania': 'Oceania'
    };
    return zoneNames[zone] || zone;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (activeStep < 3) {
      // Validate current step before proceeding
      if (activeStep === 1 && !validateShippingInfo()) {
        toast.error('Please fill in all required shipping information');
        return;
      }
      if (activeStep === 2 && !validatePaymentInfo()) {
        toast.error('Please complete payment information');
        return;
      }
      setActiveStep(activeStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    return required.every(field => formData[field]?.trim());
  };

  const validatePaymentInfo = () => {
    return formData.paymentMethod;
  };

  const handlePlaceOrder = async () => {
    if (!validateShippingInfo()) {
      toast.error('Please complete all required fields');
      return;
    }

    if (cart?.items?.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
      return;
    }

    setLoading(true);
    setIsProcessingPayment(true);

    try {
      const orderData = {
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        items: cart.items.map(item => ({
          productId: item.id || item.productId,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity,
          sku: item.sku,
          weight: item.weight,
          weightUnit: item.weightUnit,
          requiresShipping: item.requiresShipping,
          freeShipping: item.freeShipping,
          flatShippingRate: item.flatShippingRate
        })),
        paymentMethod: formData.paymentMethod,
        shippingMethod: formData.shippingMethod,
        subtotal: calculateSubtotal(),
        shippingCost,
        tax: calculateTax(),
        total: calculateTotal(),
        notes: formData.notes
      };

      const response = await clientOrderService.createOrder(orderData);

      if (response.success) {
        toast.success('Order placed successfully!');
        clearCart();

        // Redirect to order confirmation page
        navigate(`/order-confirmation/${response.order._id}`);
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('An error occurred while processing your order');
    } finally {
      setLoading(false);
      setIsProcessingPayment(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
              <FiUser className="text-indigo-500" />
              Shipping Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Email *</label>
                <div className="relative">
                  <FiMail className="absolute text-gray-400 left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Phone *</label>
                <div className="relative">
                  <FiPhone className="absolute text-gray-400 left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">Address *</label>
              <div className="relative">
                <FiMapPin className="absolute text-gray-400 left-3 top-3" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 pl-10 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">State/Province *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">ZIP/Postal Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-white border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              >
                <option value="Kenya" className="bg-gray-800">Kenya</option>
                <option value="Uganda" className="bg-gray-800">Uganda</option>
                <option value="Tanzania" className="bg-gray-800">Tanzania</option>
                <option value="Rwanda" className="bg-gray-800">Rwanda</option>
                <option value="Burundi" className="bg-gray-800">Burundi</option>
                <option value="South Sudan" className="bg-gray-800">South Sudan</option>
                <option value="Ethiopia" className="bg-gray-800">Ethiopia</option>
                <option value="Somalia" className="bg-gray-800">Somalia</option>
                <option value="DRC" className="bg-gray-800">DR Congo</option>
                <option value="Other" className="bg-gray-800">Other</option>
              </select>
            </div>

            {/* SHIPPING METHOD SELECTION */}
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-300">Shipping Method</label>
              <div className="space-y-3">
                {[
                  { 
                    id: 'standard', 
                    label: 'Standard Shipping', 
                    desc: '5-7 business days', 
                    price: 0,
                    icon: <FiPackage />
                  },
                  { 
                    id: 'express', 
                    label: 'Express Shipping', 
                    desc: '2-3 business days', 
                    price: 500,
                    icon: <FiTruck />
                  },
                  { 
                    id: 'overnight', 
                    label: 'Overnight Shipping', 
                    desc: 'Next business day', 
                    price: 1500,
                    icon: <FiClock />
                  }
                ].map(method => {
                  // Check if any items have free shipping
                  const hasFreeShippingItems = cart.items.some(i => i.freeShipping);
                  const methodPrice = hasFreeShippingItems && method.id === 'standard' ? 0 : method.price;
                  
                  return (
                    <label key={method.id} className="flex items-center p-4 transition-all border border-gray-700 rounded-lg cursor-pointer bg-gray-800/95 backdrop-blur-sm hover:border-indigo-500/50 group">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={formData.shippingMethod === method.id}
                        onChange={handleInputChange}
                        className="mr-3 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex items-center flex-1 gap-3">
                        <span className="text-gray-400 group-hover:text-indigo-500">{method.icon}</span>
                        <div>
                          <div className="font-medium text-white">{method.label}</div>
                          <div className="text-sm text-gray-400">{method.desc}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-indigo-500">
                        {methodPrice === 0 ? 'Free' : formatKES(methodPrice)}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">Order Notes (Optional)</label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-white placeholder-gray-400 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                placeholder="Special instructions for delivery..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
              <FiCreditCard className="text-indigo-500" />
              Payment Information
            </h3>

            <div className="space-y-4">
              {[
                { id: 'mpesa', label: 'M-Pesa', icon: <FiCreditCard />, desc: 'Pay via M-Pesa (Safaricom)' },
                { id: 'delivery', label: 'Pay on Delivery', icon: <FiTruck />, desc: 'Cash or card on delivery' },
                { id: 'paypal', label: 'PayPal', icon: <FiGlobe />, desc: 'Secure PayPal payment' }
              ].map(method => (
                <label key={method.id} className="flex items-center p-4 transition-all border border-gray-700 rounded-lg cursor-pointer bg-gray-800/95 backdrop-blur-sm hover:border-indigo-500/50 group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleInputChange}
                    className="mr-3 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center flex-1 gap-3">
                    <span className="text-gray-400 group-hover:text-indigo-500">{method.icon}</span>
                    <div>
                      <div className="font-medium text-white">{method.label}</div>
                      <div className="text-sm text-gray-400">{method.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Secure</span>
                </label>
              ))}
            </div>

            {formData.paymentMethod === 'mpesa' && (
              <div className="p-4 space-y-4 border rounded-lg border-indigo-500/30 bg-indigo-600/10">
                <h4 className="font-medium text-indigo-400">M-Pesa Payment Instructions</h4>
                <ol className="ml-4 space-y-2 text-sm text-indigo-300 list-decimal">
                  <li>Go to M-Pesa menu on your phone</li>
                  <li>Select "Lipa Na M-Pesa"</li>
                  <li>Enter Business No: <strong className="text-white">123456</strong></li>
                  <li>Enter Account No: <strong className="text-white">{Math.random().toString(36).substring(7).toUpperCase()}</strong></li>
                  <li>Enter Amount: <strong className="text-white">{formatKES(calculateTotal())}</strong></li>
                  <li>Enter your M-Pesa PIN and confirm</li>
                  <li>You'll receive a confirmation SMS</li>
                </ol>
                <p className="mt-2 text-xs text-indigo-400">
                  Your order will be processed immediately after payment confirmation
                </p>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-400">
              <FiLock className="mr-2 text-indigo-500" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
              <FiCheck className="text-green-500" />
              Order Summary
            </h3>

            <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold text-white">Shipping Details</h4>
                  <p className="text-gray-300">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zipCode}<br />
                    {formData.country}<br />
                    📧 {formData.email}<br />
                    📱 {formData.phone}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-white">Shipping Method</h4>
                  <p className="text-gray-300">
                    {formData.shippingMethod === 'standard' ? 'Standard Shipping (5-7 days)' :
                     formData.shippingMethod === 'express' ? 'Express Shipping (2-3 days)' :
                     'Overnight Shipping (Next day)'}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-white">Payment Method</h4>
                  <p className="text-gray-300">
                    {formData.paymentMethod === 'mpesa' ? 'M-Pesa' :
                     formData.paymentMethod === 'delivery' ? 'Pay on Delivery' :
                     'PayPal'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <h4 className="mb-3 font-semibold text-white">Order Items</h4>
              <div className="space-y-3 overflow-y-auto max-h-60">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/95">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded">
                        {item.images?.[0]?.url ? (
                          <img 
                            src={item.images[0].url.startsWith('http') ? item.images[0].url : `http://localhost:5000${item.images[0].url}`} 
                            alt={item.name} 
                            className="object-cover w-full h-full rounded"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=50&h=50&fit=crop';
                            }}
                          />
                        ) : (
                          <FiPackage className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-sm text-gray-400">Qty: {item.quantity}</div>
                        {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                        
                        {/* Shipping info for this item */}
                        {item.requiresShipping !== false && (
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                            {item.weight > 0 && (
                              <span className="flex items-center">
                                <FiScale className="mr-1" /> {item.weight}{item.weightUnit}
                              </span>
                            )}
                            {item.dimensions && (item.dimensions.length || item.dimensions.width || item.dimensions.height) && (
                              <span className="flex items-center">
                                <FiRuler className="mr-1" /> {item.dimensions.length || 0}×{item.dimensions.width || 0}×{item.dimensions.height || 0}{item.dimensions.unit || 'cm'}
                              </span>
                            )}
                            {item.freeShipping && (
                              <span className="text-green-500">Free Shipping</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-semibold text-indigo-500">
                      {formatKES((item.discountPrice || item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (orderId && !order) {
    // Fetch existing order if orderId is provided
    useEffect(() => {
      const fetchOrder = async () => {
        try {
          const response = await clientOrderService.getOrder(orderId);
          if (response.success) {
            setOrder(response.order);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        }
      };

      fetchOrder();
    }, [orderId]);
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Full-page Background Image */}
      <div className="fixed inset-0">
        <img 
          src={checkoutBackgroundImage}
          alt="Background"
          className="object-cover w-full h-full"
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Bottom gradient - indigo/blue/cyan */}
        <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
        {/* Final black gradient at the very bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Animated Glow Orbs */}
      <div className="fixed rounded-full pointer-events-none w-96 h-96 bg-indigo-600/30 blur-3xl -top-48 -left-48 animate-pulse"></div>
      <div className="fixed delay-1000 rounded-full pointer-events-none w-96 h-96 bg-blue-600/30 blur-3xl -bottom-48 -right-48 animate-pulse"></div>

      {/* Top Bar */}
      <div className="sticky top-0 z-50">
        <TopBar />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-4 text-indigo-500 transition-colors hover:text-indigo-400"
          >
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
          <p className="mt-2 text-gray-400">Complete your purchase securely</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column - Checkout Form */}
          <div className="lg:w-2/3">
            {/* Progress Steps */}
            <div className="p-6 mb-6 border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                        ${activeStep >= step.id ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' : 'bg-gray-800 text-gray-400'}
                        ${activeStep === step.id ? 'ring-4 ring-indigo-500/50' : ''}`}>
                        {activeStep > step.id ? <FiCheck /> : step.icon}
                      </div>
                      <span className={`text-sm font-medium ${activeStep >= step.id ? 'text-indigo-500' : 'text-gray-500'}`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 ${activeStep > step.id ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'bg-gray-800'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 mb-6 border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {activeStep > 1 && (
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 text-white transition-colors border border-gray-700 rounded-lg hover:bg-gray-800"
                  disabled={loading}
                >
                  Previous
                </button>
              )}

              {activeStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 ml-auto text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90"
                >
                  Continue to {steps.find(s => s.id === activeStep + 1)?.title}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || isProcessingPayment}
                  className="flex items-center gap-2 px-8 py-3 ml-auto text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiLock />
                      Place Order
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="sticky p-6 border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm top-8">
              <h2 className="mb-6 text-xl font-bold text-white">Order Summary</h2>

              {/* Order Items Preview */}
              <div className="mb-6 space-y-3 overflow-y-auto max-h-80">
                {cart.items.map(item => {
                  const price = item.discountPrice || item.price || 0;
                  const itemTotal = price * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded">
                        {item.images?.[0]?.url ? (
                          <img 
                            src={item.images[0].url.startsWith('http') ? item.images[0].url : `http://localhost:5000${item.images[0].url}`} 
                            alt={item.name} 
                            className="object-cover w-full h-full rounded"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop';
                            }}
                          />
                        ) : (
                          <FiPackage className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white line-clamp-2">{item.name}</div>
                        <div className="text-sm text-gray-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-semibold text-indigo-500">
                        {formatKES(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SHIPPING DETAILS SUMMARY */}
              <div className="p-4 mt-4 border border-gray-700 rounded-lg bg-gray-800/95">
                <h4 className="flex items-center mb-3 font-medium text-white">
                  <FiTruck className="w-4 h-4 mr-2 text-indigo-500" />
                  Shipping Details
                </h4>
                
                {cart.items.map(item => (
                  item.requiresShipping !== false && (
                    <div key={item.id} className="pb-3 mb-3 text-sm border-b border-gray-700 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-300">{item.name}</span>
                        {item.freeShipping ? (
                          <span className="font-medium text-green-500">Free</span>
                        ) : item.flatShippingRate > 0 ? (
                          <span className="font-medium text-indigo-500">{formatKES(item.flatShippingRate)}</span>
                        ) : (
                          <span className="text-gray-500">Calculated</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        {item.weight > 0 && (
                          <span className="flex items-center">
                            <FiScale className="mr-1" /> {item.weight}{item.weightUnit}
                          </span>
                        )}
                        {item.dimensions && (item.dimensions.length || item.dimensions.width || item.dimensions.height) && (
                          <span className="flex items-center">
                            <FiRuler className="mr-1" /> {item.dimensions.length || 0}×{item.dimensions.width || 0}×{item.dimensions.height || 0}{item.dimensions.unit || 'cm'}
                          </span>
                        )}
                        {item.estimatedDeliveryMin && item.estimatedDeliveryMax && (
                          <span className="flex items-center">
                            <FiClock className="mr-1" /> {item.estimatedDeliveryMin}-{item.estimatedDeliveryMax} days
                          </span>
                        )}
                      </div>
                      {item.shippingZones && item.shippingZones.length > 0 && (
                        <div className="mt-1 text-xs text-amber-500" title={`Restricted to: ${item.shippingZones.map(formatZoneName).join(', ')}`}>
                          ⚠️ Restricted shipping zones apply
                        </div>
                      )}
                      {item.internationalShipping && (
                        <div className="mt-1 text-xs text-indigo-500">
                          <FiGlobe className="inline mr-1" />
                          International shipping available
                        </div>
                      )}
                    </div>
                  )
                ))}

                {/* Selected Shipping Method */}
                <div className="pt-3 mt-3 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-300">Shipping Method:</span>
                    <span className="text-indigo-500 capitalize">
                      {formData.shippingMethod === 'standard' ? 'Standard' :
                       formData.shippingMethod === 'express' ? 'Express' :
                       'Overnight'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Totals */}
              <div className="pt-4 space-y-3 border-t border-gray-700">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatKES(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-indigo-500">{shippingCost === 0 ? 'Free' : formatKES(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (8%)</span>
                  <span className="text-white">{formatKES(calculateTax())}</span>
                </div>
                <div className="flex justify-between pt-3 text-lg font-bold border-t border-gray-700">
                  <span className="text-white">Total</span>
                  <span className="text-indigo-500 glow-text">{formatKES(calculateTotal())}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-4 mt-6 border rounded-lg bg-indigo-600/10 border-indigo-600/20">
                <div className="flex items-center gap-3 text-sm text-indigo-400">
                  <FiShield className="text-indigo-500" />
                  <div>
                    <div className="font-medium">Secure Checkout</div>
                    <div className="text-xs text-indigo-400/80">Your information is encrypted and secure</div>
                  </div>
                </div>
              </div>

              {/* Return Policy */}
              <div className="mt-4 text-xs text-center text-gray-500">
                By placing your order, you agree to our{' '}
                <a href="/terms" className="text-indigo-500 hover:text-indigo-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-indigo-500 hover:text-indigo-400 hover:underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;