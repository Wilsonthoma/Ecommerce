import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
// ... icon imports remain the same ...

const Dashboard = () => {
  const { userData, logout, isLoggedIn, getUserData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Fetch user data and stats
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Refresh user data
        await getUserData();
        
        // Fetch user stats (mock for now)
        const statsRes = await axios.get(`${backendUrl}/api/user/stats`, { 
          withCredentials: true 
        }).catch(() => ({
          data: {
            success: true,
            stats: {
              totalOrders: 5,
              totalSpent: 24500,
              pendingOrders: 2
            }
          }
        }));
        
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, navigate, getUserData, backendUrl]);

  const handleLogout = async () => {
    await logout();
  };

  // Function to send verification OTP
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
      // Send OTP request
      const response = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Verification OTP sent to your email!');
        // Navigate to OTP verification page
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

  // Format date function
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

  // Format KES amount
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
              <h1 className="text-xl font-bold text-gray-900">KwetuShop Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome to your personal space</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 font-medium text-gray-600 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-800"
            >
              <FiHome className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome Section with Profile */}
        <div className="p-6 mb-8 bg-white shadow-lg rounded-xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500">
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
                    <FiCheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="mb-1 text-2xl font-bold text-gray-900">
                  Welcome back, {userData?.name || 'User'}! 👋
                </h2>
                <p className="text-gray-600">
                  {userData?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    userData?.isAccountVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userData?.isAccountVerified ? '✓ Verified Account' : '⚠ Pending Verification'}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 capitalize bg-blue-100 rounded-full">
                    {userData?.authMethod || 'traditional'} login
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:scale-105"
              >
                <FiShoppingBag className="w-4 h-4" />
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <FiHeart className="w-4 h-4" />
                Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Account Status Card */}
          <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                userData?.isAccountVerified 
                  ? 'bg-green-100 text-green-600'
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <p className={`text-lg font-semibold ${
                  userData?.isAccountVerified ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {userData?.isAccountVerified ? 'Verified' : 'Pending'}
                </p>
                {!userData?.isAccountVerified && (
                  <button
                    onClick={handleSendVerificationOtp}
                    disabled={sendingOtp}
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {sendingOtp ? 'Sending OTP...' : 'Verify now →'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 text-purple-600 bg-purple-100 rounded-xl">
                <FiShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.totalOrders}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats.pendingOrders} pending
                </p>
              </div>
            </div>
          </div>

          {/* Total Spent Card */}
          <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 text-blue-600 bg-blue-100 rounded-xl">
                <FiClock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatKES(stats.totalSpent)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Lifetime value
                </p>
              </div>
            </div>
          </div>

          {/* Member Since Card */}
          <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 text-cyan-600 bg-cyan-100 rounded-xl">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(userData?.createdAt)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {userData?.createdAt ? 'Loyal customer' : 'New member'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Account Details */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-900">
                <FiUser className="w-5 h-5" />
                Account Details
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">{userData?.name || 'Not provided'}</p>
                    </div>
                    <button 
                      onClick={() => navigate('/profile/edit')}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email Address</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-900">{userData?.email}</p>
                        {userData?.isAccountVerified ? (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            <FiCheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                            <FiAlertCircle className="w-3 h-3" /> Unverified
                          </span>
                        )}
                      </div>
                    </div>
                    {!userData?.isAccountVerified && (
                      <button
                        onClick={handleSendVerificationOtp}
                        disabled={sendingOtp}
                        className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50"
                      >
                        {sendingOtp ? 'Sending...' : 'Verify Email'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account Type</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {userData?.authMethod === 'google' ? 'Google Account' : 'Standard Account'}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                      {userData?.authMethod || 'traditional'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="p-6 mt-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <FiClock className="w-5 h-5" />
                  Recent Orders
                </h3>
                <button 
                  onClick={() => navigate('/orders')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                        <FiShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order #ORD-12345</p>
                        <p className="text-sm text-gray-500">Placed on {formatDate(new Date())}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatKES(4500)}</p>
                      <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                        Delivered
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg text-amber-600 bg-amber-100">
                        <FiClock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order #ORD-12346</p>
                        <p className="text-sm text-gray-500">Placed 2 days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatKES(8900)}</p>
                      <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                        Processing
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-900">
                <FiArrowRight className="w-5 h-5" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/shop')}
                  className="flex items-center justify-between w-full p-4 text-left transition-all border border-blue-100 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 hover:border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 text-blue-600 bg-white rounded-lg">
                      <FiShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Shop Products</p>
                      <p className="text-sm text-gray-500">Browse our collection</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={handleSendVerificationOtp}
                  disabled={sendingOtp || userData?.isAccountVerified}
                  className={`flex items-center justify-between w-full p-4 text-left transition-all rounded-lg border ${
                    userData?.isAccountVerified 
                      ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-100 hover:border-green-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      userData?.isAccountVerified 
                        ? 'text-gray-600 bg-gray-100'
                        : 'text-green-600 bg-white'
                    }`}>
                      <FiMail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {userData?.isAccountVerified ? 'Email Verified' : 'Verify Email'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {userData?.isAccountVerified ? 'Already verified' : 'Send verification OTP'}
                      </p>
                    </div>
                  </div>
                  <FiArrowRight className={`w-4 h-4 ${
                    userData?.isAccountVerified ? 'text-gray-300' : 'text-gray-400'
                  }`} />
                </button>

                <button
                  onClick={() => navigate('/reset-password')}
                  className="flex items-center justify-between w-full p-4 text-left transition-all border border-yellow-100 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 text-yellow-600 bg-white rounded-lg">
                      <FiLock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Change Password</p>
                      <p className="text-sm text-gray-500">Update security</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between w-full p-4 text-left transition-all border border-red-100 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 hover:border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 text-red-600 bg-white rounded-lg">
                      <FiLogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Logout</p>
                      <p className="text-sm text-gray-500">Sign out of account</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Security Tips */}
            <div className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <h4 className="mb-4 font-semibold text-gray-900">🔒 Security Tips</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Keep your email verified for account recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Never share your OTP with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Log out from shared devices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;