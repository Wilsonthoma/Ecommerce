// src/pages/OrderConfirmation.jsx - UPDATED with Yellow-Orange Theme, LoadingSpinner, and Algorithm Tracking
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientOrderService } from '../services/client/orders';
import { toast } from 'react-toastify';
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiCreditCard,
  FiPrinter,
  FiDownload,
  FiMail,
  FiPhone,
  FiUser,
  FiShoppingBag,
  FiArrowLeft,
  FiClock,
  FiShield,
  FiMapPin as FiMapPinIcon
} from 'react-icons/fi';
import { TbTruckDelivery } from 'react-icons/tb';
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
  
  .confirmation-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
  }
  
  .confirmation-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
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
  
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  .animate-pulse {
    animation: pulse 3s ease-in-out infinite;
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
const orderConfirmationBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for bottom transition - Yellow-Orange
const bottomGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Top Bar Component
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

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [printing, setPrinting] = useState(false);
  
  // Algorithm performance states (internal only)
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 50,
      easing: 'ease-out-cubic',
      anchorPlacement: 'top-bottom',
    });
  }, []);

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const startTime = performance.now();
        
        const response = await clientOrderService.getOrder(orderId);
        
        const endTime = performance.now();
        const loadTimeMs = (endTime - startTime).toFixed(0);
        const isCached = response?.cached || false;
        
        setLoadTime(loadTimeMs);
        setFromCache(isCached);
        
        setCacheStats(prev => ({
          totalRequests: prev.totalRequests + 1,
          cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
        }));
        
        console.log(`⚡ Order confirmation loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
        
        if (response.success) {
          setOrder(response.order);
        } else {
          toast.error('Order not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (shippingInfo) => {
    if (!shippingInfo) return '';
    return `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state || ''} ${shippingInfo.zipCode || ''}, ${shippingInfo.country || 'Kenya'}`;
  };

  const getOrderStatus = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      processing: { color: 'bg-blue-500', label: 'Processing' },
      shipped: { color: 'bg-purple-500', label: 'Shipped' },
      delivered: { color: 'bg-green-500', label: 'Delivered' },
      cancelled: { color: 'bg-red-500', label: 'Cancelled' }
    };
    return statusConfig[status] || { color: 'bg-gray-500', label: 'Unknown' };
  };

  const getShippingTime = (shippingMethod) => {
    switch (shippingMethod) {
      case 'next_day': return '1 business day';
      case 'express': return '2-3 business days';
      case 'standard': return '5-7 business days';
      default: return '5-7 business days';
    }
  };

  const formatKES = (amount) => {
    if (!amount && amount !== 0) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
  };

  const handlePrintReceipt = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice download started');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const handleTrackOrder = () => {
    if (order?._id) {
      navigate(`/track-order/${order._id}`);
    } else {
      toast.info('Tracking information will be sent to your email');
    }
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        {/* Full-page Background Image */}
        <div className="fixed inset-0">
          <img 
            src={orderConfirmationBackgroundImage}
            alt="Background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        {/* Animated Glow Orbs - Yellow-Orange */}
        <div className="fixed rounded-full pointer-events-none w-96 h-96 bg-yellow-600/30 blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="fixed delay-1000 rounded-full pointer-events-none w-96 h-96 bg-orange-600/30 blur-3xl -bottom-48 -right-48 animate-pulse"></div>

        <TopBar />

        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <ContentLoader message="Loading your order confirmation..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        {/* Full-page Background Image */}
        <div className="fixed inset-0">
          <img 
            src={orderConfirmationBackgroundImage}
            alt="Background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        {/* Animated Glow Orbs - Yellow-Orange */}
        <div className="fixed rounded-full pointer-events-none w-96 h-96 bg-yellow-600/30 blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="fixed delay-1000 rounded-full pointer-events-none w-96 h-96 bg-orange-600/30 blur-3xl -bottom-48 -right-48 animate-pulse"></div>

        <TopBar />

        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="mb-4 text-6xl text-red-500">❌</div>
            <h2 className="mb-2 text-2xl font-bold text-white">Order Not Found</h2>
            <p className="mb-6 text-gray-400">The order you're looking for doesn't exist.</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <FiHome className="w-4 h-4" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatus(order.status);

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>

      {/* Full-page Background Image */}
      <div className="fixed inset-0">
        <img 
          src={orderConfirmationBackgroundImage}
          alt="Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className={`absolute inset-0 bg-gradient-to-t ${bottomGradient} mix-blend-overlay`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Animated Glow Orbs - Yellow-Orange */}
      <div className="fixed rounded-full pointer-events-none w-96 h-96 bg-yellow-600/30 blur-3xl -top-48 -left-48 animate-pulse"></div>
      <div className="fixed delay-1000 rounded-full pointer-events-none w-96 h-96 bg-orange-600/30 blur-3xl -bottom-48 -right-48 animate-pulse"></div>

      <TopBar />

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl px-4 py-8 mx-auto print:max-w-none">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-6 text-yellow-500 transition-colors hover:text-yellow-400"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="section-title-wrapper">
                <h1 className="section-title">ORDER CONFIRMATION</h1>
              </div>
              <p className="mt-2 text-gray-400">Thank you for your purchase!</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} bg-opacity-20 text-${statusInfo.color.replace('bg-', '')} border border-${statusInfo.color.replace('bg-', '')}30`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div 
          className="p-6 mb-8 text-center border border-yellow-500/30 bg-gradient-to-r from-yellow-600/10 via-orange-600/10 to-red-600/10 rounded-2xl print:border print:rounded-lg backdrop-blur-sm confirmation-card"
          data-aos="zoom-in"
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              <FiCheckCircle className="mb-4 text-6xl text-yellow-500" />
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-yellow-500/20 blur-xl -z-10"></div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Order Confirmed!</h2>
            <p className="max-w-lg mb-4 text-gray-300">
              Your order <span className="font-bold text-yellow-500">#{order.orderNumber || order._id}</span> has been received and is being processed.
              A confirmation email has been sent to <span className="font-semibold text-yellow-500">{order.shippingInfo?.email || order.shippingAddress?.email}</span>.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button
                onClick={handlePrintReceipt}
                disabled={printing}
                className="flex items-center gap-2 px-5 py-2 text-gray-300 transition-colors border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700"
              >
                <FiPrinter />
                {printing ? 'Printing...' : 'Print Receipt'}
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-5 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <FiDownload />
                Download Invoice
              </button>
              <button
                onClick={handleTrackOrder}
                className="flex items-center gap-2 px-5 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <TbTruckDelivery className="text-lg" />
                Track Order
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 print:grid-cols-3">
          {/* Left Column - Order Details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Order Items */}
            <div 
              className="p-6 border border-gray-800 rounded-2xl confirmation-card"
              data-aos="fade-right"
            >
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiShoppingBag className="text-yellow-500" />
                Order Items
              </h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={item._id || index} className="flex items-center pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                    <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 bg-gray-800 rounded-lg">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full rounded-lg" />
                      ) : (
                        <FiPackage className="text-2xl text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 ml-4">
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      <p className="mt-1 text-sm text-gray-400">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-500">{formatKES(item.price * item.quantity)}</div>
                      <div className="text-sm text-gray-400">{formatKES(item.price)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div 
              className="p-6 border border-gray-800 rounded-2xl confirmation-card"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiTruck className="text-yellow-500" />
                Shipping & Delivery
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="flex items-center gap-2 mb-3 font-semibold text-white">
                    <FiMapPin className="text-yellow-500" />
                    Shipping Address
                  </h4>
                  <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/95">
                    <p className="font-medium text-white">
                      {order.shippingInfo?.firstName || order.shippingAddress?.fullName} {order.shippingInfo?.lastName || ''}
                    </p>
                    <p className="text-gray-300">{formatAddress(order.shippingInfo || order.shippingAddress)}</p>
                    <div className="pt-3 mt-3 border-t border-gray-700">
                      <p className="flex items-center gap-2 text-sm text-gray-300">
                        <FiMail className="text-gray-500" />
                        {order.shippingInfo?.email || order.shippingAddress?.email}
                      </p>
                      <p className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                        <FiPhone className="text-gray-500" />
                        {order.shippingInfo?.phone || order.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 mb-3 font-semibold text-white">
                    <FiClock className="text-yellow-500" />
                    Delivery Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg border-yellow-500/30 bg-yellow-600/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-300">Estimated Delivery</span>
                        <span className="font-bold text-yellow-500">
                          {getShippingTime(order.shippingMethod)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        You will receive tracking information once your order ships.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg border-green-500/30 bg-green-600/10">
                      <div className="flex items-center gap-2 mb-1">
                        <FiShield className="text-green-500" />
                        <span className="font-medium text-white">Delivery Protection</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Your order is protected by our delivery guarantee.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div 
              className="p-6 border border-gray-800 rounded-2xl confirmation-card"
              data-aos="fade-left"
            >
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiDollarSign className="text-yellow-500" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(order.subtotal || order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-yellow-500">{order.shippingCost === 0 ? 'Free' : formatKES(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-white">{formatKES(order.tax || 0)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-500">-{formatKES(order.discount)}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-700">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-yellow-500 glow-text">{formatKES(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div 
              className="p-6 border border-gray-800 rounded-2xl confirmation-card"
              data-aos="fade-left"
              data-aos-delay="100"
            >
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiCalendar className="text-yellow-500" />
                Order Information
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Order Number</div>
                  <div className="font-mono text-lg font-bold text-white">{order.orderNumber || order._id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Order Date</div>
                  <div className="font-medium text-gray-300">{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Payment Method</div>
                  <div className="flex items-center gap-2 font-medium text-white">
                    <FiCreditCard className="text-yellow-500" />
                    {order.paymentMethod === 'credit_card' && 'Credit Card'}
                    {order.paymentMethod === 'paypal' && 'PayPal'}
                    {order.paymentMethod === 'mpesa' && 'M-Pesa'}
                    {order.paymentMethod === 'cash' && 'Cash on Delivery'}
                    {order.paymentMethod === 'delivery' && 'Pay on Delivery'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Payment Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="font-medium text-white capitalize">{order.paymentStatus || 'pending'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div 
              className="p-6 border border-yellow-500/30 rounded-2xl bg-gradient-to-r from-yellow-600/10 via-orange-600/10 to-red-600/10 backdrop-blur-sm confirmation-card print:hidden"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <h3 className="mb-4 text-lg font-bold text-white">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-gray-800 rounded-full">
                    <FiMail className="text-sm text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Confirmation Email</div>
                    <div className="text-sm text-gray-400">Check your inbox for order details</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-gray-800 rounded-full">
                    <FiTruck className="text-sm text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Shipping Updates</div>
                    <div className="text-sm text-gray-400">Track your order in real-time</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-gray-800 rounded-full">
                    <FiUser className="text-sm text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Need Help?</div>
                    <div className="text-sm text-gray-400">
                      Contact support at{' '}
                      <a href="mailto:support@kwetushop.com" className="text-yellow-500 hover:text-yellow-400 hover:underline">
                        support@kwetushop.com
                      </a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-4 mt-12 sm:flex-row print:hidden">
          <button
            onClick={handleContinueShopping}
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <FiShoppingBag />
            Continue Shopping
          </button>
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700"
          >
            <FiPackage />
            View All Orders
          </Link>
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700"
          >
            <FiUser />
            Contact Support
          </Link>
        </div>

        {/* Print-only footer */}
        <div className="hidden pt-8 mt-12 border-t border-gray-700 print:block">
          <div className="text-center text-gray-400">
            <p>Thank you for your business!</p>
            <p className="mt-2 text-sm">For any questions, contact support@kwetushop.com</p>
            <p className="mt-4 text-xs">Order ID: {order._id} | Printed: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          .print\\:max-w-none,
          .print\\:max-w-none * {
            visibility: visible;
          }
          .print\\:max-w-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .print\\:grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-lg {
            border-radius: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;