// src/pages/Orders.jsx - COMPLETE ORDERS PAGE with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiTruck, 
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiRefreshCw,
  FiDownload,
  FiStar,
  FiShoppingBag,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { BsCheckCircleFill } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { clientOrderService } from '../services/client/orders';
import LoadingSpinner, { CardSkeleton, ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import OrderCard from '../components/orders/OrderCard';
import OrderStats from '../components/orders/OrderStats';
import OrderFilters from '../components/orders/OrderFilters';
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

// Header image
const ordersHeaderImage = "https://images.pexels.com/photos/4481256/pexels-photo-4481256.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Format currency
const formatKES = (price) => {
  if (!price && price !== 0) return "KSh 0";
  return `KSh ${Math.round(price).toLocaleString()}`;
};

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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const response = await clientOrderService.getUserOrders({
        limit: 50,
        sort: '-createdAt'
      });
      
      if (response && response.success) {
        const ordersData = response.orders || response.data || [];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        calculateStats(ordersData);
      } else {
        toast.error(response?.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      
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
    const newStats = {
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
      if (status === 'pending') newStats.pending++;
      else if (status === 'processing') newStats.processing++;
      else if (status === 'shipped') newStats.shipped++;
      else if (status === 'delivered') newStats.delivered++;
      else if (status === 'cancelled') newStats.cancelled++;
      
      if (status === 'delivered') {
        newStats.totalSpent += order.totalAmount || 0;
      }
    });

    setStats(newStats);
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

  // Handle reorder
  const handleReorder = (order) => {
    toast.success('Items added to cart!');
    navigate('/cart');
  };

  // Handle cancel order
  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      toast.info('Cancelling order...');
    }
  };

  // Handle download invoice
  const handleDownloadInvoice = (orderId) => {
    toast.info('Downloading invoice...');
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        <TopBar />
        <PageHeader 
          title="MY ORDERS" 
          subtitle="Loading your orders..."
          image={ordersHeaderImage}
        />
        
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
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      <TopBar />
      <PageHeader 
        title="MY ORDERS" 
        subtitle="Track and manage your orders"
        image={ordersHeaderImage}
      />

      {/* Main Content */}
      <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-4 text-[10px]">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-2.5 h-2.5 text-gray-600" />
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-yellow-500">Dashboard</button>
          <FiChevronRight className="w-2.5 h-2.5 text-gray-600" />
          <span className="font-medium text-white">My Orders</span>
        </nav>

        {/* Stats Cards */}
        {orders.length > 0 && <OrderStats stats={stats} />}

        {/* Filters Bar */}
        <OrderFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onRefresh={handleRefresh}
          onClearFilters={handleClearFilters}
        />

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onViewDetails={handleViewDetails}
                onReorder={handleReorder}
                onCancel={handleCancelOrder}
                onDownloadInvoice={handleDownloadInvoice}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
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