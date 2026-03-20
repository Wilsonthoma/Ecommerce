// src/pages/OrderConfirmation.jsx - Using reusable components
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
  FiMapPin,
  FiCreditCard,
  FiPrinter,
  FiDownload,
  FiMail,
  FiPhone,
  FiUser,
  FiShoppingBag,
  FiArrowLeft,
  FiShield
} from 'react-icons/fi';
import { TbTruckDelivery } from 'react-icons/tb';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import Price, { formatKES } from '../components/ui/Price';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmationActions from '../components/orders/ConfirmationActions';

// Background image
const orderConfirmationBackgroundImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [printing, setPrinting] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 50,
      easing: 'ease-out-cubic',
    });
  }, []);

  // Fetch order
  useEffect(() => {
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
        setInitialLoad(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, navigate]);

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
        <TopBar />
        <PageHeader 
          title="ORDER CONFIRMATION" 
          subtitle="Loading your order confirmation..."
          image={orderConfirmationBackgroundImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading your order confirmation..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="ORDER CONFIRMATION" 
          subtitle="Order not found"
          image={orderConfirmationBackgroundImage}
        />
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="mb-4 text-6xl text-red-500">❌</div>
            <h2 className="mb-2 text-2xl font-bold text-white">Order Not Found</h2>
            <p className="mb-6 text-gray-400">The order you're looking for doesn't exist.</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
            >
              <FiHome className="w-4 h-4" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="ORDER CONFIRMATION" 
        subtitle="Thank you for your purchase!"
        image={orderConfirmationBackgroundImage}
      />

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
              <h1 className="text-2xl font-bold text-white">Order Confirmation</h1>
              <p className="mt-2 text-gray-400">Thank you for your purchase!</p>
            </div>
            <div className="mt-4 md:mt-0">
              <StatusBadge status={order.status} size="md" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div 
          className="p-6 mb-8 text-center border border-yellow-500/30 bg-gradient-to-r from-yellow-600/10 via-orange-600/10 to-red-600/10 rounded-2xl"
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
            <ConfirmationActions
              orderId={order._id}
              onPrintReceipt={handlePrintReceipt}
              onDownloadInvoice={handleDownloadInvoice}
              onTrackOrder={handleTrackOrder}
              printing={printing}
              showContinueShopping={true}
              showViewOrders={true}
              showContactSupport={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 print:grid-cols-3">
          {/* Left Column - Order Details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Order Items */}
            <div className="p-6 border border-gray-800 rounded-2xl confirmation-card" data-aos="fade-right">
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
                      <Price price={item.price * item.quantity} size="lg" />
                      <div className="text-sm text-gray-400">{formatKES(item.price)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div className="p-6 border border-gray-800 rounded-2xl confirmation-card" data-aos="fade-right" data-aos-delay="100">
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
                    <FiCalendar className="text-yellow-500" />
                    Delivery Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg border-yellow-500/30 bg-yellow-600/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-300">Estimated Delivery</span>
                        <span className="font-bold text-yellow-500">
                          {order.shippingMethod === 'next_day' ? '1 business day' :
                           order.shippingMethod === 'express' ? '2-3 business days' : '5-7 business days'}
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
            <div className="p-6 border border-gray-800 rounded-2xl confirmation-card" data-aos="fade-left">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
                <FiPackage className="text-yellow-500" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Subtotal</span>
                  <Price price={order.subtotal || order.totalAmount} size="md" />
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-yellow-500">{order.shippingCost === 0 ? 'Free' : formatKES(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-gray-400">Tax</span>
                  <Price price={order.tax || 0} size="md" />
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
                    <Price price={order.totalAmount} size="xl" className="text-yellow-500 glow-text" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="p-6 border border-gray-800 rounded-2xl confirmation-card" data-aos="fade-left" data-aos-delay="100">
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
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;