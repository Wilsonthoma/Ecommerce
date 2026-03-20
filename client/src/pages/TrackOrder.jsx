// src/pages/TrackOrder.jsx - Using reusable components
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock,
  FiMapPin,
  FiCalendar,
  FiChevronRight,
  FiSearch,
  FiHome
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { clientOrderService } from '../services/client/orders';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import OrderTimeline from '../components/ui/OrderTimeline';
import Price, { formatKES } from '../components/ui/Price';

// Header image
const headerImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Track Order Form
const TrackOrderForm = ({ onTrack }) => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }
    onTrack(orderId.trim(), email.trim());
  };

  return (
    <div className="p-6 track-card rounded-xl" data-aos="fade-up">
      <h3 className="mb-4 text-sm font-semibold text-white">Track Your Order</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-[10px] text-gray-400">Order Number</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g., ORD-123456"
            className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-[10px] text-gray-400">Email (Optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for updates"
            className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"
        >
          Track Order
        </button>
      </form>
    </div>
  );
};

// Order Details Component
const OrderDetails = ({ order }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Order Header */}
      <div className="p-4 track-card rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">Order Number</p>
            <p className="text-lg font-bold text-white">#{order.orderNumber || order._id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Order Date</p>
            <p className="text-sm text-white">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <OrderTimeline status={order.status} />

      {/* Order Summary */}
      <div className="p-4 track-card rounded-xl">
        <h4 className="mb-3 text-xs font-semibold text-white">Order Summary</h4>
        <div className="space-y-2">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 overflow-hidden bg-gray-800 rounded-lg">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <FiPackage className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{item.name}</p>
                  <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                </div>
              </div>
              <Price price={item.price * item.quantity} size="xs" />
            </div>
          ))}
        </div>

        <div className="pt-3 mt-3 space-y-2 border-t border-gray-800">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Subtotal</span>
            <Price price={order.subtotal || order.totalAmount} size="xs" />
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Shipping</span>
            <span className="text-xs text-white">{order.shippingCost ? formatKES(order.shippingCost) : 'Free'}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span className="text-white">Total</span>
            <Price price={order.totalAmount} size="sm" className="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="p-4 track-card rounded-xl">
          <h4 className="mb-2 text-xs font-semibold text-white">Shipping Address</h4>
          <div className="flex items-start gap-2">
            <FiMapPin className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white">{order.shippingAddress.fullName || order.shippingAddress.name}</p>
              <p className="text-[10px] text-gray-400">{order.shippingAddress.address}</p>
              <p className="text-[10px] text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p className="text-[10px] text-gray-400 mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrackOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  // States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [searched, setSearched] = useState(false);

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

  // If orderId is in URL, automatically track it
  useEffect(() => {
    if (orderId) {
      handleTrackOrder(orderId);
    } else {
      setInitialLoad(false);
    }
  }, [orderId]);

  const handleTrackOrder = async (trackingId, email = '') => {
    try {
      setLoading(true);
      setSearched(true);
      
      const response = await clientOrderService.getOrder(trackingId);
      
      if (response && response.success) {
        setOrder(response.order);
        toast.success('Order found successfully');
      } else {
        toast.error('Order not found. Please check your order number.');
        setOrder(null);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error(error.response?.data?.message || 'Failed to track order');
      setOrder(null);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="TRACK ORDER" 
          subtitle="Loading tracking information..."
          image={headerImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading tracking information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="TRACK ORDER" 
        subtitle="Track your order in real-time"
        image={headerImage}
      />

      <div className="container max-w-2xl px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Track Order</span>
        </nav>

        {/* Track Order Form */}
        {!order && !loading && (
          <TrackOrderForm onTrack={handleTrackOrder} />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Tracking order..." size="sm" fullScreen={false} />
          </div>
        )}

        {/* Order Details */}
        {order && !loading && (
          <>
            <OrderDetails order={order} />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => {
                  setOrder(null);
                  setSearched(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-medium text-white transition-all border border-gray-700 rounded-lg hover:bg-white/5"
              >
                Track Another Order
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="flex-1 px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"
              >
                Need Help?
              </button>
            </div>
          </>
        )}

        {/* No Results */}
        {searched && !order && !loading && (
          <div className="p-8 text-center track-card rounded-xl">
            <FiSearch className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="mb-2 text-lg font-semibold text-white">Order Not Found</h3>
            <p className="mb-4 text-sm text-gray-400">We couldn't find an order with that number. Please check and try again.</p>
            <button
              onClick={() => {
                setSearched(false);
                setOrder(null);
              }}
              className="px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;