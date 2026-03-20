// src/components/dashboard/ProfileOverview.jsx
import React from 'react';
import { FiUser, FiMail, FiHeart, FiStar, FiCheckCircle, FiHome, FiSettings, FiLogOut } from 'react-icons/fi';

const ProfileOverview = ({ 
  user, 
  wishlistCount, 
  reviewsCount, 
  onLogout, 
  onNavigate,
  onVerify,
  sendingOtp = false,
  avatarError = false,
  setAvatarError
}) => {
  const getFullImageUrl = (imagePath) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
    return `${API_URL}/uploads/${imagePath}`;
  };

  return (
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
                {user?.avatar && !avatarError ? (
                  <img
                    src={getFullImageUrl(user.avatar)}
                    alt={user.name}
                    className="object-cover w-full h-full"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            {user?.isAccountVerified && (
              <div className="absolute flex items-center justify-center w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full -bottom-1 -right-1">
                <FiCheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="flex items-center gap-1 mt-1 text-gray-400">
              <FiMail className="w-4 h-4" /> {user?.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${
                user?.isAccountVerified 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                  : 'bg-gradient-to-r from-yellow-600 to-orange-600'
              }`}>
                {user?.isAccountVerified ? '✓ Verified' : '⏳ Pending'}
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
            onClick={() => onNavigate('/')}
            className="p-3 text-gray-400 transition-all border border-gray-800 rounded-xl hover:text-white hover:bg-white/5"
            title="Home"
          >
            <FiHome className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('/settings')}
            className="p-3 text-gray-400 transition-all border border-gray-800 rounded-xl hover:text-white hover:bg-white/5"
            title="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Verification Prompt */}
      {!user?.isAccountVerified && (
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
            onClick={onVerify}
            disabled={sendingOtp}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 disabled:opacity-50"
          >
            {sendingOtp ? 'Sending...' : 'Verify Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;