// src/pages/Checkout.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AppContext } from '../context/AppContext';
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
  FiShield
} from 'react-icons/fi';

const Checkout = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AppContext);
  
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
    country: '',
    paymentMethod: 'credit_card',
    shippingMethod: 'standard'
  });
  
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const steps = [
    { id: 1, title: 'Shipping', icon: <FiTruck /> },
    { id: 2, title: 'Payment', icon: <FiCreditCard /> },
    { id: 3, title: 'Confirm', icon: <FiCheck /> }
  ];
  
  // Initialize form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || 'US'
      }));
    }
  }, [isAuthenticated, user]);
  
  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart?.items?.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0) || 0;
    
    const shippingCost = formData.shippingMethod === 'express' ? 15 : 
                        formData.shippingMethod === 'next_day' ? 25 : 5;
    
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;
    
    return { subtotal, shippingCost, tax, total };
  };
  
  const { subtotal, shippingCost, tax, total } = calculateTotals();
  
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
    // Add payment validation logic here
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
        items: cart.items,
        paymentMethod: formData.paymentMethod,
        shippingMethod: formData.shippingMethod,
        subtotal,
        shippingCost,
        tax,
        total,
        notes: ''
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
                <label className="block mb-1 text-sm font-medium">State *</label>
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
                <label className="block mb-1 text-sm font-medium">ZIP Code *</label>
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
              <label className="block mb-1 text-sm font-medium">Shipping Method</label>
              <div className="space-y-2">
                {[
                  { id: 'standard', label: 'Standard Shipping', desc: '5-7 business days', price: '$5.00' },
                  { id: 'express', label: 'Express Shipping', desc: '2-3 business days', price: '$15.00' },
                  { id: 'next_day', label: 'Next Day Delivery', desc: 'Next business day', price: '$25.00' }
                ].map(method => (
                  <label key={method.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={formData.shippingMethod === method.id}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-600">{method.desc}</div>
                    </div>
                    <div className="font-semibold">{method.price}</div>
                  </label>
                ))}
              </div>
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
                { id: 'credit_card', label: 'Credit Card', icon: <FiCreditCard /> },
                { id: 'paypal', label: 'PayPal', icon: <FiShield /> },
                { id: 'apple_pay', label: 'Apple Pay', icon: <FiPackage /> }
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
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <span className="font-medium">{method.label}</span>
                  </div>
                </label>
              ))}
            </div>
            
            {formData.paymentMethod === 'credit_card' && (
              <div className="p-4 space-y-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
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
                     'Next Day Delivery'}
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-2 font-semibold">Payment Method</h4>
                  <p className="text-gray-700">
                    {formData.paymentMethod === 'credit_card' ? 'Credit Card' :
                     formData.paymentMethod === 'paypal' ? 'PayPal' :
                     'Apple Pay'}
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
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full rounded" />
                        ) : (
                          <FiPackage className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
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
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full rounded" />
                      ) : (
                        <FiPackage className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium line-clamp-2">{item.name}</div>
                      <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Totals */}
              <div className="pt-4 space-y-3 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 text-lg font-bold border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="p-4 mt-6 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FiShield className="text-green-600" />
                  <div>
                    <div className="font-medium">Secure Checkout</div>
                    <div>Your information is protected</div>
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