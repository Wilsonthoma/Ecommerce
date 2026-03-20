// src/pages/Profile.jsx - Using reusable components
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar,
  FiShoppingBag,
  FiHeart,
  FiStar,
  FiPackage,
  FiEdit2,
  FiCamera,
  FiCheckCircle,
  FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoadingSpinner, { ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';

// Header image
const profileHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

const Profile = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254 712 345 678',
    location: 'Nairobi, Kenya',
    memberSince: '2024-01-15',
    avatar: null,
    bio: 'Tech enthusiast and online shopper'
  });
  
  // Stats
  const [stats, setStats] = useState({
    orders: 24,
    wishlist: 15,
    reviews: 8,
    savedItems: 32
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

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
    }, 800);
  }, []);

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
    setEditing(false);
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="MY PROFILE" 
          subtitle="Loading your profile..."
          image={profileHeaderImage}
        />
        <div className="flex justify-center py-12">
          <ContentLoader message="Loading profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="MY PROFILE" 
        subtitle="Manage your personal information"
        image={profileHeaderImage}
      />

      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-yellow-500">Dashboard</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Profile</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <div className="p-6 text-center profile-card rounded-xl" data-aos="fade-right">
              <div className="relative inline-block">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 overflow-hidden border-4 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-500/30">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="object-cover w-full h-full" />
                  ) : (
                    <FiUser className="w-12 h-12 text-white" />
                  )}
                </div>
                <button className="absolute p-1.5 text-white transition-colors bg-gray-800 rounded-full bottom-0 right-0 hover:bg-gray-700">
                  <FiCamera className="w-3.5 h-3.5" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white">{profile.name}</h2>
              <p className="text-xs text-gray-400">{profile.email}</p>
              <p className="mt-2 text-xs text-gray-400">{profile.location}</p>
              
              <div className="flex justify-center gap-2 mt-4">
                <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                  <FiCheckCircle className="inline w-3 h-3 mr-1" />
                  Verified
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 text-center profile-card rounded-xl" data-aos="fade-up" data-aos-delay="100">
                <FiShoppingBag className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold text-white">{stats.orders}</p>
                <p className="text-[10px] text-gray-400">Orders</p>
              </div>
              <div className="p-3 text-center profile-card rounded-xl" data-aos="fade-up" data-aos-delay="150">
                <FiHeart className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold text-white">{stats.wishlist}</p>
                <p className="text-[10px] text-gray-400">Wishlist</p>
              </div>
              <div className="p-3 text-center profile-card rounded-xl" data-aos="fade-up" data-aos-delay="200">
                <FiStar className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold text-white">{stats.reviews}</p>
                <p className="text-[10px] text-gray-400">Reviews</p>
              </div>
              <div className="p-3 text-center profile-card rounded-xl" data-aos="fade-up" data-aos-delay="250">
                <FiPackage className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold text-white">{stats.savedItems}</p>
                <p className="text-[10px] text-gray-400">Saved</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-6 lg:col-span-2">
            <div className="p-6 profile-card rounded-xl" data-aos="fade-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600"
                >
                  <FiEdit2 className="w-3 h-3" />
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-xs text-gray-400">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                    />
                  ) : (
                    <p className="text-sm text-white">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-xs text-gray-400">Email Address</label>
                  <p className="flex items-center gap-2 text-sm text-white">
                    <FiMail className="text-gray-500" />
                    {profile.email}
                    <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-500 bg-green-500/10 rounded-full">Verified</span>
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-xs text-gray-400">Phone Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                    />
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-white">
                      <FiPhone className="text-gray-500" />
                      {profile.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-xs text-gray-400">Location</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                    />
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-white">
                      <FiMapPin className="text-gray-500" />
                      {profile.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-xs text-gray-400">Bio</label>
                  {editing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">{profile.bio}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-xs text-gray-400">Member Since</label>
                  <p className="flex items-center gap-2 text-sm text-white">
                    <FiCalendar className="text-gray-500" />
                    {new Date(profile.memberSince).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {editing && (
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 profile-card rounded-xl" data-aos="fade-left" data-aos-delay="200">
              <h3 className="mb-4 text-lg font-semibold text-white">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-600/10">
                      <FiShoppingBag className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Order #ORD-2024-001</p>
                      <p className="text-[10px] text-gray-400">Placed on Jan 15, 2024</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-medium text-green-500 bg-green-500/10 rounded-full">Delivered</span>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-600/10">
                      <FiHeart className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Added to Wishlist</p>
                      <p className="text-[10px] text-gray-400">Wireless Headphones</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">2 days ago</span>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-600/10">
                      <FiStar className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Reviewed Product</p>
                      <p className="text-[10px] text-gray-400">Smart Watch Series 5</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">5 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;