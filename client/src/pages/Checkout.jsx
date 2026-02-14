// client/src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { clientOrderService } from '../services/client/orders';
import { toast } from 'react-hot-toast';
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
  FiRuler
} from 'react-icons/fi';

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
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <FiUser className="text-blue-600" />
              Shipping Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium">Email *</label>
                <div className="flex items-center">
                  <FiMail className="absolute ml-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Phone *</label>
                <div className="flex items-center">
                  <FiPhone className="absolute ml-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Address *</label>
              <div className="flex items-center">
                <FiMapPin className="absolute ml-3 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-1 text-sm font-medium">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">State/Province *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">ZIP/Postal Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Burundi">Burundi</option>
                <option value="South Sudan">South Sudan</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Somalia">Somalia</option>
                <option value="DRC">DR Congo</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* ✅ SHIPPING METHOD SELECTION */}
            <div>
              <label className="block mb-3 text-sm font-medium">Shipping Method</label>
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
                    <label key={method.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={formData.shippingMethod === method.id}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div className="flex items-center flex-1 gap-3">
                        <span className="text-gray-600">{method.icon}</span>
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-gray-600">{method.desc}</div>
                        </div>
                      </div>
                      <div className="font-semibold">
                        {methodPrice === 0 ? 'Free' : formatKES(methodPrice)}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block mb-1 text-sm font-medium">Order Notes (Optional)</label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Special instructions for delivery..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <FiCreditCard className="text-blue-600" />
              Payment Information
            </h3>

            <div className="space-y-4">
              {[
                { id: 'mpesa', label: 'M-Pesa', icon: <FiCreditCard />, desc: 'Pay via M-Pesa (Safaricom)' },
                { id: 'delivery', label: 'Pay on Delivery', icon: <FiTruck />, desc: 'Cash or card on delivery' },
                { id: 'paypal', label: 'PayPal', icon: <FiGlobe />, desc: 'Secure PayPal payment' }
              ].map(method => (
                <label key={method.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1 gap-3">
                    <span className="text-gray-600">{method.icon}</span>
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-600">{method.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Secure</span>
                </label>
              ))}
            </div>

            {formData.paymentMethod === 'mpesa' && (
              <div className="p-4 space-y-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium text-blue-800">M-Pesa Payment Instructions</h4>
                <ol className="ml-4 space-y-2 text-sm text-blue-700 list-decimal">
                  <li>Go to M-Pesa menu on your phone</li>
                  <li>Select "Lipa Na M-Pesa"</li>
                  <li>Enter Business No: <strong>123456</strong></li>
                  <li>Enter Account No: <strong>{Math.random().toString(36).substring(7).toUpperCase()}</strong></li>
                  <li>Enter Amount: <strong>{formatKES(calculateTotal())}</strong></li>
                  <li>Enter your M-Pesa PIN and confirm</li>
                  <li>You'll receive a confirmation SMS</li>
                </ol>
                <p className="mt-2 text-xs text-blue-600">
                  Your order will be processed immediately after payment confirmation
                </p>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <FiLock className="mr-2" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <FiCheck className="text-green-600" />
              Order Summary
            </h3>

            <div className="p-6 rounded-lg bg-gray-50">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Shipping Details</h4>
                  <p className="text-gray-700">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zipCode}<br />
                    {formData.country}<br />
                    📧 {formData.email}<br />
                    📱 {formData.phone}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold">Shipping Method</h4>
                  <p className="text-gray-700">
                    {formData.shippingMethod === 'standard' ? 'Standard Shipping (5-7 days)' :
                     formData.shippingMethod === 'express' ? 'Express Shipping (2-3 days)' :
                     'Overnight Shipping (Next day)'}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold">Payment Method</h4>
                  <p className="text-gray-700">
                    {formData.paymentMethod === 'mpesa' ? 'M-Pesa' :
                     formData.paymentMethod === 'delivery' ? 'Pay on Delivery' :
                     'PayPal'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="mb-3 font-semibold">Order Items</h4>
              <div className="space-y-3 overflow-y-auto max-h-60">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded">
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
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                        {item.sku && <div className="text-xs text-gray-400">SKU: {item.sku}</div>}
                        
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
                              <span className="text-green-600">Free Shipping</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-semibold">
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
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-4 text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column - Checkout Form */}
          <div className="lg:w-2/3">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                        ${activeStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}
                        ${activeStep === step.id ? 'ring-4 ring-blue-100' : ''}`}>
                        {activeStep > step.id ? <FiCheck /> : step.icon}
                      </div>
                      <span className={`text-sm font-medium ${activeStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 ${activeStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 mb-6 bg-white shadow rounded-xl">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {activeStep > 1 && (
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Previous
                </button>
              )}

              {activeStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 ml-auto text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Continue to {steps.find(s => s.id === activeStep + 1)?.title}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || isProcessingPayment}
                  className="flex items-center gap-2 px-8 py-3 ml-auto text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
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
            <div className="sticky p-6 bg-white shadow rounded-xl top-8">
              <h2 className="mb-6 text-xl font-bold">Order Summary</h2>

              {/* Order Items Preview */}
              <div className="mb-6 space-y-3 overflow-y-auto max-h-80">
                {cart.items.map(item => {
                  const price = item.discountPrice || item.price || 0;
                  const itemTotal = price * item.quantity;
                  
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded">
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
                        <div className="text-sm font-medium line-clamp-2">{item.name}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-semibold">
                        {formatKES(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ✅ SHIPPING DETAILS SUMMARY */}
              <div className="p-4 mt-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="flex items-center mb-3 font-medium text-gray-700">
                  <FiTruck className="w-4 h-4 mr-2 text-blue-600" />
                  Shipping Details
                </h4>
                
                {cart.items.map(item => (
                  item.requiresShipping !== false && (
                    <div key={item.id} className="pb-3 mb-3 text-sm border-b border-gray-200 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        {item.freeShipping ? (
                          <span className="font-medium text-green-600">Free</span>
                        ) : item.flatShippingRate > 0 ? (
                          <span className="font-medium">{formatKES(item.flatShippingRate)}</span>
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
                        <div className="mt-1 text-xs text-amber-600" title={`Restricted to: ${item.shippingZones.map(formatZoneName).join(', ')}`}>
                          ⚠️ Restricted shipping zones apply
                        </div>
                      )}
                      {item.internationalShipping && (
                        <div className="mt-1 text-xs text-blue-600">
                          <FiGlobe className="inline mr-1" />
                          International shipping available
                        </div>
                      )}
                    </div>
                  )
                ))}

                {/* Selected Shipping Method */}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Shipping Method:</span>
                    <span className="capitalize">
                      {formData.shippingMethod === 'standard' ? 'Standard' :
                       formData.shippingMethod === 'express' ? 'Express' :
                       'Overnight'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Totals */}
              <div className="pt-4 space-y-3 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatKES(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : formatKES(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span>{formatKES(calculateTax())}</span>
                </div>
                <div className="flex justify-between pt-3 text-lg font-bold border-t">
                  <span>Total</span>
                  <span className="text-blue-600">{formatKES(calculateTotal())}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-4 mt-6 rounded-lg bg-blue-50">
                <div className="flex items-center gap-3 text-sm text-blue-700">
                  <FiShield className="text-blue-600" />
                  <div>
                    <div className="font-medium">Secure Checkout</div>
                    <div className="text-xs">Your information is encrypted and secure</div>
                  </div>
                </div>
              </div>

              {/* Return Policy */}
              <div className="mt-4 text-xs text-center text-gray-500">
                By placing your order, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;