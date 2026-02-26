// src/pages/Dashboard.jsx - COMPLETE FIXED VERSION with clientApi
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import clientApi from '../services/client/api'; // ✅ Use clientApi instead of axios
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
  FiMapPin
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Dashboard header image - matching Shop page
const dashboardHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for header bottom transition - indigo/blue/cyan
const headerGradient = "from-indigo-600/20 via-blue-600/20 to-cyan-600/20";

// Get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
  if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
  return `${API_URL}/uploads/${imagePath}`;
};

// Top Bar Component
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-3 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-6 mx-auto space-x-6 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <FiMapPin className="w-4 h-4" />
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

const Dashboard = () => {
  const { userData, logout, isLoggedIn, getUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
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

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
      easing: 'ease-out-cubic',
      anchorPlacement: 'top-bottom',
    });
    
    setTimeout(() => {
      AOS.refresh();
    }, 1000);
  }, []);

  // Refresh AOS when data loads
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        AOS.refresh();
      }, 500);
    }
  }, [loading]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await getUserData();
        
        // Try to fetch stats (with error handling)
        try {
          const statsResponse = await clientApi.get('/user/stats');
          if (statsResponse.data.success) setStats(statsResponse.data.stats);
        } catch (error) {
          console.log('Stats endpoint not implemented yet, using defaults');
        }

        // Try to fetch orders
        try {
          const ordersResponse = await clientApi.get('/user/orders?limit=5');
          if (ordersResponse.data.success) setRecentOrders(ordersResponse.data.orders || []);
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
          const reviewsResponse = await clientApi.get('/user/reviews/count');
          if (reviewsResponse.data.success) setReviewsCount(reviewsResponse.data.count || 0);
        } catch (error) {
          console.log('Reviews endpoint not implemented yet');
        }

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-t-4 border-gray-700 rounded-full border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* BACKGROUND LAYER - Pure black background */}
      <div className="fixed inset-0 bg-black"></div>

      {/* TOP BAR */}
      <div className="relative z-50">
        <TopBar />
      </div>

      {/* DASHBOARD HEADER IMAGE */}
      <div 
        className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64"
        data-aos="fade-in"
        data-aos-duration="1500"
        data-aos-delay="200"
        data-aos-once="false"
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
        
        {/* Header Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
              data-aos-delay="400"
              data-aos-once="false"
            >
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                MY DASHBOARD
              </h1>
              <p className="mt-1 text-sm text-gray-300 sm:text-base">
                Welcome back, {userData?.name?.split(' ')[0] || 'User'}!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="container relative z-10 px-4 py-8 mx-auto max-w-7xl">
        {/* Welcome Card */}
        <div 
          className="mb-8 overflow-hidden border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="600"
          data-aos-once="false"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-blue-600">
                  {userData?.avatar && !avatarError ? (
                    <img
                      src={getFullImageUrl(userData.avatar)}
                      alt={userData.name}
                      className="object-cover w-full h-full"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {userData?.isAccountVerified && (
                  <div className="absolute bottom-0 right-0 p-1 bg-green-500 rounded-full">
                    <FiCheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-400">{userData?.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${
                    userData?.isAccountVerified 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                      : 'bg-gradient-to-r from-yellow-600 to-orange-600'
                  }`}>
                    {userData?.isAccountVerified ? 'Verified' : 'Pending'}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-indigo-600 to-blue-600">
                    {wishlistCount} ❤️
                  </span>
                  <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                    {reviewsCount} ⭐
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 transition-all rounded-full hover:text-white hover:bg-white/5"
                title="Home"
              >
                <FiHome className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-400 transition-all rounded-full hover:text-white hover:bg-white/5"
                title="Settings"
              >
                <FiSettings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="relative px-5 py-2 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
                title="Logout"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600"></span>
                <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-red-600 to-pink-600 blur-xl group-hover:opacity-100"></span>
                <span className="relative flex items-center gap-2">
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <FiShield className="w-5 h-5 text-white" />,
              gradient: userData?.isAccountVerified 
                ? 'from-green-600 to-emerald-600' 
                : 'from-yellow-600 to-orange-600',
              label: 'Status',
              value: userData?.isAccountVerified ? 'Verified' : 'Pending',
              action: !userData?.isAccountVerified ? (
                <button
                  onClick={handleSendVerificationOtp}
                  disabled={sendingOtp}
                  className="mt-1 text-xs text-indigo-500 transition-colors hover:text-indigo-400"
                >
                  {sendingOtp ? 'Sending...' : 'Verify now'}
                </button>
              ) : null
            },
            {
              icon: <FiPackage className="w-5 h-5 text-white" />,
              gradient: 'from-purple-600 to-pink-600',
              label: 'Orders',
              value: stats.totalOrders,
              subtext: `${stats.pendingOrders} pending`
            },
            {
              icon: <FiDollarSign className="w-5 h-5 text-white" />,
              gradient: 'from-indigo-600 to-cyan-600',
              label: 'Spent',
              value: formatKES(stats.totalSpent),
              subtext: `Avg ${formatKES(stats.averageOrderValue)}`
            },
            {
              icon: <FiCalendar className="w-5 h-5 text-white" />,
              gradient: 'from-orange-600 to-red-600',
              label: 'Member Since',
              value: formatDate(userData?.createdAt)
            }
          ].map((item, index) => (
            <div 
              key={index}
              className="p-5 border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm"
              data-aos="flip-up"
              data-aos-duration="1000"
              data-aos-delay={700 + (index * 100)}
              data-aos-once="false"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-r ${item.gradient}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-base font-semibold text-white">{item.value}</p>
                  {item.subtext && <p className="text-xs text-gray-400">{item.subtext}</p>}
                  {item.action && item.action}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Account & Orders */}
          <div className="space-y-6 lg:col-span-2">
            {/* Account Details */}
            <div 
              className="p-5 border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm"
              data-aos="fade-right"
              data-aos-duration="1000"
              data-aos-delay="800"
              data-aos-once="false"
            >
              <h3 className="mb-3 text-base font-bold text-white">Account Details</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/95">
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="text-sm font-medium text-white">{userData?.name || 'Not provided'}</p>
                  </div>
                  <button className="text-xs text-indigo-500 transition-colors hover:text-indigo-400">Edit</button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/95">
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-white">{userData?.email}</p>
                  </div>
                  {!userData?.isAccountVerified && (
                    <button
                      onClick={handleSendVerificationOtp}
                      disabled={sendingOtp}
                      className="text-xs text-indigo-500 transition-colors hover:text-indigo-400"
                    >
                      {sendingOtp ? 'Sending...' : 'Verify'}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/95">
                  <div>
                    <p className="text-xs text-gray-400">Account Type</p>
                    <p className="text-sm font-medium text-white capitalize">{userData?.authMethod === 'google' ? 'Google' : 'Standard'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div 
              className="p-5 border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm"
              data-aos="fade-right"
              data-aos-duration="1000"
              data-aos-delay="900"
              data-aos-once="false"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Recent Orders</h3>
                <button className="flex items-center gap-1 text-xs text-indigo-500 transition-colors hover:text-indigo-400">
                  View All <FiArrowRight className="w-3 h-3" />
                </button>
              </div>
              
              {recentOrders.length > 0 ? (
                <div className="space-y-2">
                  {recentOrders.map(order => (
                    <div 
                      key={order._id} 
                      className="p-3 transition-all border border-gray-700 rounded-lg cursor-pointer bg-gray-800/95 hover:border-indigo-500/50"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">#{order.orderNumber || order._id.slice(-6)}</p>
                          <p className="text-xs text-gray-400">{formatRelativeTime(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{formatKES(order.totalAmount)}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <FiPackage className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-400">No orders yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4">
            <div 
              className="p-5 border border-gray-800 rounded-xl bg-gray-900/95 backdrop-blur-sm"
              data-aos="fade-left"
              data-aos-duration="1000"
              data-aos-delay="800"
              data-aos-once="false"
            >
              <h3 className="mb-3 text-base font-bold text-white">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/shop')}
                  className="flex items-center justify-between w-full p-3 transition-all border border-gray-700 rounded-lg bg-gray-800/95 hover:border-indigo-500/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600">
                      <FiShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Shop</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400 transition-colors group-hover:text-indigo-500" />
                </button>

                <button
                  onClick={() => navigate('/wishlist')}
                  className="flex items-center justify-between w-full p-3 transition-all border border-gray-700 rounded-lg bg-gray-800/95 hover:border-pink-500/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-pink-600 to-red-600">
                      <FiHeart className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Wishlist ({wishlistCount})</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400 transition-colors group-hover:text-pink-500" />
                </button>

                <button
                  onClick={() => navigate('/reset-password')}
                  className="flex items-center justify-between w-full p-3 transition-all border border-gray-700 rounded-lg bg-gray-800/95 hover:border-yellow-500/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                      <FiLock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Change Password</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400 transition-colors group-hover:text-yellow-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;