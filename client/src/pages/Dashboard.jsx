// client/src/pages/Dashboard.jsx
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
  FiCalendar
} from 'react-icons/fi';

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
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatKES = (amount) => {
    if (!amount) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500">
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
            <div>
              <h1 className="text-xl font-bold text-gray-900">KwetuShop</h1>
              <p className="text-sm text-gray-500">Welcome back, {userData?.name?.split(' ')[0] || 'User'}!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Home"
            >
              <FiHome className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Profile Summary */}
        <div className="p-6 mb-8 bg-white shadow-lg rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt={userData.name}
                      className="object-cover w-full h-full rounded-full"
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
                <h2 className="text-xl font-bold text-gray-900">{userData?.name || 'User'}</h2>
                <p className="text-sm text-gray-600">{userData?.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    userData?.isAccountVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userData?.isAccountVerified ? 'Verified' : 'Pending'}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium text-blue-800 capitalize bg-blue-100 rounded-full">
                    {wishlistCount} ❤️
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                    {reviewsCount} ⭐
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FiShoppingBag className="w-4 h-4" />
              Shop Now
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                userData?.isAccountVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${
                  userData?.isAccountVerified ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {userData?.isAccountVerified ? 'Verified' : 'Pending'}
                </p>
                {!userData?.isAccountVerified && (
                  <button
                    onClick={handleSendVerificationOtp}
                    disabled={sendingOtp}
                    className="mt-1 text-xs text-blue-600 hover:underline"
                  >
                    {sendingOtp ? 'Sending...' : 'Verify now'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 text-purple-600 bg-purple-100 rounded-xl">
                <FiPackage className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                {statsLoading ? (
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-900">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-500">{stats.pendingOrders} pending</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 text-blue-600 bg-blue-100 rounded-xl">
                <FiDollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Spent</p>
                {statsLoading ? (
                  <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-900">{formatKES(stats.totalSpent)}</p>
                    <p className="text-xs text-gray-500">Avg {formatKES(stats.averageOrderValue)}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow-lg rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 text-cyan-600 bg-cyan-100 rounded-xl">
                <FiCalendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(userData?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Account & Orders */}
          <div className="space-y-6 lg:col-span-2">
            {/* Account Details */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium">{userData?.name || 'Not provided'}</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:underline">Edit</button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{userData?.email}</p>
                  </div>
                  {!userData?.isAccountVerified && (
                    <button
                      onClick={handleSendVerificationOtp}
                      disabled={sendingOtp}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {sendingOtp ? 'Sending...' : 'Verify'}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-xs text-gray-500">Account Type</p>
                    <p className="font-medium capitalize">{userData?.authMethod === 'google' ? 'Google' : 'Standard'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <button className="text-sm text-blue-600 hover:underline">View All →</button>
              </div>
              
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div 
                      key={order._id} 
                      className="p-3 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">#{order.orderNumber || order._id.slice(-6)}</p>
                          <p className="text-xs text-gray-500">{formatRelativeTime(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatKES(order.totalAmount)}</p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                            {order.status || 'Processing'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FiPackage className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">No orders yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/shop')}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-blue-50 hover:bg-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <FiShoppingBag className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Shop</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => navigate('/wishlist')}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-pink-50 hover:bg-pink-100"
                >
                  <div className="flex items-center gap-3">
                    <FiHeart className="w-5 h-5 text-pink-600" />
                    <span className="font-medium">Wishlist ({wishlistCount})</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => navigate('/reset-password')}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100"
                >
                  <div className="flex items-center gap-3">
                    <FiLock className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium">Change Password</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-purple-50 hover:bg-purple-100"
                >
                  <div className="flex items-center gap-3">
                    <FiUser className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Edit Profile</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
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