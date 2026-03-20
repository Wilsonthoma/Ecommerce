// src/pages/OrderDetails.jsx - Using reusable components
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiChevronRight,
  FiArrowLeft,
  FiDownload,
  FiPrinter,
  FiShoppingBag
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { clientOrderService } from '../services/client/orders';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import Price, { formatKES } from '../components/ui/Price';
import OrderTimeline from '../components/ui/OrderTimeline';
import StatusBadge from '../components/ui/StatusBadge';

// Header image
const orderDetailsHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

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

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await clientOrderService.getOrder(id);
        
        if (response.success) {
          setOrder(response.order);
        } else {
          toast.error('Order not found');
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  const handleDownloadInvoice = () => {
    toast.success('Invoice download started');
  };

  const handlePrintReceipt = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleReorder = () => {
    toast.success('Items added to cart!');
    navigate('/cart');
  };

  const handleTrackOrder = () => {
    toast.info('Tracking information will be sent to your email');
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="ORDER DETAILS" 
          subtitle="Loading order details..."
          image={orderDetailsHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading order details..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="ORDER DETAILS" 
        subtitle={`Order #${order.orderNumber || order._id?.slice(-8)}`}
        image={orderDetailsHeaderImage}
      />

      {/* Main Content */}
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-yellow-500">Dashboard</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/orders')} className="text-gray-400 hover:text-yellow-500">Orders</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white truncate">Order #{order.orderNumber || order._id?.slice(-8)}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 mb-6 text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          <FiArrowLeft className="w-3 h-3" />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
              <FiShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Order #{order.orderNumber || order._id?.slice(-8)}</h2>
              <p className="text-xs text-gray-400">Placed on {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <StatusBadge status={order.status} size="md" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
          >
            <FiDownload className="w-3 h-3" />
            Invoice
          </button>
          <button
            onClick={handlePrintReceipt}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all border border-gray-700 rounded-full hover:bg-white/5"
          >
            <FiPrinter className="w-3 h-3" />
            Print
          </button>
          <button
            onClick={handleReorder}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all border border-gray-700 rounded-full hover:bg-white/5"
          >
            <FiShoppingBag className="w-3 h-3" />
            Reorder
          </button>
          <button
            onClick={handleTrackOrder}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all border border-gray-700 rounded-full hover:bg-white/5"
          >
            <FiTruck className="w-3 h-3" />
            Track
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Order Items */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Items */}
            <div className="p-6 order-details-card rounded-xl" data-aos="fade-right">
              <h3 className="mb-4 text-sm font-semibold text-white">Order Items</h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={item._id || index} className="flex items-center gap-4 pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-800 rounded-lg">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <FiPackage className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{item.name}</h4>
                      <p className="mt-1 text-xs text-gray-400">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <Price price={item.price * item.quantity} size="md" />
                      <p className="text-[10px] text-gray-400">{formatKES(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <OrderTimeline status={order.status} />
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="p-6 order-details-card rounded-xl" data-aos="fade-left">
              <h3 className="mb-4 text-sm font-semibold text-white">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(order.subtotal || order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">
                    {order.shippingCost ? formatKES(order.shippingCost) : 'Free'}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-500">-{formatKES(order.discount)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tax</span>
                    <span className="text-white">{formatKES(order.tax)}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-800">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <Price price={order.totalAmount} size="lg" className="text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shippingAddress && (
              <div className="p-6 order-details-card rounded-xl" data-aos="fade-left" data-aos-delay="100">
                <h3 className="mb-4 text-sm font-semibold text-white">Shipping Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FiUser className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white">{order.shippingAddress.fullName || order.shippingAddress.name}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400">{order.shippingAddress.address}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiPhone className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400">{order.shippingAddress.phone}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiMail className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400">{order.shippingAddress.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            {order.paymentMethod && (
              <div className="p-6 order-details-card rounded-xl" data-aos="fade-left" data-aos-delay="200">
                <h3 className="mb-4 text-sm font-semibold text-white">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-white capitalize">{order.paymentMethod}</p>
                  </div>
                  {order.paymentStatus && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <p className="text-sm text-white capitalize">{order.paymentStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;