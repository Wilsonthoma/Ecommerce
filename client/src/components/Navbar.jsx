// src/components/Navbar.jsx
import React, { useContext, useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiHome,
  FiUser,
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiMapPin,
  FiGrid,
  FiChevronDown,
  FiChevronRight,
  FiLogIn,
  FiPackage,
  FiMenu,
  FiX,
  FiLogOut,
  FiHelpCircle,
  FiPhone,
  FiMail,
  FiShield,
  FiAlertCircle,
  FiClock,
  FiTruck,
} from "react-icons/fi";
import { 
  BsFire, 
  BsShieldCheck, 
  BsTrophy, 
} from "react-icons/bs";
import { MdVerified, MdWarning } from "react-icons/md";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

// ==================== CONSTANTS ====================
const API_ENDPOINTS = {
  CATEGORIES: '/api/categories',
  SEARCH: '/shop?search=',
  CART: '/cart',
  WISHLIST: '/wishlist',
  ORDERS: '/orders',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  TRACK_ORDER: '/track-order',
  DEALS: '/deals',
  HELP: '/help',
  ABOUT: '/about',
  SELL: '/sell',
};

const Navbar = memo(() => {
  const navigate = useNavigate();
  const {
    userData: user,
    isLoggedIn,
    logout: contextLogout,
    getUserData,
    getToken,
  } = useContext(AppContext);

  const { cart } = useCart();

  // ==================== STATE ====================
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  // Email verification
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState(["", "", "", "", "", ""]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showVerificationBanner, setShowVerificationBanner] = useState(
    localStorage.getItem("hideVerificationBanner") !== "true"
  );
  
  // Refs
  const accountDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const otpInputRefs = useRef([]);

  // ==================== CURRENT YEAR ====================
  const currentYear = new Date().getFullYear();

  // ==================== CATEGORIES ====================
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const token = getToken?.();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const { data } = await axios.get(API_ENDPOINTS.CATEGORIES, { 
          headers,
          timeout: 8000 
        });
        
        const categoriesData = data.categories || data.data || data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error.message);
        setCategories([
          { id: "1", slug: "smartphones", name: "Smartphones", count: 245, icon: "📱" },
          { id: "2", slug: "laptops", name: "Laptops", count: 189, icon: "💻" },
          { id: "3", slug: "audio", name: "Audio", count: 320, icon: "🎧" },
          { id: "4", slug: "cameras", name: "Cameras", count: 98, icon: "📷" },
          { id: "5", slug: "wearables", name: "Wearables", count: 156, icon: "⌚" },
          { id: "6", slug: "tablets", name: "Tablets", count: 112, icon: "📱" },
          { id: "7", slug: "accessories", name: "Accessories", count: 432, icon: "🎮" },
          { id: "8", slug: "gaming", name: "Gaming", count: 87, icon: "🎮" },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [getToken]);

  // ==================== CART COUNT ====================
  useEffect(() => {
    if (cart) {
      const quantity = cart.totalQuantity ||
        cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      setCartCount(quantity);
    }
  }, [cart]);

  // ==================== CLICK OUTSIDE ====================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) 
        setAccountDropdownOpen(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) 
        setCategoryDropdownOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && 
          !e.target.closest("[data-menu-toggle]")) 
        setMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==================== TIMERS ====================
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    localStorage.setItem("hideVerificationBanner", (!showVerificationBanner).toString());
  }, [showVerificationBanner]);

  // ==================== HANDLERS ====================
  const toggleAccountDropdown = useCallback(() => {
    setAccountDropdownOpen(prev => !prev);
    setCategoryDropdownOpen(false);
  }, []);

  const toggleCategoryDropdown = useCallback(() => {
    setCategoryDropdownOpen(prev => !prev);
    setAccountDropdownOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    setMobileSearchVisible(false);
  }, []);

  const toggleMobileSearch = useCallback(() => {
    setMobileSearchVisible(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await contextLogout();
      setCartCount(0);
      setAccountDropdownOpen(false);
      setMobileMenuOpen(false);
      toast.success("✅ Logged out successfully!");
    } catch (error) {
      toast.error("❌ Logout failed. Please try again.");
    }
  }, [contextLogout]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(`${API_ENDPOINTS.SEARCH}${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
      setMobileSearchVisible(false);
    }
  }, [searchQuery, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") handleSearch();
  }, [handleSearch]);

  // ==================== EMAIL VERIFICATION ====================
  const handleSendVerification = useCallback(async () => {
    setVerifyLoading(true);
    try {
      const token = getToken?.() || localStorage.getItem('token');
      const { data } = await axios.post(
        `/api/auth/send-verify-otp`,
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
            "Authorization": token ? `Bearer ${token}` : "",
          },
        }
      );

      if (data.success) {
        toast.success("📧 Verification code sent!");
        setIsVerifyModalOpen(true);
        setResendTimer(60);
        if (process.env.NODE_ENV === 'development' && data.otp) {
          console.log("🔐 [DEV] OTP:", data.otp);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => navigate(API_ENDPOINTS.LOGIN), 2000);
      } else {
        toast.error(error.response?.data?.message || "Failed to send code");
      }
    } finally {
      setVerifyLoading(false);
    }
  }, [getToken, navigate]);

  const handleVerifyOtpChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...verifyOtp];
    newOtp[index] = value;
    setVerifyOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  }, [verifyOtp]);

  const handleVerifyOtpKeyDown = useCallback((index, e) => {
    if (e.key === "Backspace" && !verifyOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }, [verifyOtp]);

  const handleVerifyOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasted)) {
      toast.error("Only numbers allowed");
      return;
    }
    const digits = pasted.slice(0, 6).split("");
    const newOtp = [...verifyOtp];
    digits.forEach((digit, i) => { if (i < 6) newOtp[i] = digit; });
    setVerifyOtp(newOtp);
    otpInputRefs.current[Math.min(digits.length, 5)]?.focus();
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
      const token = getToken?.() || localStorage.getItem('token');
      const { data } = await axios.post(
        `/api/auth/verify-email`,
        { otp: otpString },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
            "Authorization": token ? `Bearer ${token}` : "",
          },
        }
      );

      if (data.success) {
        toast.success("✅ Email verified successfully!");
        setIsVerifyModalOpen(false);
        setShowVerificationBanner(false);
        await getUserData();
        setVerifyOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      setVerifyOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setVerifyLoading(false);
    }
  }, [verifyOtp, getToken, getUserData]);

  const handleResendVerification = useCallback(async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer}s`);
      return;
    }
    setVerifyLoading(true);
    try {
      const token = getToken?.() || localStorage.getItem('token');
      const { data } = await axios.post(
        `/api/auth/send-verify-otp`,
        {},
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
            "Authorization": token ? `Bearer ${token}` : "",
          },
        }
      );
      if (data.success) {
        toast.success("📧 Code resent!");
        setResendTimer(60);
        setVerifyOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend");
    } finally {
      setVerifyLoading(false);
    }
  }, [resendTimer, getToken]);

  // ==================== MEMOIZED MENU ITEMS ====================
  const userMenuItems = useMemo(() => [
    { label: "Dashboard", path: API_ENDPOINTS.DASHBOARD, icon: <FiHome className="w-4 h-4" /> },
    { label: "My Orders", path: API_ENDPOINTS.ORDERS, icon: <FiPackage className="w-4 h-4" /> },
    { label: "Wishlist", path: API_ENDPOINTS.WISHLIST, icon: <FiHeart className="w-4 h-4" /> },
  ], []);

  // ==================== RENDER ====================
  return (
    <>
      {/* ========== TOP BAR ========== */}
      <div className="text-white bg-gradient-to-r from-blue-900 to-cyan-800">
        <div className="px-3 mx-auto max-w-7xl sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-9 sm:h-10 text-[11px] sm:text-xs">
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={() => navigate(API_ENDPOINTS.SELL)}
                className="hidden sm:flex items-center gap-1.5 hover:text-yellow-300 transition-colors"
              >
                <BsTrophy className="w-3.5 h-3.5" />
                <span>Sell on KwetuShop</span>
              </button>
              <button 
                onClick={() => navigate(API_ENDPOINTS.TRACK_ORDER)}
                className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors"
              >
                <FiTruck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Track Order</span>
                <span className="xs:hidden">Track</span>
              </button>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <a 
                href="tel:0700KWEƬU" 
                className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors"
              >
                <FiPhone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">0700 KWEƬU</span>
                <span className="sm:hidden">Support</span>
              </a>
              <div className="items-center hidden gap-3 lg:flex">
                <a href="#" className="hover:text-yellow-300"><FaFacebookF className="w-3.5 h-3.5" /></a>
                <a href="#" className="hover:text-yellow-300"><FaTwitter className="w-3.5 h-3.5" /></a>
                <a href="#" className="hover:text-yellow-300"><FaInstagram className="w-3.5 h-3.5" /></a>
                <a href="#" className="hover:text-yellow-300"><FaYoutube className="w-3.5 h-3.5" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== EMAIL VERIFICATION BANNER ========== */}
      {isLoggedIn && user && !user.isAccountVerified && showVerificationBanner && (
        <div className="relative border-b bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
            <div className="flex flex-col items-start justify-between gap-2 xs:flex-row xs:items-center xs:gap-3">
              <div className="flex items-start w-full gap-2 xs:items-center sm:gap-3 xs:w-auto">
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full sm:w-7 sm:h-7 bg-amber-100">
                  <FiAlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                </div>
                <div className="flex-1 text-xs xs:flex-none sm:text-sm">
                  <span className="font-medium text-amber-800">Verify your email</span>
                  <span className="hidden sm:inline text-amber-600 ml-1.5">
                    to unlock all features
                  </span>
                </div>
              </div>
              <div className="flex items-center w-full gap-2 xs:w-auto">
                <button
                  onClick={handleSendVerification}
                  disabled={verifyLoading}
                  className="flex-1 xs:flex-none px-3 sm:px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  {verifyLoading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <FiClock className="w-3 h-3 animate-spin" />
                      <span>Sending...</span>
                    </span>
                  ) : (
                    "Verify Now"
                  )}
                </button>
                <button
                  onClick={() => setShowVerificationBanner(false)}
                  className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== MAIN NAVBAR ========== */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="px-3 mx-auto max-w-7xl sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo */}
            <div 
              onClick={() => navigate("/")} 
              className="flex items-center flex-shrink-0 cursor-pointer group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/")}
            >
              <img 
                src={assets.logo} 
                alt="KwetuShop" 
                className="w-auto h-8 transition-transform sm:h-9 lg:h-10 group-hover:scale-105" 
              />
            </div>

            {/* Desktop Search Bar */}
            <div className="flex-1 hidden max-w-3xl mx-6 lg:flex">
              <div className="relative flex items-center w-full overflow-hidden transition-all bg-white border-2 border-blue-900 rounded-lg focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
                {/* Category Dropdown */}
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    onClick={toggleCategoryDropdown}
                    className="flex items-center gap-1.5 h-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 transition-colors whitespace-nowrap"
                  >
                    <FiGrid className="w-4 h-4 text-blue-900" />
                    <span className="hidden xl:inline">Categories</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Category Dropdown Menu */}
                  {categoryDropdownOpen && (
                    <div className="absolute left-0 z-50 py-4 mt-1 bg-white border border-gray-200 shadow-2xl top-full w-72 sm:w-80 lg:w-96 rounded-xl animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Shop by Category</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-1 p-3">
                        {categoriesLoading ? (
                          <div className="col-span-2 py-8 text-center text-gray-500">Loading...</div>
                        ) : (
                          categories.slice(0, 8).map((cat) => (
                            <button
                              key={cat.id || cat._id}
                              onClick={() => {
                                navigate(`/shop?category=${cat.slug || cat.id || cat._id}`);
                                setCategoryDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 p-3 transition-colors rounded-lg hover:bg-blue-50 group"
                            >
                              <span className="text-xl text-gray-600 group-hover:text-blue-900">
                                {cat.icon || "📱"}
                              </span>
                              <div className="flex-1 text-left">
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-900">
                                  {cat.name}
                                </span>
                                {cat.count && (
                                  <span className="block text-xs text-gray-500">
                                    {cat.count.toLocaleString()}+
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="px-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => { navigate("/shop"); setCategoryDropdownOpen(false); }}
                          className="w-full py-2 text-sm font-medium text-center text-blue-600 hover:text-blue-700"
                        >
                          View All Categories →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Search products, brands & categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2.5 bg-blue-900 text-white font-medium hover:bg-blue-800 transition-colors flex items-center gap-2"
                >
                  <FiSearch className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              {/* Mobile Search Button */}
              <button
                onClick={toggleMobileSearch}
                className="p-2 text-gray-600 rounded-lg lg:hidden hover:text-blue-900 hover:bg-gray-100"
              >
                <FiSearch className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* User Account */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={toggleAccountDropdown}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="relative">
                    <FiUser className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    {user && !user.isAccountVerified && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <span className="hidden text-sm font-medium lg:inline">
                    {user ? user.name?.split(" ")[0] || "Account" : "Account"}
                  </span>
                  <FiChevronDown className={`hidden lg:block w-4 h-4 transition-transform ${accountDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Account Dropdown */}
                {accountDropdownOpen && (
                  <div className="absolute right-0 z-50 w-64 py-2 mt-1 bg-white border border-gray-200 shadow-2xl top-full rounded-xl animate-fadeIn">
                    {isLoggedIn ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-r from-blue-900 to-cyan-800">
                              {user?.name?.charAt(0) || <FiUser className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                              {user?.isAccountVerified ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-0.5">
                                  <MdVerified className="w-3 h-3" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                                  <MdWarning className="w-3 h-3" />
                                  Not Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Verification Prompt */}
                        {!user.isAccountVerified && (
                          <div className="p-3 mx-3 my-2 border rounded-lg bg-amber-50 border-amber-100">
                            <div className="flex items-start gap-2">
                              <FiShield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-amber-800">Verify your email</p>
                                <p className="text-xs text-amber-600 mt-0.5 mb-2">
                                  Unlock all features
                                </p>
                                <button
                                  onClick={() => {
                                    handleSendVerification();
                                    setAccountDropdownOpen(false);
                                  }}
                                  disabled={verifyLoading}
                                  className="w-full px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50"
                                >
                                  {verifyLoading ? "Sending..." : "Verify Now"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Menu Items */}
                        <div className="py-1">
                          {userMenuItems.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                navigate(item.path);
                                setAccountDropdownOpen(false);
                              }}
                              className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                            >
                              <span className="text-gray-500 group-hover:text-blue-900">{item.icon}</span>
                              <span className="flex-1 text-left">{item.label}</span>
                              <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-900" />
                            </button>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="pt-1 mt-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <FiLogOut className="w-4 h-4" />
                            <span className="flex-1 text-left">Logout</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Login/Signup */
                      <div className="p-4">
                        <div className="mb-3 text-center">
                          <p className="text-sm font-medium text-gray-900">Welcome to KwetuShop!</p>
                          <p className="mt-1 text-xs text-gray-600">Sign in for faster checkout</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate(API_ENDPOINTS.LOGIN);
                            setAccountDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiLogIn className="w-4 h-4" />
                          Sign In / Register
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => navigate(API_ENDPOINTS.WISHLIST)}
                className="relative flex-col items-center hidden p-2 text-gray-600 transition-colors rounded-lg sm:flex hover:text-red-500 hover:bg-gray-100"
              >
                <FiHeart className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="hidden lg:block text-xs mt-0.5">Wishlist</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate(API_ENDPOINTS.CART)}
                className="relative flex items-center gap-1 px-2 py-2 text-gray-600 transition-colors rounded-lg sm:gap-2 sm:px-3 hover:text-blue-900 hover:bg-gray-100 group"
              >
                <FiShoppingCart className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="hidden text-sm font-medium lg:block">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 lg:static lg:ml-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                data-menu-toggle
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 transition-colors rounded-lg lg:hidden hover:text-blue-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Collapsible */}
          {mobileSearchVisible && (
            <div className="pb-3 lg:hidden animate-fadeIn">
              <div className="relative flex items-center w-full overflow-hidden transition-all bg-white border-2 border-blue-900 rounded-lg focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 py-2.5 px-4 text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2.5 bg-blue-900 text-white hover:bg-blue-800 transition-colors"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ========== MOBILE MENU - 1/3 TO 1/4 SCREEN WIDTH, CONTENT-DRIVEN HEIGHT ========== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
            onClick={toggleMobileMenu} 
          />
          
          {/* Mobile drawer - exactly 1/3 to 1/4 width, height determined by content */}
          <div
            ref={mobileMenuRef}
            className="absolute top-0 right-0 bg-white shadow-2xl rounded-l-2xl
                       w-1/3 xs:w-1/3 sm:w-1/4
                       max-h-[90vh] overflow-y-auto m-2"
            style={{ height: 'auto' }}
          >
            {/* Header - Compact */}
            <div className="sticky top-0 p-3 text-white bg-gradient-to-r from-blue-900 to-cyan-800 rounded-tl-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 text-sm rounded-full bg-white/10 backdrop-blur">
                    {isLoggedIn ? (
                      <span className="font-bold">
                        {user?.name?.charAt(0) || <FiUser className="w-4 h-4" />}
                      </span>
                    ) : (
                      <FiUser className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-xs">
                    {isLoggedIn ? (
                      <>
                        <p className="font-semibold truncate max-w-[80px]">{user?.name?.split(" ")[0] || "User"}</p>
                        {!user?.isAccountVerified && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-300">
                            <MdWarning className="w-2.5 h-2.5" />
                            Verify
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">Welcome!</p>
                        <p className="text-[10px] text-white/80">Sign in</p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Sign In for non-logged in */}
              {!isLoggedIn && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      navigate(API_ENDPOINTS.LOGIN);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-2 py-1.5 bg-white text-blue-900 text-[10px] font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <FiLogIn className="w-3 h-3" />
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Verification Prompt */}
            {isLoggedIn && user && !user.isAccountVerified && (
              <div className="p-2 mx-2 mt-2 border rounded-lg bg-amber-50 border-amber-200">
                <div className="flex items-start gap-1.5">
                  <FiShield className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-amber-800">Verify email</p>
                    <button
                      onClick={() => {
                        handleSendVerification();
                        setMobileMenuOpen(false);
                      }}
                      disabled={verifyLoading}
                      className="w-full mt-1 px-2 py-1 text-[10px] font-medium text-white bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50"
                    >
                      {verifyLoading ? "Sending..." : "Verify Now"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full py-2 pr-2 text-xs bg-gray-100 border-0 rounded-lg pl-7 focus:ring-2 focus:ring-blue-900"
                />
                <FiSearch className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2 top-1/2" />
              </div>
            </div>

            {/* ===== SHOP NAVIGATION - WITH PROPER ENDPOINTS ===== */}
            <div className="p-2 border-b border-gray-100">
              <h3 className="flex items-center gap-1 mb-1 text-xs font-semibold text-gray-900">
                <FiShoppingCart className="w-3 h-3 text-blue-900" />
                Shop
              </h3>
              <div className="space-y-0.5">
                {/* Track Order - Proper Endpoint */}
                <button
                  onClick={() => {
                    navigate(API_ENDPOINTS.TRACK_ORDER);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full gap-2 px-2 py-1.5 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiTruck className="w-3 h-3 text-blue-900" />
                  <span className="flex-1 text-left">Track Order</span>
                  <FiChevronRight className="w-3 h-3 text-gray-400" />
                </button>
                
                {/* Sell on Kwetu Shop - Proper Endpoint */}
                <button
                  onClick={() => {
                    navigate(API_ENDPOINTS.SELL);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full gap-2 px-2 py-1.5 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BsTrophy className="w-3 h-3 text-blue-900" />
                  <span className="flex-1 text-left">Sell on Kwetu Shop</span>
                  <FiChevronRight className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="p-2 border-b border-gray-100">
              <h3 className="flex items-center gap-1 mb-2 text-xs font-semibold text-gray-900">
                <FiGrid className="w-3 h-3 text-blue-900" />
                Categories
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {categoriesLoading ? (
                  <div className="col-span-2 py-3 text-center text-gray-500 text-[10px]">Loading...</div>
                ) : (
                  categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.id || cat._id}
                      onClick={() => {
                        navigate(`/shop?category=${cat.slug || cat.id || cat._id}`);
                        setMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg mb-0.5 text-gray-600">
                        {cat.icon || "📱"}
                      </span>
                      <span className="text-[10px] font-medium text-gray-700 text-center truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => { 
                  navigate("/shop"); 
                  setMobileMenuOpen(false); 
                }}
                className="w-full mt-2 py-1 text-[10px] text-blue-600 font-medium text-center hover:text-blue-700"
              >
                View All Categories →
              </button>
            </div>

            {/* My Account */}
            <div className="p-2 border-b border-gray-100">
              <h3 className="flex items-center gap-1 mb-1 text-xs font-semibold text-gray-900">
                <FiUser className="w-3 h-3 text-blue-900" />
                Account
              </h3>
              <div className="space-y-0.5">
                {isLoggedIn ? (
                  <>
                    {userMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full gap-2 px-2 py-1.5 text-xs text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-500">{item.icon}</span>
                        <span className="flex-1 text-left">{item.label}</span>
                        <FiChevronRight className="w-3 h-3 text-gray-400" />
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full gap-2 px-2 py-1.5 mt-1 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FiLogOut className="w-3 h-3" />
                      <span className="flex-1 font-medium text-left">Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate(API_ENDPOINTS.LOGIN);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full gap-2 px-2 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FiLogIn className="w-3 h-3" />
                    <span className="flex-1 font-medium text-left">Sign In / Register</span>
                    <FiChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* ===== CONTACT/SUPPORT - WITH PROPER PHONE ENDPOINT ===== */}
            <div className="p-2">
              <div className="p-2 rounded-lg bg-gray-50">
                <h3 className="flex items-center gap-1 mb-2 text-xs font-semibold text-gray-900">
                  <FiHelpCircle className="w-3 h-3 text-blue-900" />
                  Support
                </h3>
                <div className="space-y-1.5">
                  {/* Phone - Proper href */}
                  <a 
                    href="tel:0700KWEƬU" 
                    className="flex items-center gap-1.5 text-[10px] text-gray-700 hover:text-blue-900 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPhone className="w-3 h-3 text-blue-900" />
                    <span className="font-medium">0700 KWEƬU</span>
                  </a>
                  {/* Email - Proper href */}
                  <a 
                    href="mailto:support@kwetushop.com" 
                    className="flex items-center gap-1.5 text-[10px] text-gray-700 hover:text-blue-900 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiMail className="w-3 h-3 text-blue-900" />
                    <span className="truncate">support@kwetushop.com</span>
                  </a>
                  {/* Help Center Link */}
                  <button
                    onClick={() => {
                      navigate(API_ENDPOINTS.HELP);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-[10px] text-gray-700 hover:text-blue-900 transition-colors w-full mt-1"
                  >
                    <FiHelpCircle className="w-3 h-3 text-blue-900" />
                    <span>Help Center</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer - Compact with dynamic current year */}
            <div className="sticky bottom-0 p-2 text-[8px] text-center text-gray-500 bg-white border-t border-gray-100">
              © {currentYear} KwetuShop
            </div>
          </div>
        </div>
      )}

      {/* ========== EMAIL VERIFICATION MODAL ========== */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl animate-slideUp">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-900 to-cyan-800">
                    <FiMail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Verify Your Email</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Enter the 6-digit code sent to</p>
                    <p className="text-sm font-semibold text-blue-900">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsVerifyModalOpen(false);
                    setVerifyOtp(["", "", "", "", "", ""]);
                  }}
                  className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleVerifyEmail}>
                <div
                  className="flex justify-center gap-2 mb-6 sm:gap-3"
                  onPaste={handleVerifyOtpPaste}
                >
                  {verifyOtp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerifyOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerifyOtpKeyDown(index, e)}
                      className="w-12 h-12 text-xl font-bold text-center text-gray-900 transition-all border-2 border-gray-200 outline-none sm:w-14 sm:h-14 sm:text-2xl rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                      disabled={verifyLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                    <FiClock className="w-4 h-4" />
                    <span>Code expires in <span className="font-semibold text-blue-900">10 minutes</span></span>
                  </div>
                  {resendTimer > 0 ? (
                    <span className="text-xs text-gray-500 sm:text-sm">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={verifyLoading}
                      className="text-xs font-medium text-blue-900 sm:text-sm hover:text-blue-700 hover:underline disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={verifyLoading || verifyOtp.join("").length !== 6}
                    className="flex-1 px-6 py-3 text-sm font-medium text-white transition-all shadow-lg bg-gradient-to-r from-blue-900 to-cyan-800 rounded-xl hover:from-blue-800 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                  >
                    {verifyLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FiClock className="w-4 h-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify Email"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyModalOpen(false);
                      setVerifyOtp(["", "", "", "", "", ""]);
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="flex items-start gap-2 p-3 mt-4 rounded-lg bg-blue-50">
                <FiShield className="w-4 h-4 text-blue-900 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900">
                  Never share your verification code. Our team will never ask for this code.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
        
        @media (max-width: 480px) {
          .xs\\:flex { display: flex; }
          .xs\\:hidden { display: none; }
          .xs\\:flex-none { flex: none; }
          .xs\\:items-center { align-items: center; }
          .xs\\:w-auto { width: auto; }
        }
      `}</style>
    </>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;