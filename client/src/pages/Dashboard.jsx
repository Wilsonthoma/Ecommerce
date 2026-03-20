// src/pages/Dashboard.jsx - Refactored with reusable components
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import clientApi from '../services/client/api';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import StatsCard from '../components/dashboard/StatsCard';
import ProfileOverview from '../components/dashboard/ProfileOverview';
import RecentOrders from '../components/dashboard/RecentOrders';
import QuickActions from '../components/dashboard/QuickActions';
import ActivitySummary from '../components/dashboard/ActivitySummary';
import { toast } from 'react-toastify';
import {
  FiUser,           // ADD THIS LINE
  FiShield,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiAward
} from 'react-icons/fi';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Dashboard header image
const dashboardHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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

  // Initialize AOS
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

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await getUserData();
        
        // Try to fetch stats
        try {
          const statsResponse = await clientApi.get('/user/stats');
          if (statsResponse?.data?.success) setStats(statsResponse.data.stats);
        } catch (error) {
          console.log('Stats endpoint not implemented yet');
        }

        // Try to fetch orders
        try {
          const ordersResponse = await clientApi.get('/user/orders?limit=5');
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
          const reviewsResponse = await clientApi.get('/user/reviews/count');
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

  const formatKES = (amount) => {
    if (!amount) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="MY DASHBOARD" 
          subtitle="Loading your dashboard..."
          image={dashboardHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading your data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="MY DASHBOARD" 
        subtitle={`Welcome back, ${userData?.name?.split(' ')[0] || 'User'}!`}
        image={dashboardHeaderImage}
      />

      <main className="relative z-10 px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Profile Overview */}
        <ProfileOverview
          user={userData}
          wishlistCount={wishlistCount}
          reviewsCount={reviewsCount}
          onLogout={handleLogout}
          onNavigate={navigate}
          onVerify={handleSendVerificationOtp}
          sendingOtp={sendingOtp}
          avatarError={avatarError}
          setAvatarError={setAvatarError}
        />

        {/* STATS GRID */}
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Status Card */}
          <StatsCard
            icon={FiShield}
            title="Status"
            value={userData?.isAccountVerified ? 'Verified' : 'Pending'}
            subtitle={!userData?.isAccountVerified && (
              <button
                onClick={handleSendVerificationOtp}
                disabled={sendingOtp}
                className="text-xs text-yellow-500 hover:text-yellow-400"
              >
                {sendingOtp ? 'Sending...' : 'Verify now →'}
              </button>
            )}
            gradient={userData?.isAccountVerified ? 'from-green-600 to-emerald-600' : 'from-yellow-600 to-orange-600'}
          />

          {/* Orders Card */}
          <StatsCard
            icon={FiPackage}
            title="Total Orders"
            value={stats.totalOrders}
            subtitleIcon={FiClock}
            subtitleText={`${stats.pendingOrders} pending`}
            gradient="from-purple-600 to-pink-600"
          />

          {/* Spent Card */}
          <StatsCard
            icon={FiDollarSign}
            title="Total Spent"
            value={formatKES(stats.totalSpent)}
            subtitleIcon={FiTrendingUp}
            subtitleText={`Avg ${formatKES(stats.averageOrderValue)}`}
            gradient="from-yellow-600 to-orange-600"
          />

          {/* Member Since Card */}
          <StatsCard
            icon={FiCalendar}
            title="Member Since"
            value={userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
            subtitleIcon={FiAward}
            subtitleText="Active Member"
            gradient="from-orange-600 to-red-600"
          />
        </div>

        {/* MAIN GRID - Two column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN - Account Details & Recent Orders */}
          <div className="space-y-6 lg:col-span-2">
            {/* Account Details */}
            <div className="p-6 dashboard-card rounded-xl" data-aos="fade-right" data-aos-duration="1000" data-aos-delay="600">
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
                  <button onClick={() => navigate('/settings')} className="text-sm text-yellow-500 hover:text-yellow-400">Edit</button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="text-base font-medium text-white">{userData?.email}</p>
                  </div>
                  {!userData?.isAccountVerified && (
                    <button onClick={handleSendVerificationOtp} disabled={sendingOtp} className="text-sm text-yellow-500 hover:text-yellow-400">
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
            <RecentOrders
              orders={recentOrders}
              onViewAll={() => navigate('/orders')}
              onOrderClick={(orderId) => navigate(`/orders/${orderId}`)}
              onStartShopping={() => navigate('/shop')}
            />
          </div>

          {/* RIGHT COLUMN - Quick Actions & Activity Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions
              wishlistCount={wishlistCount}
              onNavigate={navigate}
            />

            {/* Activity Summary */}
            <ActivitySummary
              stats={stats}
              reviewsCount={reviewsCount}
              wishlistCount={wishlistCount}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;