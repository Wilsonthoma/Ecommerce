// src/pages/Dashboard.jsx - COMPLETELY REDESIGNED MODERN DASHBOARD with hidden algorithm tracking
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import clientApi from '../services/client/api';
import { clientProductService } from '../services/client/products';
import LoadingSpinner, { ContentLoader } from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiLock,
  FiLogOut,
  FiShoppingBag,
  FiHeart,
  FiClock,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
  FiHome,
  FiSettings,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiMapPin,
  FiStar,
  FiTrendingUp,
  FiAward,
  FiClock as FiClockIcon,
  FiShoppingCart,
  FiEye,
  FiGift,
  FiCpu
} from 'react-icons/fi';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Dashboard header image (same as Shop page)
const dashboardHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for header - Yellow-Orange (matching Shop page)
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Yellow-Orange gradient theme (matching Home.jsx)
const theme = {
  primary: "from-yellow-600 via-orange-600 to-red-600",
  primaryLight: "from-yellow-500 via-orange-500 to-red-500",
  primarySoft: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  secondary: "from-indigo-600 to-blue-600",
  accent: "from-pink-600 to-red-600",
  success: "from-green-600 to-emerald-600",
  warning: "from-yellow-600 to-orange-600",
  text: "from-yellow-400 via-orange-400 to-red-400"
};

// Font styles matching Home.jsx EXACTLY
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  /* Section title styling from Home.jsx */
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
  
  /* Stat number styling from Home.jsx */
  .stat-number {
    font-weight: 700;
    font-size: 2.5rem;
    line-height: 1;
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .stat-label {
    font-weight: 500;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9CA3AF;
  }
  
  /* Badge styles from Home.jsx */
  .badge-flash {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
  }
  
  .badge-trending {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
  }
  
  /* Text gradient from Home.jsx */
  .text-gradient-yellow-orange {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Button from Home.jsx */
  .btn-yellow-orange {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    transition: all 0.3s ease;
  }
  
  .btn-yellow-orange:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.5);
  }
  
  /* Card styling */
  .dashboard-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
  }
  
  .dashboard-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
`;

// Animation styles from Home.jsx
const animationStyles = `
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  [data-aos="wave-up"] {
    opacity: 0;
    transform: translateY(30px);
    transition-property: transform, opacity;
  }
  
  [data-aos="wave-up"].aos-animate {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
  if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
  return `${API_URL}/uploads/${imagePath}`;
};

