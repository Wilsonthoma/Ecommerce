// src/components/Navbar.jsx - Refactored with reusable components
import React, { useContext, useState, useRef, useEffect, useCallback, memo } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import clientApi from "../services/client/api";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { BsLightningCharge } from "react-icons/bs";

// Import navbar components
import TopBar from "./navbar/TopBar";
import DesktopSearch from "./navbar/DesktopSearch";
import UserMenu from "./navbar/UserMenu";
import VerificationBanner from "./navbar/VerificationBanner";
import VerificationModal from "./navbar/VerificationModal";
import MobileMenu from "./navbar/MobileMenu";

// Constants
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_ENDPOINTS = {
  CART: '/cart',
  WISHLIST: '/wishlist',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  SETTINGS: '/settings',
  TRACK_ORDER: '/track-order',
  DEALS: '/deals',
  HELP: '/help',
  SHOP: '/shop'
};

const Navbar = memo(() => {
  const navigate = useNavigate();
  const {
    userData: user,
    isLoggedIn,
    logout: contextLogout,
    getUserData,
  } = useContext(AppContext);

  const { cart } = useCart();
  const { wishlistCount } = useWishlist();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [showVerificationBanner, setShowVerificationBanner] = useState(
    localStorage.getItem("hideVerificationBanner") !== "true"
  );

  // Current year
  const currentYear = new Date().getFullYear();

  // Get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
    return `${API_URL}/uploads/${imagePath}`;
  };

  // Cart count
  useEffect(() => {
    if (cart) {
      const quantity = cart.totalQuantity ||
        cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      setCartCount(quantity);
    }
  }, [cart]);

  // Timers
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    localStorage.setItem("hideVerificationBanner", (!showVerificationBanner).toString());
  }, [showVerificationBanner]);

  // Handlers
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(`${API_ENDPOINTS.SHOP}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
      setMobileSearchVisible(false);
    }
  }, [searchQuery, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") handleSearch();
  }, [handleSearch]);

  const handleLogout = useCallback(async () => {
    try {
      await contextLogout();
      setCartCount(0);
      toast.success("✅ Logged out successfully!");
    } catch (error) {
      toast.error("❌ Logout failed. Please try again.");
    }
  }, [contextLogout]);

  const handleSendVerification = useCallback(async () => {
    setVerifyLoading(true);
    try {
      const response = await clientApi.post('/auth/send-verify-otp', {});
      if (response.data.success) {
        toast.success("📧 Verification code sent!");
        setIsVerifyModalOpen(true);
        setResendTimer(60);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send code");
    } finally {
      setVerifyLoading(false);
    }
  }, []);

  const handleVerifyOtpChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...verifyOtp];
    newOtp[index] = value;
    setVerifyOtp(newOtp);
  }, [verifyOtp]);

  const handleVerifyEmail = useCallback(async (e) => {
    e.preventDefault();
    const otpString = verifyOtp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await clientApi.post('/auth/verify-email', { otp: otpString });
      if (response.data.success) {
        toast.success("✅ Email verified successfully!");
        setIsVerifyModalOpen(false);
        setShowVerificationBanner(false);
        await getUserData();
        setVerifyOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      setVerifyOtp(["", "", "", "", "", ""]);
    } finally {
      setVerifyLoading(false);
    }
  }, [verifyOtp, getUserData]);

  const handleResendVerification = useCallback(async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer}s`);
      return;
    }
    setVerifyLoading(true);
    try {
      const response = await clientApi.post('/auth/send-verify-otp', {});
      if (response.data.success) {
        toast.success("📧 Code resent!");
        setResendTimer(60);
        setVerifyOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend");
    } finally {
      setVerifyLoading(false);
    }
  }, [resendTimer]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    setMobileSearchVisible(false);
  }, []);

  const toggleMobileSearch = useCallback(() => {
    setMobileSearchVisible(prev => !prev);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <TopBar onNavigate={navigate} />

      {/* Email Verification Banner */}
      {isLoggedIn && user && !user.isAccountVerified && showVerificationBanner && (
        <VerificationBanner
          onVerify={handleSendVerification}
          onClose={() => setShowVerificationBanner(false)}
          verifyLoading={verifyLoading}
        />
      )}

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/10 via-orange-600/10 to-transparent"></div>
        <div className="relative px-3 mx-auto max-w-7xl sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo */}
            <div 
              onClick={() => navigate("/")} 
              className="flex items-center flex-shrink-0 cursor-pointer group"
            >
              <img 
                src={assets.logo} 
                alt="KwetuShop" 
                className="relative w-auto h-8 transition-transform sm:h-9 lg:h-10" 
              />
            </div>

            {/* Desktop Search */}
            <DesktopSearch
              searchQuery={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSearchSubmit={handleSearch}
              onKeyDown={handleKeyDown}
            />

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              {/* Mobile Search Button */}
              <button
                onClick={toggleMobileSearch}
                className="p-2 text-gray-400 transition-all rounded-full lg:hidden hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20"
              >
                <FiSearch className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Wishlist */}
              {isLoggedIn ? (
                <button
                  onClick={() => navigate(API_ENDPOINTS.WISHLIST)}
                  className="relative flex-col items-center hidden p-2 text-gray-400 transition-all rounded-full sm:flex hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20 group"
                >
                  <div className="relative">
                    <FiHeart className="w-5 h-5 transition-transform sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:scale-110" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1rem] h-4 px-1 text-[8px] font-bold text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block text-xs mt-0.5 group-hover:glow-text">Wishlist</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(API_ENDPOINTS.LOGIN)}
                  className="relative flex-col items-center hidden p-2 text-gray-400 transition-all rounded-full sm:flex hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20 group"
                  title="Login to use wishlist"
                >
                  <FiHeart className="w-5 h-5 transition-transform sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:scale-110" />
                  <span className="hidden lg:block text-xs mt-0.5 group-hover:glow-text">Wishlist</span>
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => navigate(API_ENDPOINTS.CART)}
                className="relative flex items-center gap-1 px-2 py-2 text-gray-400 transition-all rounded-full group sm:gap-2 sm:px-3 hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20"
              >
                <div className="relative">
                  <FiShoppingCart className="w-5 h-5 transition-transform sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:scale-110" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden text-sm font-medium lg:block group-hover:glow-text">Cart</span>
              </button>

              {/* User Menu */}
              <UserMenu
                isLoggedIn={isLoggedIn}
                user={user}
                wishlistCount={wishlistCount}
                avatarError={avatarError}
                getFullImageUrl={getFullImageUrl}
                onNavigate={navigate}
                onLogout={handleLogout}
                onVerify={handleSendVerification}
                verifyLoading={verifyLoading}
              />

              {/* Mobile Menu Toggle */}
              <button
                data-menu-toggle
                onClick={toggleMobileMenu}
                className="p-2 text-gray-400 transition-all rounded-full lg:hidden hover:text-white hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {mobileSearchVisible && (
            <div className="pb-3 lg:hidden animate-fadeIn">
              <div className="relative flex items-center w-full overflow-hidden transition-all border-2 rounded-full group bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/50">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 py-2.5 px-4 text-gray-300 placeholder-gray-600 bg-transparent focus:outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  className="group relative px-4 py-2.5 text-white transition-all overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                  <span className="relative">
                    <FiSearch className="w-5 h-5" />
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        user={user}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSearchSubmit={handleSearch}
        onKeyDown={handleKeyDown}
        onNavigate={navigate}
        onLogout={handleLogout}
        currentYear={currentYear}
        avatarError={avatarError}
        getFullImageUrl={getFullImageUrl}
      />

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isVerifyModalOpen}
        userEmail={user?.email}
        verifyOtp={verifyOtp}
        onOtpChange={handleVerifyOtpChange}
        onVerifySubmit={handleVerifyEmail}
        onResend={handleResendVerification}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setVerifyOtp(["", "", "", "", "", ""]);
        }}
        verifyLoading={verifyLoading}
        resendTimer={resendTimer}
      />
    </>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;