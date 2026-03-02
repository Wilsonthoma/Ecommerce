// src/pages/Orders.jsx - COMPLETE ORDERS PAGE with Yellow-Orange Theme, LoadingSpinner, and Algorithm Tracking (hidden from UI)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiTruck, 
  FiHome,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiEye,
  FiRefreshCw,
  FiDownload,
  FiStar,
  FiMessageCircle,
  FiShoppingBag,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiMapPin as FiMapIcon
} from 'react-icons/fi';
import { BsTruck, BsCheckCircleFill, BsClockFill } from 'react-icons/bs';
import { IoFlashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { clientOrderService } from '../services/client/orders';
import { clientProductService } from '../services/client/products';
import LoadingSpinner, { CardSkeleton, ContentLoader } from '../components/LoadingSpinner';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Font styles - UPDATED with yellow-orange theme
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
  
  .page-title {
    font-weight: 800;
    font-size: clamp(1.5rem, 4vw, 2rem);
    line-height: 1.2;
    letter-spacing: -0.03em;
    background: linear-gradient(to right, #fff, #e5e5e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .section-title-small {
    font-weight: 700;
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    letter-spacing: -0.02em;
    color: white;
  }
  
  .stat-card {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 0.75rem;
    padding: 0.75rem;
    transition: all 0.3s ease;
  }
  
  .order-card {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 0.75rem;
    transition: all 0.3s ease;
  }
  
  .order-card:hover {
    border-color: #F59E0B;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.3);
  }
  
  .status-badge {
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
  }
  
  .status-pending {
    background: linear-gradient(135deg, #F59E0B20, #F59E0B40);
    color: #F59E0B;
    border: 1px solid #F59E0B40;
  }
  
  .status-processing {
    background: linear-gradient(135deg, #3B82F620, #3B82F640);
    color: #3B82F6;
    border: 1px solid #3B82F640;
  }
  
  .status-shipped {
    background: linear-gradient(135deg, #8B5CF620, #8B5CF640);
    color: #8B5CF6;
    border: 1px solid #8B5CF640;
  }
  
  .status-delivered {
    background: linear-gradient(135deg, #10B98120, #10B98140);
    color: #10B981;
    border: 1px solid #10B98140;
  }
  
  .status-cancelled {
    background: linear-gradient(135deg, #EF444420, #EF444440);
    color: #EF4444;
    border: 1px solid #EF444440;
  }
  
  .status-refunded {
    background: linear-gradient(135deg, #6B728020, #6B728040);
    color: #9CA3AF;
    border: 1px solid #6B728040;
  }
  
  .glow-text {
    text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
  }
  
  .timeline-dot {
    width: 0.9rem;
    height: 0.9rem;
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
    margin: 0 0.4rem;
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

// Gradient for header - UPDATED to yellow-orange
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Header image
const ordersHeaderImage = "https://images.pexels.com/photos/4481256/pexels-photo-4481256.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Status icons mapping
const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return <FiClock className="w-3 h-3" />;
    case 'processing':
      return <FiRefreshCw className="w-3 h-3" />;
    case 'shipped':
      return <FiTruck className="w-3 h-3" />;
    case 'delivered':
      return <FiCheckCircle className="w-3 h-3" />;
    case 'cancelled':
      return <FiXCircle className="w-3 h-3" />;
    default:
      return <FiPackage className="w-3 h-3" />;
  }
};

// Status badge class
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'status-pending';
    case 'processing':
      return 'status-processing';
    case 'shipped':
      return 'status-shipped';
    case 'delivered':
      return 'status-delivered';
    case 'cancelled':
      return 'status-cancelled';
    case 'refunded':
      return 'status-refunded';
    default:
      return 'status-pending';
  }
};

// Format date - COMPACT
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format currency
const formatKES = (price) => {
  if (!price && price !== 0) return "KSh 0";
  return `KSh ${Math.round(price).toLocaleString()}`;
};

// Get full image URL
const getFullImageUrl = (imagePath) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';
  
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
  return `${API_URL}/uploads/products/${imagePath}`;
};

// Top Bar Component - UPDATED colors
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

// Order Timeline Component - COMPACT
const OrderTimeline = ({ status, estimatedDelivery }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: FiClock },
    { key: 'processing', label: 'Processing', icon: FiRefreshCw },
    { key: 'shipped', label: 'Shipped', icon: FiTruck },
    { key: 'delivered', label: 'Delivered', icon: FiCheckCircle }
  ];

  const currentStatus = status?.toLowerCase() || 'pending';
  let currentStepIndex = steps.findIndex(s => s.key === currentStatus);
  if (currentStepIndex === -1) currentStepIndex = 0;

  return (
    <div className="p-3 mt-3 border-t border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-white">Order Timeline</h4>
        {estimatedDelivery && (
          <span className="text-[10px] text-gray-400">
            Est: {formatDate(estimatedDelivery)}
          </span>
        )}
      </div>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`timeline-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  {isCompleted && <BsCheckCircleFill className="w-3 h-3 text-green-500" />}
                </div>
                <span className="mt-1 text-[8px] font-medium text-gray-400">{step.label}</span>
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

// Order Card Component - COMPACT
const OrderCard = ({ order, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);
  const statusClass = getStatusClass(order.status);
  const StatusIcon = getStatusIcon(order.status);

  return (
    <div 
      className="overflow-hidden transition-all duration-300 order-card"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      {/* Order Header - COMPACT */}
      <div className="p-3 border-b border-gray-800 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
              <FiPackage className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Order #{order.orderNumber || order._id?.slice(-8)}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`status-badge ${statusClass}`}>
                  <StatusIcon.type className="w-2.5 h-2.5" />
                  {order.status || 'Pending'}
                </span>
                <span className="text-[10px] text-gray-500">
                  <FiCalendar className="inline w-2.5 h-2.5 mr-0.5" />
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{formatKES(order.totalAmount)}</p>
              <p className="text-[10px] text-gray-400">{order.items?.length || 0} items</p>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/5"
            >
              {expanded ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items Preview - COMPACT */}
      {!expanded && order.items && order.items.length > 0 && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {order.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-8 h-8 overflow-hidden bg-gray-800 rounded-lg">
                  <img 
                    src={getFullImageUrl(item.image)} 
                    alt={item.name}
                    className="object-cover w-full h-full"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
                  />
                </div>
                <div className="text-[10px]">
                  <p className="font-medium text-white truncate max-w-[80px]">{item.name}</p>
                  <p className="text-gray-400">x{item.quantity}</p>
                </div>
              </div>
            ))}
            {order.items.length > 3 && (
              <span className="text-[10px] text-gray-500">+{order.items.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Details - COMPACT */}
      {expanded && (
        <div className="p-3 space-y-3 animate-fadeIn">
          {/* Order Items */}
          <div>
            <h4 className="mb-1.5 text-[10px] font-semibold text-gray-400">ITEMS</h4>
            <div className="space-y-1.5">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-800/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 overflow-hidden bg-gray-800 rounded-lg">
                      <img 
                        src={getFullImageUrl(item.image)} 
                        alt={item.name}
                        className="object-cover w-full h-full"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/32'}
                      />
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
          </div>

          {/* Order Summary - COMPACT */}
          <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-gray-800/30">
            <div>
              <p className="text-[10px] text-gray-400">Subtotal</p>
              <p className="text-xs font-medium text-white">{formatKES(order.subtotal || order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Shipping</p>
              <p className="text-xs font-medium text-white">{order.shippingCost ? formatKES(order.shippingCost) : 'Free'}</p>
            </div>
            {order.discount > 0 && (
              <div>
                <p className="text-[10px] text-gray-400">Discount</p>
                <p className="text-xs font-medium text-green-500">-{formatKES(order.discount)}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-gray-400">Total</p>
              <p className="text-sm font-bold text-yellow-500">{formatKES(order.totalAmount)}</p>
            </div>
          </div>

          {/* Shipping Address - COMPACT */}
          {order.shippingAddress && (
            <div>
              <h4 className="mb-1 text-[10px] font-semibold text-gray-400">SHIPPING ADDRESS</h4>
              <div className="p-2 rounded-lg bg-gray-800/30">
                <div className="flex items-start gap-1.5">
                  <FiMapIcon className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white">{order.shippingAddress.fullName || order.shippingAddress.name}</p>
                    <p className="text-[10px] text-gray-400">{order.shippingAddress.address}</p>
                    <p className="text-[10px] text-gray-400">
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method - COMPACT */}
          {order.paymentMethod && (
            <div>
              <h4 className="mb-1 text-[10px] font-semibold text-gray-400">PAYMENT METHOD</h4>
              <div className="p-2 rounded-lg bg-gray-800/30">
                <p className="text-xs text-white capitalize">{order.paymentMethod}</p>
                {order.paymentStatus && (
                  <p className={`text-[10px] mt-0.5 ${
                    order.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <OrderTimeline status={order.status} estimatedDelivery={order.estimatedDelivery} />

          {/* Action Buttons - COMPACT */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => onViewDetails(order._id)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <FiEye className="w-2.5 h-2.5" />
              View
            </button>
            
            {order.status?.toLowerCase() === 'delivered' && (
              <button
                onClick={() => {
                  toast.info('Rate your order');
                }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <FiStar className="w-2.5 h-2.5" />
                Rate
              </button>
            )}

            {order.status?.toLowerCase() === 'delivered' && (
              <button
                onClick={() => {
                  toast.success('Items added to cart!');
                }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <FiRefreshCw className="w-2.5 h-2.5" />
                Reorder
              </button>
            )}

            {['pending', 'processing'].includes(order.status?.toLowerCase()) && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this order?')) {
                    toast.info('Cancelling order...');
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                <FiXCircle className="w-2.5 h-2.5" />
                Cancel
              </button>
            )}

            <button
              onClick={() => {
                toast.info('Downloading invoice...');
              }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white transition-all rounded-full bg-gray-700 hover:bg-gray-600"
            >
              <FiDownload className="w-2.5 h-2.5" />
              Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Stats Card Component - COMPACT with yellow-orange theme
const StatsCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="p-3 stat-card" data-aos="fade-up" data-aos-duration="800">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
      </div>
      <div className={`p-2 rounded-full bg-gradient-to-r ${gradient}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
  </div>
);

const Orders = () => {
  const navigate = useNavigate();
  
  // State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Algorithm performance states (internal only - not shown to users)
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalSpent: 0
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
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view your orders');
      navigate('/login');
      return;
    }

    fetchOrders();

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Generic fetch function with performance tracking (console only)
  const fetchWithTracking = async (fetchFn, sectionName) => {
    const startTime = performance.now();
    
    try {
      const response = await fetchFn();
      const endTime = performance.now();
      const loadTimeMs = (endTime - startTime).toFixed(0);
      const isCached = response?.cached || false;
      
      setLoadTime(loadTimeMs);
      setFromCache(isCached);
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
      }));
      
      // Log to console only - hidden from UI
      console.log(`⚡ Orders ${sectionName} loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch ${sectionName}:`, error);
      return null;
    }
  };

  // Fetch orders with performance tracking
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('📤 Fetching user orders...');
      
      const startTime = performance.now();
      
      const response = await clientOrderService.getUserOrders({
        limit: 50,
        sort: '-createdAt'
      });
      
      const endTime = performance.now();
      const loadTimeMs = (endTime - startTime).toFixed(0);
      const isCached = response?.cached || false;
      
      setLoadTime(loadTimeMs);
      setFromCache(isCached);
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
      }));
      
      console.log(`⚡ Orders loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
      console.log('📥 Orders response:', response);
      
      if (response && response.success) {
        const ordersData = response.orders || response.data || [];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        calculateStats(ordersData);
      } else {
        toast.error(response?.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Calculate stats
  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalSpent: 0
    };

    ordersData.forEach(order => {
      const status = order.status?.toLowerCase();
      if (status === 'pending') stats.pending++;
      else if (status === 'processing') stats.processing++;
      else if (status === 'shipped') stats.shipped++;
      else if (status === 'delivered') stats.delivered++;
      else if (status === 'cancelled') stats.cancelled++;
      
      if (status === 'delivered') {
        stats.totalSpent += order.totalAmount || 0;
      }
    });

    setStats(stats);
  };

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
          break;
      }
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(query) ||
        order._id?.toLowerCase().includes(query) ||
        order.items?.some(item => item.name?.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'lowest':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, statusFilter, dateFilter, searchQuery, sortBy]);

  // Handle view details
  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchOrders();
    toast.info('Refreshing orders...');
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateFilter('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  // Calculate cache hit rate (internal only)
  const cacheHitRate = cacheStats.totalRequests > 0 
    ? ((cacheStats.cacheHits / cacheStats.totalRequests) * 100).toFixed(0)
    : 0;

  // Loading state with CardSkeleton
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        <TopBar />

        {/* Header Image - COMPACT with Dashboard-style heading */}
        <div 
          className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={ordersHeaderImage}
              alt="My Orders"
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
                  <h1 className="section-title">MY ORDERS</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading your orders...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Cards */}
        <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
          <div className="grid grid-cols-2 gap-2 mb-4 md:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <CardSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Inject styles */}
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      <TopBar />

      {/* Header Image - COMPACT with Dashboard-style heading */}
      <div 
        className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={ordersHeaderImage}
            alt="My Orders"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        {/* Header Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
            >
              {/* Updated heading with Dashboard style */}
              <div className="section-title-wrapper">
                <h1 className="section-title">MY ORDERS</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                Track and manage your orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - COMPACT */}
      <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumb - COMPACT */}
        <nav className="flex items-center gap-1 mb-4 text-[10px]">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-2.5 h-2.5 text-gray-600" />
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-yellow-500">Dashboard</button>
          <FiChevronRight className="w-2.5 h-2.5 text-gray-600" />
          <span className="font-medium text-white">My Orders</span>
        </nav>

        {/* Stats Cards - COMPACT */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatsCard 
              icon={FiPackage}
              label="Total"
              value={stats.total}
              gradient="from-yellow-600 to-orange-600"
            />
            <StatsCard 
              icon={FiClock}
              label="Pending"
              value={stats.pending}
              gradient="from-yellow-600 to-orange-600"
            />
            <StatsCard 
              icon={FiRefreshCw}
              label="Processing"
              value={stats.processing}
              gradient="from-yellow-600 to-orange-600"
            />
            <StatsCard 
              icon={FiTruck}
              label="Shipped"
              value={stats.shipped}
              gradient="from-yellow-600 to-orange-600"
            />
            <StatsCard 
              icon={FiCheckCircle}
              label="Delivered"
              value={stats.delivered}
              gradient="from-yellow-600 to-orange-600"
            />
            <StatsCard 
              icon={FiDollarSign}
              label="Spent"
              value={formatKES(stats.totalSpent)}
              gradient="from-yellow-600 to-orange-600"
            />
          </div>
        )}

        {/* Filters Bar - COMPACT */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-white">Your Orders</h2>
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-yellow-500 bg-yellow-500/10 rounded-full">
                {filteredOrders.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                className="p-1.5 text-gray-400 transition-colors rounded-lg hover:text-yellow-500 hover:bg-white/5"
                title="Refresh"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-2 py-1.5 text-[10px] text-gray-400 transition-colors rounded-lg hover:text-yellow-500 hover:bg-white/5"
              >
                <FiFilter className="w-3 h-3" />
                <span className="hidden sm:inline">Filters</span>
                {showFilters ? <FiChevronUp className="w-2.5 h-2.5" /> : <FiChevronDown className="w-2.5 h-2.5" />}
              </button>
            </div>
          </div>

          {/* Search Bar - COMPACT */}
          <div className="relative mb-2">
            <FiSearch className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2.5 top-1/2" />
            <input
              type="text"
              placeholder="Search by order ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1.5 pl-8 pr-3 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
            />
          </div>

          {/* Filters - COMPACT */}
          {showFilters && (
            <div className="p-3 mb-3 border border-gray-700 rounded-lg stat-card animate-fadeIn">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {/* Status Filter */}
                <div>
                  <label className="block mb-0.5 text-[10px] text-gray-400">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block mb-0.5 text-[10px] text-gray-400">Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">7 Days</option>
                    <option value="month">30 Days</option>
                    <option value="3months">3 Months</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block mb-0.5 text-[10px] text-gray-400">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest">Highest</option>
                    <option value="lowest">Lowest</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-3 py-1.5 text-[10px] font-medium text-gray-300 transition-colors border border-gray-700 rounded-lg hover:text-white hover:bg-white/5"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay for subsequent loads */}
        {loading && !initialLoad && (
          <div className="flex justify-center py-8">
            <LoadingSpinner message="Updating orders..." size="sm" fullScreen={false} />
          </div>
        )}

        {/* Orders List - COMPACT */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          /* Empty State - COMPACT */
          <div className="py-10 text-center">
            <div className="relative inline-block">
              <div className="absolute rounded-full -inset-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 blur-xl"></div>
              <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                <FiShoppingBag className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="mb-1 text-base font-semibold text-white">No orders found</h3>
            <p className="mb-4 text-xs text-gray-400">
              {orders.length === 0 
                ? "You haven't placed any orders yet." 
                : "No orders match your filters."}
            </p>
            {orders.length === 0 ? (
              <button
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <FiShoppingBag className="w-3 h-3" />
                Start Shopping
              </button>
            ) : (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <FiRefreshCw className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;