const Dashboard = () => {
  const { userData, logout, isLoggedIn, getUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const [sendingOtp, setSendingOtp] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Data states
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    pendingOrders: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  
  // Algorithm performance tracking (hidden from UI, only in console)
  const [loadTimes, setLoadTimes] = useState({});
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

  // Initialize AOS with wave effect from Home.jsx
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 50,
      easing: 'ease-out-cubic',
      anchorPlacement: 'top-bottom',
    });
    
    setTimeout(() => {
      AOS.refresh();
    }, 1000);
  }, []);

  // Generic fetch function with performance tracking (console only)
  const fetchWithTracking = async (fetchFn, sectionName) => {
    const startTime = performance.now();
    
    try {
      const response = await fetchFn();
      const endTime = performance.now();
      const loadTimeMs = (endTime - startTime).toFixed(0);
      const isCached = response?.cached || false;
      
      setLoadTimes(prev => ({
        ...prev,
        [sectionName]: {
          time: loadTimeMs,
          cached: isCached
        }
      }));
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
      }));
      
      // Log to console only - hidden from UI
      console.log(`⚡ Dashboard ${sectionName} loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch ${sectionName}:`, error);
      return null;
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await fetchWithTracking(
          () => getUserData(),
          'userData'
        );
        
        // Try to fetch stats
        try {
          const statsResponse = await fetchWithTracking(
            () => clientApi.get('/user/stats'),
            'stats'
          );
          if (statsResponse?.data?.success) setStats(statsResponse.data.stats);
        } catch (error) {
          console.log('Stats endpoint not implemented yet, using defaults');
        }

        // Try to fetch orders
        try {
          const ordersResponse = await fetchWithTracking(
            () => clientApi.get('/user/orders?limit=5'),
            'orders'
          );
          if (ordersResponse?.data?.success) setRecentOrders(ordersResponse.data.orders || []);
        } catch (error) {
          console.log('Orders endpoint not implemented yet');
        }

        // Wishlist from localStorage
        try {
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          setWishlistCount(wishlist.length);
        } catch (error) {
          console.error('Error fetching wishlist count:', error);
        }

        // Try to fetch reviews count
        try {
          const reviewsResponse = await fetchWithTracking(
            () => clientApi.get('/user/reviews/count'),
            'reviews'
          );
          if (reviewsResponse?.data?.success) setReviewsCount(reviewsResponse.data.count || 0);
        } catch (error) {
          console.log('Reviews endpoint not implemented yet');
        }

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, navigate, getUserData]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSendVerificationOtp = async () => {
    if (!userData?.email) {
      toast.error('Email not found');
      return;
    }

    if (userData?.isAccountVerified) {
      toast.info('Your email is already verified!');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await clientApi.post('/auth/send-verify-otp', {});
      
      if (response.data.success) {
        toast.success('Verification OTP sent to your email!');
        navigate('/email-verify');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return formatDate(dateString);
    } catch {
      return 'Recently';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'delivered': 'bg-gradient-to-r from-green-600 to-emerald-600',
      'completed': 'bg-gradient-to-r from-green-600 to-emerald-600',
      'processing': 'bg-gradient-to-r from-yellow-600 to-orange-600',
      'pending': 'bg-gradient-to-r from-yellow-600 to-orange-600',
      'shipped': 'bg-gradient-to-r from-blue-600 to-cyan-600',
      'cancelled': 'bg-gradient-to-r from-red-600 to-pink-600'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${statusConfig[status?.toLowerCase()] || 'bg-gradient-to-r from-gray-600 to-gray-700'}`}>
        {status || 'Pending'}
      </span>
    );
  };

  const formatKES = (amount) => {
    if (!amount) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        {/* Dashboard Header Image */}
        <div 
          className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={dashboardHeaderImage}
              alt="Dashboard"
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
                  <h1 className="section-title">MY DASHBOARD</h1>
                </div>
                <p className="mt-2 text-lg text-gray-300 animate-pulse">
                  Loading your dashboard...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading your data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      {/* Dashboard Header Image - styled exactly like Shop page */}
      <div 
        className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={dashboardHeaderImage}
            alt="Dashboard"
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
              {/* Page Header with Section Title Wrapper (from Home.jsx) */}
              <div className="section-title-wrapper">
                <h1 className="section-title">MY DASHBOARD</h1>
              </div>
              <p className="mt-2 text-lg text-gray-300">
                Welcome back, <span className="font-bold text-gradient-yellow-orange">{userData?.name?.split(' ')[0] || 'User'}</span>!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10 px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* PROFILE OVERVIEW CARD - Modern glassmorphism */}
        <div 
          className="p-6 mb-8 dashboard-card rounded-2xl"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Avatar and Basic Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-600 to-orange-600 p-0.5">
                  <div className="flex items-center justify-center w-full h-full overflow-hidden bg-gray-900 rounded-2xl">
                    {userData?.avatar && !avatarError ? (
                      <img
                        src={getFullImageUrl(userData.avatar)}
                        alt={userData.name}
                        className="object-cover w-full h-full"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                {userData?.isAccountVerified && (
                  <div className="absolute flex items-center justify-center w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full -bottom-1 -right-1">
                    <FiCheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white">{userData?.name}</h2>
                <p className="flex items-center gap-1 mt-1 text-gray-400">
                  <FiMail className="w-4 h-4" /> {userData?.email}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${
                    userData?.isAccountVerified 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                      : 'bg-gradient-to-r from-yellow-600 to-orange-600'
                  }`}>
                    {userData?.isAccountVerified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-pink-600 to-red-600">
                    <FiHeart className="inline w-3 h-3 mr-1" /> {wishlistCount} Saved
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                    <FiStar className="inline w-3 h-3 mr-1" /> {reviewsCount} Reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-3 text-gray-400 transition-all border border-gray-800 rounded-xl hover:text-white hover:bg-white/5"
                title="Home"
              >
                <FiHome className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-3 text-gray-400 transition-all border border-gray-800 rounded-xl hover:text-white hover:bg-white/5"
                title="Settings"
              >
                <FiSettings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white transition-all rounded-xl btn-yellow-orange"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Verification Prompt - Only if not verified */}
          {!userData?.isAccountVerified && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 mt-6 border bg-yellow-500/10 border-yellow-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
                  <FiShield className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Verify your email address</p>
                  <p className="text-xs text-gray-400">Get access to orders, reviews and exclusive offers</p>
                </div>
              </div>
              <button
                onClick={handleSendVerificationOtp}
                disabled={sendingOtp}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg btn-yellow-orange disabled:opacity-50"
              >
                {sendingOtp ? 'Sending...' : 'Verify Now'}
              </button>
            </div>
          )}
        </div>

        {/* STATS GRID - Modern metric cards */}
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Status Card */}
          <div 
            className="p-5 dashboard-card rounded-xl"
            data-aos="flip-up"
            data-aos-duration="1000"
            data-aos-delay="400"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                userData?.isAccountVerified ? 'from-green-600 to-emerald-600' : 'from-yellow-600 to-orange-600'
              } flex items-center justify-center`}>
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">Status</span>
            </div>
            <div className="text-2xl stat-number">{userData?.isAccountVerified ? 'Verified' : 'Pending'}</div>
            {!userData?.isAccountVerified && (
              <button
                onClick={handleSendVerificationOtp}
                disabled={sendingOtp}
                className="mt-2 text-xs text-yellow-500 hover:text-yellow-400"
              >
                {sendingOtp ? 'Sending...' : 'Verify now →'}
              </button>
            )}
          </div>

          {/* Orders Card */}
          <div 
            className="p-5 dashboard-card rounded-xl"
            data-aos="flip-up"
            data-aos-duration="1000"
            data-aos-delay="450"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <FiPackage className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">Total Orders</span>
            </div>
            <div className="text-2xl stat-number">{stats.totalOrders}</div>
            <div className="flex items-center gap-2 mt-2">
              <FiClockIcon className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-gray-400">{stats.pendingOrders} pending</span>
            </div>
          </div>

          {/* Spent Card */}
          <div 
            className="p-5 dashboard-card rounded-xl"
            data-aos="flip-up"
            data-aos-duration="1000"
            data-aos-delay="500"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">Total Spent</span>
            </div>
            <div className="text-2xl stat-number">{formatKES(stats.totalSpent)}</div>
            <div className="flex items-center gap-2 mt-2">
              <FiTrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-400">Avg {formatKES(stats.averageOrderValue)}</span>
            </div>
          </div>

          {/* Member Since Card */}
          <div 
            className="p-5 dashboard-card rounded-xl"
            data-aos="flip-up"
            data-aos-duration="1000"
            data-aos-delay="550"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-orange-600 to-red-600">
                <FiCalendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500">Member Since</span>
            </div>
            <div className="text-xl stat-number">{formatDate(userData?.createdAt)}</div>
            <div className="flex items-center gap-2 mt-2">
              <FiAward className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-gray-400">Active Member</span>
            </div>
          </div>
        </div>

        {/* MAIN GRID - Two column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN - Account Details & Recent Orders (2/3 width) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Account Details */}
            <div 
              className="p-6 dashboard-card rounded-xl"
              data-aos="fade-right"
              data-aos-duration="1000"
              data-aos-delay="600"
            >
              <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                <FiUser className="text-yellow-500" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="text-base font-medium text-white">{userData?.name || 'Not provided'}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="text-sm text-yellow-500 hover:text-yellow-400"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="text-base font-medium text-white">{userData?.email}</p>
                  </div>
                  {!userData?.isAccountVerified && (
                    <button
                      onClick={handleSendVerificationOtp}
                      disabled={sendingOtp}
                      className="text-sm text-yellow-500 hover:text-yellow-400"
                    >
                      {sendingOtp ? 'Sending...' : 'Verify'}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <div>
                    <p className="text-xs text-gray-400">Account Type</p>
                    <p className="text-base font-medium text-white capitalize">
                      {userData?.authMethod === 'google' ? 'Google Account' : 'Standard Account'}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${userData?.isAccountVerified ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div 
              className="p-6 dashboard-card rounded-xl"
              data-aos="fade-right"
              data-aos-duration="1000"
              data-aos-delay="650"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                  <FiShoppingBag className="text-yellow-500" />
                  Recent Orders
                </h3>
                <button 
                  onClick={() => navigate('/orders')}
                  className="flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400"
                >
                  View All <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <div 
                      key={order._id} 
                      className="p-4 transition-all border border-gray-700 rounded-lg cursor-pointer bg-gray-800/50 hover:border-yellow-600/50 group"
                      onClick={() => navigate(`/orders/${order._id}`)}
                      data-aos="fade-up"
                      data-aos-duration="800"
                      data-aos-delay={700 + (index * 50)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-600/30">
                            <FiPackage className="text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">#{order.orderNumber || order._id.slice(-8)}</p>
                            <p className="text-xs text-gray-400">{formatRelativeTime(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{formatKES(order.totalAmount)}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-800 border border-gray-700 rounded-full">
                    <FiShoppingBag className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="mb-4 text-gray-400">No orders yet</p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg btn-yellow-orange"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Quick Actions & Stats (1/3 width) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div 
              className="p-6 dashboard-card rounded-xl"
              data-aos="fade-left"
              data-aos-duration="1000"
              data-aos-delay="600"
            >
              <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                <FiGift className="text-yellow-500" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/shop')}
                  className="flex items-center justify-between w-full p-4 transition-all border border-gray-700 rounded-lg bg-gray-800/50 hover:border-yellow-600/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                      <FiShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Browse Shop</p>
                      <p className="text-xs text-gray-400">Discover new products</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-500 transition-colors group-hover:text-yellow-500" />
                </button>

                <button
                  onClick={() => navigate('/wishlist')}
                  className="flex items-center justify-between w-full p-4 transition-all border border-gray-700 rounded-lg bg-gray-800/50 hover:border-pink-600/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-pink-600 to-red-600">
                      <FiHeart className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">My Wishlist</p>
                      <p className="text-xs text-gray-400">{wishlistCount} items saved</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-500 transition-colors group-hover:text-pink-500" />
                </button>

                <button
                  onClick={() => navigate('/reset-password')}
                  className="flex items-center justify-between w-full p-4 transition-all border border-gray-700 rounded-lg bg-gray-800/50 hover:border-yellow-600/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                      <FiLock className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Security</p>
                      <p className="text-xs text-gray-400">Change password</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-500 transition-colors group-hover:text-yellow-500" />
                </button>

                <button
                  onClick={() => navigate('/track-order')}
                  className="flex items-center justify-between w-full p-4 transition-all border border-gray-700 rounded-lg bg-gray-800/50 hover:border-yellow-600/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600">
                      <FiEye className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">Track Order</p>
                      <p className="text-xs text-gray-400">Monitor delivery</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-500 transition-colors group-hover:text-yellow-500" />
                </button>
              </div>
            </div>

            {/* Activity Summary */}
            <div 
              className="p-6 dashboard-card rounded-xl"
              data-aos="fade-left"
              data-aos-duration="1000"
              data-aos-delay="650"
            >
              <h3 className="mb-4 text-lg font-bold text-white">Activity Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Orders placed</span>
                  <span className="text-sm font-semibold text-white">{stats.totalOrders}</span>
                </div>
                <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
                    style={{ width: `${Math.min(stats.totalOrders * 10, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-400">Reviews written</span>
                  <span className="text-sm font-semibold text-white">{reviewsCount}</span>
                </div>
                <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
                    style={{ width: `${Math.min(reviewsCount * 20, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-400">Wishlist items</span>
                  <span className="text-sm font-semibold text-white">{wishlistCount}</span>
                </div>
                <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-pink-600 to-red-600"
                    style={{ width: `${Math.min(wishlistCount * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;