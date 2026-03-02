// src/pages/OrderDetails.jsx - COMPLETE with Yellow-Orange Theme, LoadingSpinner, and Algorithm Tracking
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  FiShoppingBag,
  FiHome,
  FiStar
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { clientOrderService } from '../services/client/orders';
import { clientProductService } from '../services/client/products';
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
  
  .order-details-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
  }
  
  .order-details-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .status-pending {
    background: rgba(245, 158, 11, 0.15);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  .status-processing {
    background: rgba(59, 130, 246, 0.15);
    color: #3B82F6;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }
  
  .status-shipped {
    background: rgba(139, 92, 246, 0.15);
    color: #8B5CF6;
    border: 1px solid rgba(139, 92, 246, 0.3);
  }
  
  .status-delivered {
    background: rgba(16, 185, 129, 0.15);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  .status-cancelled {
    background: rgba(239, 68, 68, 0.15);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
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
const orderDetailsHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Format currency
const formatKES = (amount) => {
  if (!amount && amount !== 0) return "KSh 0";
  return `KSh ${Math.round(amount).toLocaleString()}`;
};

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

// Get status info
const getStatusInfo = (status) => {
  const statusMap = {
    pending: { label: 'Pending', icon: FiClock, class: 'status-pending' },
    processing: { label: 'Processing', icon: FiPackage, class: 'status-processing' },
    shipped: { label: 'Shipped', icon: FiTruck, class: 'status-shipped' },
    delivered: { label: 'Delivered', icon: FiCheckCircle, class: 'status-delivered' },
    cancelled: { label: 'Cancelled', icon: FiPackage, class: 'status-cancelled' }
  };
  return statusMap[status?.toLowerCase()] || statusMap.pending;
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
    <div className="p-4 order-details-card rounded-xl">
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

// Top Bar Component
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-2 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          <FiMapPin className="w-3 h-3" />
          FIND STORE
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

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
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
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const startTime = performance.now();
        
        console.log('📤 Fetching order details:', id);
        
        const response = await clientOrderService.getOrder(id);
        
        const endTime = performance.now();
        const loadTimeMs = (endTime - startTime).toFixed(0);
        const isCached = response?.cached || false;
        
        setLoadTime(loadTimeMs);
        setFromCache(isCached);
        
        setCacheStats(prev => ({
          totalRequests: prev.totalRequests + 1,
          cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
        }));
        
        console.log(`⚡ Order details loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
        
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
    setLoadTime('printing');
    setTimeout(() => {
      window.print();
      setLoadTime(null);
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
              src={orderDetailsHeaderImage}
              alt="Order Details"
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
                  <h1 className="section-title">ORDER DETAILS</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading order details...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading order details..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const StatusIcon = getStatusInfo(order.status).icon;
  const statusClass = getStatusInfo(order.status).class;

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
            src={orderDetailsHeaderImage}
            alt="Order Details"
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
                <h1 className="section-title">ORDER DETAILS</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                Order #{order.orderNumber || order._id?.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </div>

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
          <div className="flex items-center gap-2">
            <span className={`status-badge ${statusClass}`}>
              <StatusIcon className="w-3 h-3" />
              {getStatusInfo(order.status).label}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
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
                      <p className="text-sm font-bold text-white">{formatKES(item.price * item.quantity)}</p>
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
                    <span className="text-yellow-500 glow-text">{formatKES(order.totalAmount)}</span>
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