// src/pages/OrderConfirmation.jsx - UPDATED with full-page background and indigo/blue/cyan theme
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientOrderService } from '../services/client/orders';
import { toast } from 'react-hot-toast';
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

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await clientOrderService.getOrder(orderId);
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
    }
  };

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
    return `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`;
  };

  const getOrderStatus = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
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
    // In a real app, you would generate and download a PDF
    // const pdfUrl = await generateInvoicePDF(order);
    // window.open(pdfUrl, '_blank');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const handleTrackOrder = () => {
    // Navigate to tracking page or open tracking modal
    toast.success('Tracking information will be sent to your email');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-t-4 border-gray-700 rounded-full border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-4 text-6xl text-red-500">❌</div>
            <h2 className="mb-2 text-2xl font-bold text-white">Order Not Found</h2>
            <p className="mb-6 text-gray-400">The order you're looking for doesn't exist.</p>
            <Link to="/" className="inline-flex items-center text-indigo-500 hover:text-indigo-400">
              <FiHome className="mr-2" />
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
      {/* Full-page Background Image */}
      <div className="fixed inset-0">
        <img 
          src={orderConfirmationBackgroundImage}
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
      <main className="relative z-10 max-w-4xl px-4 py-8 mx-auto print:max-w-none">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-6 text-indigo-500 transition-colors hover:text-indigo-400"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Order Confirmation</h1>
              <p className="mt-2 text-gray-400">Thank you for your purchase!</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="p-6 mb-8 text-center border border-indigo-500/30 bg-gradient-to-r from-indigo-600/10 via-blue-600/10 to-cyan-600/10 rounded-2xl print:border print:rounded-lg backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <FiCheckCircle className="mb-4 text-6xl text-indigo-500" />
            <h2 className="mb-2 text-2xl font-bold text-white">Order Confirmed!</h2>
            <p className="max-w-lg mb-4 text-gray-300">
              Your order <span className="font-bold text-indigo-500">#{order.orderNumber || order._id}</span> has been received and is being processed.
              A confirmation email has been sent to <span className="font-semibold text-indigo-500">{order.shippingInfo?.email}</span>.
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
                className="flex items-center gap-2 px-5 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90"
              >
                <FiDownload />
                Download Invoice
              </button>
              <button
                onClick={handleTrackOrder}
                className="flex items-center gap-2 px-5 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
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
            <div className="p-6 border border-gray-800 rounded-2xl bg-gray-900/95 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiShoppingBag className="text-indigo-500" />
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
                      {item.variant && (
                        <p className="text-sm text-gray-400">Variant: {item.variant}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-500">{formatKES(item.price * item.quantity)}</div>
                      <div className="text-sm text-gray-400">{formatKES(item.price)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div className="p-6 border border-gray-800 rounded-2xl bg-gray-900/95 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiTruck className="text-indigo-500" />
                Shipping & Delivery
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="flex items-center gap-2 mb-3 font-semibold text-white">
                    <FiMapPin className="text-indigo-500" />
                    Shipping Address
                  </h4>
                  <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/95">
                    <p className="font-medium text-white">{order.shippingInfo?.firstName} {order.shippingInfo?.lastName}</p>
                    <p className="text-gray-300">{order.shippingInfo?.address}</p>
                    <p className="text-gray-300">
                      {order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}
                    </p>
                    <p className="text-gray-300">{order.shippingInfo?.country}</p>
                    <div className="pt-3 mt-3 border-t border-gray-700">
                      <p className="flex items-center gap-2 text-sm text-gray-300">
                        <FiMail className="text-gray-500" />
                        {order.shippingInfo?.email}
                      </p>
                      <p className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                        <FiPhone className="text-gray-500" />
                        {order.shippingInfo?.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 mb-3 font-semibold text-white">
                    <FiClock className="text-indigo-500" />
                    Delivery Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg border-indigo-500/30 bg-indigo-600/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-300">Estimated Delivery</span>
                        <span className="font-bold text-indigo-500">
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
            <div className="p-6 border border-gray-800 rounded-2xl bg-gray-900/95 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiDollarSign className="text-indigo-500" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-indigo-500">{order.shippingCost === 0 ? 'Free' : formatKES(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-white">{formatKES(order.tax)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-700">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-indigo-500 glow-text">{formatKES(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="p-6 border border-gray-800 rounded-2xl bg-gray-900/95 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiCalendar className="text-indigo-500" />
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
                    <FiCreditCard className="text-indigo-500" />
                    {order.paymentMethod === 'credit_card' && 'Credit Card'}
                    {order.paymentMethod === 'paypal' && 'PayPal'}
                    {order.paymentMethod === 'mpesa' && 'M-Pesa'}
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
            <div className="p-6 border border-indigo-500/30 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-blue-600/10 to-cyan-600/10 backdrop-blur-sm print:hidden">
              <h3 className="mb-4 text-lg font-bold text-white">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-gray-800 rounded-full">
                    <FiMail className="text-sm text-indigo-500" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Confirmation Email</div>
                    <div className="text-sm text-gray-400">Check your inbox for order details</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-gray-800 rounded-full">
                    <FiTruck className="text-sm text-indigo-500" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Shipping Updates</div>
                    <div className="text-sm text-gray-400">Track your order in real-time</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-gray-800 rounded-full">
                    <FiUser className="text-sm text-indigo-500" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Need Help?</div>
                    <div className="text-sm text-gray-400">
                      Contact support at{' '}
                      <a href="mailto:support@example.com" className="text-indigo-500 hover:text-indigo-400 hover:underline">
                        support@example.com
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
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90"
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
          <a
            href="/contact"
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700"
          >
            <FiUser />
            Contact Support
          </a>
        </div>

        {/* Print-only footer */}
        <div className="hidden pt-8 mt-12 border-t border-gray-700 print:block">
          <div className="text-center text-gray-400">
            <p>Thank you for your business!</p>
            <p className="mt-2 text-sm">For any questions, contact support@example.com</p>
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
            max-width: none !important;
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