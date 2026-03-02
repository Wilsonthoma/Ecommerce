// src/pages/TrackOrder.jsx - COMPLETE with Yellow-Orange Theme, API Integration, LoadingSpinner, and Algorithm Tracking
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
  FiHome,
  FiMapPin as FiMapIcon,
  FiUser,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { clientOrderService } from '../services/client/orders';
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
  
  .track-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
  }
  
  .track-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  .timeline-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: rgba(75, 85, 99, 0.5);
    border: 2px solid rgba(75, 85, 99, 0.8);
    transition: all 0.3s ease;
  }
  
  .timeline-dot.completed {
    background: #10B981;
    border-color: #10B981;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
  }
  
  .timeline-dot.active {
    background: #F59E0B;
    border-color: #F59E0B;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  
  .timeline-line {
    flex: 1;
    height: 2px;
    background: rgba(75, 85, 99, 0.5);
    margin: 0 0.5rem;
  }
  
  .timeline-line.completed {
    background: linear-gradient(90deg, #10B981, #F59E0B);
  }
  
  /* COMPACT TEXT SIZES */
  .text-xs {
    font-size: 0.65rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .text-base {
    font-size: 0.9rem;
  }
  
  .text-lg {
    font-size: 1rem;
  }
  
  .text-xl {
    font-size: 1.1rem;
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
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;

// Gradient for header
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Header image
const headerImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Top Bar Component
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-1.5 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          <FiMapPin className="w-3 h-3" />
          <span>FIND STORE</span>
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

// Order Timeline Component
const OrderTimeline = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: FiClock },
    { key: 'processing', label: 'Processing', icon: FiPackage },
    { key: 'shipped', label: 'Shipped', icon: FiTruck },
    { key: 'delivered', label: 'Delivered', icon: FiCheckCircle }
  ];

  const currentStatus = status?.toLowerCase() || 'pending';
  let currentStepIndex = steps.findIndex(s => s.key === currentStatus);
  if (currentStepIndex === -1) currentStepIndex = 0;

  return (
    <div className="p-4 track-card rounded-xl">
      <h3 className="mb-4 text-sm font-semibold text-white">Order Timeline</h3>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-1">
                <div className={`timeline-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`} />
                <span className="mt-2 text-[10px] font-medium text-gray-400">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`timeline-line ${index < currentStepIndex ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

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
            className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
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
            className="w-full px-3 py-2 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
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

  const formatKES = (amount) => {
    if (!amount && amount !== 0) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
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
              <p className="text-xs font-semibold text-white">{formatKES(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-3 space-y-2 border-t border-gray-800">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Subtotal</span>
            <span className="text-xs text-white">{formatKES(order.subtotal || order.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Shipping</span>
            <span className="text-xs text-white">{order.shippingCost ? formatKES(order.shippingCost) : 'Free'}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span className="text-white">Total</span>
            <span className="text-yellow-500">{formatKES(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="p-4 track-card rounded-xl">
          <h4 className="mb-2 text-xs font-semibold text-white">Shipping Address</h4>
          <div className="flex items-start gap-2">
            <FiMapIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white">{order.shippingAddress.fullName || order.shippingAddress.name}</p>
              <p className="text-[10px] text-gray-400">{order.shippingAddress.address}</p>
              <p className="text-[10px] text-gray-400">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
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
  
  // Algorithm performance states (internal only)
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

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

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    // If orderId is in URL, automatically track it
    if (orderId) {
      handleTrackOrder(orderId);
    } else {
      setInitialLoad(false);
    }
    
    return () => {
      document.head.removeChild(style);
    };
  }, [orderId]);

  // Handle track order with API call
  const handleTrackOrder = async (trackingId, email = '') => {
    try {
      setLoading(true);
      setSearched(true);
      
      const startTime = performance.now();
      console.log(`📤 Tracking order: ${trackingId}`);
      
      // API call to get order details
      const response = await clientOrderService.getOrder(trackingId);
      
      const endTime = performance.now();
      const loadTimeMs = (endTime - startTime).toFixed(0);
      const isCached = response?.cached || false;
      
      setLoadTime(loadTimeMs);
      setFromCache(isCached);
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
      }));
      
      console.log(`⚡ Order tracked in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
      
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
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        <TopBar />

        {/* Header Image */}
        <div 
          className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={headerImage}
              alt="Track Order"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="w-full px-4 mx-auto max-w-7xl">
              <div 
                className="max-w-2xl"
                data-aos="fade-right"
                data-aos-duration="1200"
              >
                <div className="section-title-wrapper">
                  <h1 className="section-title">TRACK ORDER</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading tracking information...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading tracking information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>

      <TopBar />

      {/* Header Image */}
      <div 
        className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={headerImage}
            alt="Track Order"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
            >
              <div className="section-title-wrapper">
                <h1 className="section-title">TRACK ORDER</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                Track your order in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
                className="flex-1 px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
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
            <p className="mb-4 text-sm text-gray-400">
              We couldn't find an order with that number. Please check and try again.
            </p>
            <button
              onClick={() => {
                setSearched(false);
                setOrder(null);
              }}
              className="px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
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