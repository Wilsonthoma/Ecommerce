// src/pages/Dashboard.jsx - TRANSFORMED with oraimo black gradients and glowing effects
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  FiAlertCircle,
  FiShield,
  FiArrowRight,
  FiHome,
  FiSettings,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiAward,
  FiStar
} from 'react-icons/fi';
import { BsLightningCharge, BsArrowRight } from 'react-icons/bs';

const Dashboard = () => {
  const { userData, logout, isLoggedIn, getUserData, backendUrl, getToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  
  // Data states
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await getUserData();
        await Promise.all([
          fetchUserStats(),
          fetchRecentOrders(),
          fetchWishlistCount(),
          fetchReviewsCount()
        ]);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, navigate, getUserData]);

  const fetchUserStats = async () => {
    setStatsLoading(true);
    try {
      const token = getToken?.() || localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/user/stats`, { 
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = getToken?.() || localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/user/orders?limit=5`, { 
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) setRecentOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  const fetchReviewsCount = async () => {
    try {
      const token = getToken?.() || localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/user/reviews/count`, { 
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) setReviewsCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching reviews count:', error);
    }
  };

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
      const token = getToken?.() || localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        {},
        { 
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

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
      'delivered': 'from-green-600 to-emerald-600',
      'completed': 'from-green-600 to-emerald-600',
      'processing': 'from-yellow-600 to-orange-600',
      'pending': 'from-yellow-600 to-orange-600',
      'shipped': 'from-blue-600 to-cyan-600',
      'cancelled': 'from-red-600 to-pink-600'
    };
    
    const gradient = statusConfig[status?.toLowerCase()] || 'from-gray-600 to-gray-700';
    
    return (
      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r ${gradient}`}>
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-t-4 border-gray-700 rounded-full border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-6 text-gray-400 glow-text">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 backdrop-blur-lg">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {userData?.name?.charAt(0)?.toUpperCase() || 'K'}
                  </span>
                )}
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-50 blur"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white glow-text">KwetuShop</h1>
              <p className="text-sm text-gray-400">Welcome back, {userData?.name?.split(' ')[0] || 'User'}!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-3 text-gray-400 transition-all rounded-full hover:text-white hover:bg-white/5"
              title="Home"
            >
              <FiHome className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-3 text-gray-400 transition-all rounded-full hover:text-white hover:bg-white/5"
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="group relative px-6 py-3 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
              title="Logout"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center gap-2">
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 mx-auto">
        {/* Profile Summary */}
        <div className="relative p-6 mb-8 overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt={userData.name}
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-50 blur"></div>
                {userData?.isAccountVerified && (
                  <div className="absolute bottom-0 right-0 p-1 bg-green-500 rounded-full">
                    <FiCheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{userData?.name || 'User'}</h2>
                <p className="text-gray-400">{userData?.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    userData?.isAccountVerified 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                  }`}>
                    {userData?.isAccountVerified ? 'Verified' : 'Pending'}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-red-600 to-pink-600">
                    {wishlistCount} ❤️
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
                    {reviewsCount} ⭐
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/shop')}
              className="group relative px-6 py-3 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center gap-2">
                <FiShoppingBag className="w-4 h-4" />
                Shop Now
                <BsArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Status Card */}
          <div className="group relative p-6 overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                userData?.isAccountVerified 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                  : 'bg-gradient-to-r from-yellow-600 to-orange-600'
              }`}>
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className={`text-lg font-semibold ${
                  userData?.isAccountVerified ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {userData?.isAccountVerified ? 'Verified' : 'Pending'}
                </p>
                {!userData?.isAccountVerified && (
                  <button
                    onClick={handleSendVerificationOtp}
                    disabled={sendingOtp}
                    className="mt-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    {sendingOtp ? 'Sending...' : 'Verify now'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="group relative p-6 overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                <FiPackage className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Orders</p>
                {statsLoading ? (
                  <div className="w-16 h-6 bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-white">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-400">{stats.pendingOrders} pending</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Spent Card */}
          <div className="group relative p-6 overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Spent</p>
                {statsLoading ? (
                  <div className="w-20 h-6 bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-white">{formatKES(stats.totalSpent)}</p>
                    <p className="text-xs text-gray-400">Avg {formatKES(stats.averageOrderValue)}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Member Since Card */}
          <div className="group relative p-6 overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600">
                <FiCalendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="text-lg font-semibold text-white">{formatDate(userData?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Account & Orders */}
          <div className="space-y-6 lg:col-span-2">
            {/* Account Details */}
            <div className="relative p-6 overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
              <h3 className="relative mb-4 text-lg font-bold text-white">Account Details</h3>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="font-medium text-white">{userData?.name || 'Not provided'}</p>
                  </div>
                  <button className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Edit</button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium text-white">{userData?.email}</p>
                  </div>
                  {!userData?.isAccountVerified && (
                    <button
                      onClick={handleSendVerificationOtp}
                      disabled={sendingOtp}
                      className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      {sendingOtp ? 'Sending...' : 'Verify'}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400">Account Type</p>
                    <p className="font-medium text-white capitalize">{userData?.authMethod === 'google' ? 'Google' : 'Standard'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="relative p-6 overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent"></div>
              <div className="relative flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                <button className="text-sm text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1">
                  View All <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-gray-700 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div 
                      key={order._id} 
                      className="relative p-4 overflow-hidden transition-all border rounded-lg cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50 group"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="relative flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">#{order.orderNumber || order._id.slice(-6)}</p>
                          <p className="text-xs text-gray-400">{formatRelativeTime(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">{formatKES(order.totalAmount)}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FiPackage className="w-16 h-16 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">No orders yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4">
            <div className="relative p-6 overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
              <h3 className="relative mb-4 text-lg font-bold text-white">Quick Actions</h3>
              <div className="relative space-y-3">
                <button
                  onClick={() => navigate('/shop')}
                  className="group relative flex items-center justify-between w-full p-4 overflow-hidden transition-all border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                      <FiShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white">Shop</span>
                  </div>
                  <FiArrowRight className="relative w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/wishlist')}
                  className="group relative flex items-center justify-between w-full p-4 overflow-hidden transition-all border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-pink-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-pink-600 to-red-600">
                      <FiHeart className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white">Wishlist ({wishlistCount})</span>
                  </div>
                  <FiArrowRight className="relative w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/reset-password')}
                  className="group relative flex items-center justify-between w-full p-4 overflow-hidden transition-all border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-yellow-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                      <FiLock className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white">Change Password</span>
                  </div>
                  <FiArrowRight className="relative w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/profile')}
                  className="group relative flex items-center justify-between w-full p-4 overflow-hidden transition-all border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white">Edit Profile</span>
                  </div>
                  <FiArrowRight className="relative w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 20px currentColor;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;