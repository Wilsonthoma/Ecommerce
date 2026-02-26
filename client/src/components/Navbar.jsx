// src/components/Navbar.jsx - COMPLETE FIXED & OPTIMIZED VERSION
import React, { useContext, useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import clientApi from "../services/client/api"; // ✅ Use clientApi instead of axios
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
  FiClock,
  FiTruck,
  FiSettings,
  FiCreditCard,
  FiMap,
  FiAward,
} from "react-icons/fi";
import { 
  BsLightningCharge,
  BsArrowRight,
  BsGraphUp,
} from "react-icons/bs";
import { MdVerified, MdWarning } from "react-icons/md";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";

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
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADDRESS_BOOK: '/address-book',
  PAYMENT_METHODS: '/payment-methods',
};

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Animation styles as constants
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
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
  
  .glow-text {
    text-shadow: 0 0 20px currentColor;
  }
`;

// Category icons mapping
const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  if (name.includes('smartphone') || name.includes('phone') || name.includes('mobile')) return "📱";
  if (name.includes('laptop') || name.includes('computer') || name.includes('notebook')) return "💻";
  if (name.includes('audio') || name.includes('headphone') || name.includes('earphone')) return "🎧";
  if (name.includes('camera') || name.includes('photo') || name.includes('video')) return "📷";
  if (name.includes('wearable') || name.includes('watch') || name.includes('fitness')) return "⌚";
  if (name.includes('tablet') || name.includes('ipad')) return "📱";
  if (name.includes('accessory') || name.includes('charger') || name.includes('case')) return "🔌";
  if (name.includes('gaming') || name.includes('game') || name.includes('console')) return "🎮";
  return "📦";
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

  // ==================== STATE ====================
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  
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

  // ==================== GET FULL IMAGE URL ====================
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
    return `${API_URL}/uploads/${imagePath}`;
  };

  // ==================== FETCH CATEGORIES FROM BACKEND ====================
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      // ✅ Use clientApi instead of axios
      const response = await clientApi.get('/categories');
      
      // Handle different response structures
      let categoriesData = [];
      if (response.data && response.data.success && response.data.categories) {
        categoriesData = response.data.categories;
      } else if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      }
      
      // Format categories for display
      const formattedCategories = categoriesData.map(cat => ({
        id: cat._id || cat.id,
        slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'),
        name: cat.name,
        count: cat.count || cat.productCount || 0,
        icon: getCategoryIcon(cat.name)
      }));
      
      setCategories(formattedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error.message);
      // Fallback categories if API fails
      setCategories([
        { id: "1", slug: "smartphones", name: "Smartphones", count: 245, icon: "📱" },
        { id: "2", slug: "laptops", name: "Laptops", count: 189, icon: "💻" },
        { id: "3", slug: "audio", name: "Audio", count: 320, icon: "🎧" },
        { id: "4", slug: "cameras", name: "Cameras", count: 98, icon: "📷" },
        { id: "5", slug: "wearables", name: "Wearables", count: 156, icon: "⌚" },
        { id: "6", slug: "tablets", name: "Tablets", count: 112, icon: "📱" },
        { id: "7", slug: "accessories", name: "Accessories", count: 432, icon: "🔌" },
        { id: "8", slug: "gaming", name: "Gaming", count: 87, icon: "🎮" },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      const response = await clientApi.post('/auth/send-verify-otp', {});
      
      if (response.data.success) {
        toast.success("📧 Verification code sent!");
        setIsVerifyModalOpen(true);
        setResendTimer(60);
        if (process.env.NODE_ENV === 'development' && response.data.otp) {
          console.log("🔐 [DEV] OTP:", response.data.otp);
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
  }, [navigate]);

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
      otpInputRefs.current[0]?.focus();
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

  // ==================== MEMOIZED MENU ITEMS ====================
  const userMenuItems = useMemo(() => [
    { label: "Dashboard", path: API_ENDPOINTS.DASHBOARD, icon: <FiHome className="w-4 h-4" /> },
    { label: "My Orders", path: API_ENDPOINTS.ORDERS, icon: <FiPackage className="w-4 h-4" />, badge: 0 },
    { label: "Wishlist", path: API_ENDPOINTS.WISHLIST, icon: <FiHeart className="w-4 h-4" />, badge: wishlistCount },
    { label: "Settings", path: API_ENDPOINTS.SETTINGS, icon: <FiSettings className="w-4 h-4" /> },
  ], [wishlistCount]);

  // ==================== RENDER ====================
  return (
    <>
      <style>{animationStyles}</style>
      
      {/* ========== STATIC TOP BAR WITH ALL QUICK LINKS ========== */}
      <div className="relative border-b border-gray-800 bg-gradient-to-r from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent"></div>
        <div className="relative px-3 mx-auto max-w-7xl sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-9 sm:h-10 text-[11px] sm:text-xs">
            {/* LEFT SIDE - Quick Links */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={() => navigate(API_ENDPOINTS.TRACK_ORDER)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all group"
              >
                <FiTruck className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
                <span className="hidden xs:inline group-hover:glow-text">Track Order</span>
                <span className="xs:hidden">Track</span>
              </button>
              
              <button 
                onClick={() => navigate(API_ENDPOINTS.DEALS)}
                className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white transition-all group"
              >
                <BsLightningCharge className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
                <span className="group-hover:glow-text">Hot Deals</span>
              </button>

              <button 
                onClick={() => navigate(API_ENDPOINTS.HELP)}
                className="hidden md:flex items-center gap-1.5 text-gray-400 hover:text-white transition-all group"
              >
                <FiHelpCircle className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
                <span className="group-hover:glow-text">Help Center</span>
              </button>
            </div>

            {/* RIGHT SIDE - Contact & Social */}
            <div className="flex items-center gap-3 sm:gap-5">
              <a 
                href="tel:0700KWEƬU" 
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-all group"
              >
                <FiPhone className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
                <span className="hidden sm:inline group-hover:glow-text">0700 KWEƬU</span>
                <span className="sm:hidden">Support</span>
              </a>
              
              {/* Social Links */}
              <div className="items-center hidden gap-3 lg:flex">
                <a href="#" className="text-gray-400 hover:text-white transition-all p-1.5 rounded-full hover:bg-white/10"><FaFacebookF className="w-3.5 h-3.5" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-all p-1.5 rounded-full hover:bg-white/10"><FaTwitter className="w-3.5 h-3.5" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-all p-1.5 rounded-full hover:bg-white/10"><FaInstagram className="w-3.5 h-3.5" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-all p-1.5 rounded-full hover:bg-white/10"><FaYoutube className="w-3.5 h-3.5" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== EMAIL VERIFICATION BANNER ========== */}
      {isLoggedIn && user && !user.isAccountVerified && showVerificationBanner && (
        <div className="relative border-b border-indigo-500/20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent"></div>
          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
            <div className="flex flex-col items-start justify-between gap-2 xs:flex-row xs:items-center xs:gap-3">
              <div className="flex items-start w-full gap-2 xs:items-center sm:gap-3 xs:w-auto">
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 border rounded-full sm:w-7 sm:h-7 bg-indigo-600/20 border-indigo-500/30">
                  <IoFlashOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                </div>
                <div className="flex-1 text-xs xs:flex-none sm:text-sm">
                  <span className="font-medium text-indigo-500 glow-text">Verify your email</span>
                  <span className="hidden sm:inline text-gray-400 ml-1.5">
                    to unlock all features
                  </span>
                </div>
              </div>
              <div className="flex items-center w-full gap-2 xs:w-auto">
                <button
                  onClick={handleSendVerification}
                  disabled={verifyLoading}
                  className="group relative flex-1 xs:flex-none px-3 sm:px-4 py-1.5 text-xs font-medium text-white transition-all rounded-full overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-50 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center justify-center gap-1.5">
                    {verifyLoading ? (
                      <>
                        <FiClock className="w-3 h-3 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <BsLightningCharge className="w-3 h-3" />
                        <span>Verify Now</span>
                      </>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => setShowVerificationBanner(false)}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== STICKY MAIN NAVBAR ========== */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent"></div>
        <div className="relative px-3 mx-auto max-w-7xl sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo */}
            <div 
              onClick={() => navigate("/")} 
              className="flex items-center flex-shrink-0 cursor-pointer group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/")}
            >
              <div className="relative">
                <div className="absolute transition-opacity duration-500 rounded-full opacity-0 -inset-2 bg-gradient-to-r from-indigo-600 to-blue-600 group-hover:opacity-30 blur-xl"></div>
                <img 
                  src={assets.logo} 
                  alt="KwetuShop" 
                  className="relative w-auto h-8 transition-transform sm:h-9 lg:h-10 group-hover:scale-105" 
                />
              </div>
            </div>

            {/* Desktop Search Bar with Categories Dropdown */}
            <div className="flex-1 hidden max-w-3xl mx-6 lg:flex">
              <div className="group relative flex items-center w-full overflow-hidden rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all duration-300">
                {/* Categories Dropdown */}
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    onClick={toggleCategoryDropdown}
                    className="flex items-center gap-1.5 h-full px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 border-r border-gray-700 transition-all whitespace-nowrap"
                  >
                    <FiGrid className="w-4 h-4 text-indigo-500" />
                    <span className="hidden xl:inline">Categories</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
                  </button>

                  {/* Categories Dropdown Menu */}
                  {categoryDropdownOpen && (
                    <div className="absolute left-0 z-50 py-4 mt-2 border border-gray-800 shadow-2xl bg-gradient-to-br from-gray-900 to-black top-full w-80 rounded-2xl animate-fadeIn backdrop-blur-lg">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl opacity-20 blur-xl"></div>
                      <div className="relative px-4 py-2 border-b border-gray-800">
                        <h3 className="font-semibold text-white">Shop by Category</h3>
                      </div>
                      <div className="relative grid grid-cols-2 gap-2 p-3 overflow-y-auto max-h-96 custom-scrollbar">
                        {categoriesLoading ? (
                          <div className="col-span-2 py-8 text-center text-gray-500">
                            <div className="inline-block w-6 h-6 border-2 border-t-2 border-gray-600 rounded-full border-t-indigo-500 animate-spin"></div>
                            <p className="mt-2 text-xs">Loading categories...</p>
                          </div>
                        ) : categories.length > 0 ? (
                          categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                navigate(`/shop?category=${cat.slug || cat.id}`);
                                setCategoryDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 p-2 transition-all rounded-lg hover:bg-white/5 group"
                            >
                              <span className="text-xl text-gray-400 transition-colors group-hover:text-indigo-500">
                                {cat.icon}
                              </span>
                              <div className="flex-1 text-left">
                                <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                                  {cat.name}
                                </span>
                                {cat.count > 0 && (
                                  <span className="block text-xs text-gray-500">
                                    {cat.count.toLocaleString()}+ items
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="col-span-2 py-8 text-center text-gray-500">
                            <p className="text-sm">No categories found</p>
                          </div>
                        )}
                      </div>
                      <div className="relative px-3 pt-2 border-t border-gray-800">
                        <button
                          onClick={() => { navigate("/shop"); setCategoryDropdownOpen(false); }}
                          className="flex items-center justify-center w-full gap-1 py-2 text-sm font-medium text-center text-indigo-500 transition-colors hover:text-indigo-400 group"
                        >
                          View All Categories
                          <BsArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                  className="flex-1 py-2.5 px-4 text-gray-300 placeholder-gray-600 bg-transparent focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="group relative px-6 py-2.5 text-white font-medium transition-all overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-2">
                    <FiSearch className="w-5 h-5" />
                    <span className="hidden xl:inline">Search</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              {/* Mobile Search Button */}
              <button
                onClick={toggleMobileSearch}
                className="p-2 text-gray-400 transition-all rounded-full lg:hidden hover:text-white hover:bg-white/10"
              >
                <FiSearch className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* WISHLIST - Conditional based on login */}
              {isLoggedIn ? (
                <button
                  onClick={() => navigate(API_ENDPOINTS.WISHLIST)}
                  className="relative flex-col items-center hidden p-2 text-gray-400 transition-all rounded-full sm:flex hover:text-white hover:bg-white/10 group"
                >
                  <div className="relative">
                    <FiHeart className="w-5 h-5 transition-transform sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:scale-110" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1rem] h-4 px-1 text-[8px] font-bold text-white bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block text-xs mt-0.5 group-hover:glow-text">Wishlist</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(API_ENDPOINTS.LOGIN)}
                  className="relative flex-col items-center hidden p-2 text-gray-400 transition-all rounded-full sm:flex hover:text-white hover:bg-white/10 group"
                  title="Login to use wishlist"
                >
                  <FiHeart className="w-5 h-5 transition-transform sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:scale-110" />
                  <span className="hidden lg:block text-xs mt-0.5 group-hover:glow-text">Wishlist</span>
                </button>
              )}

              {/* CART - Always visible */}
              <button
                onClick={() => navigate(API_ENDPOINTS.CART)}
                className="relative flex items-center gap-1 px-2 py-2 text-gray-400 transition-all rounded-full group sm:gap-2 sm:px-3 hover:text-white hover:bg-white/10"
              >
                <div className="relative">
                  <FiShoppingCart className="w-5 h-5 transition-transform sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:scale-110" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden text-sm font-medium lg:block group-hover:glow-text">Cart</span>
              </button>

              {/* USER ACCOUNT - Combined login/register button */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={toggleAccountDropdown}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-gray-400 rounded-full hover:text-white hover:bg-white/10 transition-all group"
                >
                  <div className="relative">
                    {isLoggedIn && user?.avatar && !avatarError ? (
                      <img
                        src={getFullImageUrl(user.avatar)}
                        alt={user.name}
                        className="object-cover w-5 h-5 rounded-full sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <FiUser className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    )}
                    {isLoggedIn && user && !user.isAccountVerified && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-gray-900 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <span className="hidden text-sm font-medium lg:inline group-hover:glow-text">
                    {isLoggedIn ? (user?.name?.split(" ")[0] || "Account") : "Account"}
                  </span>
                  <FiChevronDown className={`hidden lg:block w-4 h-4 transition-transform ${accountDropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
                </button>

                {/* Account Dropdown */}
                {accountDropdownOpen && (
                  <div className="absolute right-0 z-50 w-64 py-2 mt-2 border border-gray-800 shadow-2xl bg-gradient-to-br from-gray-900 to-black top-full rounded-2xl animate-fadeIn backdrop-blur-lg">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl opacity-20 blur-xl"></div>
                    
                    <div className="relative">
                      {isLoggedIn ? (
                        <>
                          {/* Logged In User View */}
                          <div className="px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {user?.avatar && !avatarError ? (
                                  <img
                                    src={getFullImageUrl(user.avatar)}
                                    alt={user.name}
                                    className="object-cover w-10 h-10 rounded-full"
                                    onError={() => setAvatarError(true)}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-r from-indigo-600 to-blue-600">
                                    {user?.name?.charAt(0) || <FiUser className="w-5 h-5" />}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                {user?.isAccountVerified ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-green-500 mt-0.5">
                                    <MdVerified className="w-3 h-3" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-indigo-500 mt-0.5">
                                    <MdWarning className="w-3 h-3" />
                                    Not Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Verification Prompt */}
                          {!user.isAccountVerified && (
                            <div className="p-3 mx-3 my-2 border rounded-xl bg-indigo-600/10 border-indigo-600/20">
                              <div className="flex items-start gap-2">
                                <FiShield className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-indigo-500">Verify your email</p>
                                  <p className="text-xs text-gray-400 mt-0.5 mb-2">
                                    Unlock all features
                                  </p>
                                  <button
                                    onClick={() => {
                                      handleSendVerification();
                                      setAccountDropdownOpen(false);
                                    }}
                                    disabled={verifyLoading}
                                    className="group relative w-full px-3 py-1.5 text-xs font-medium text-white transition-all rounded-full overflow-hidden"
                                  >
                                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                                    <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                                    <span className="relative">
                                      {verifyLoading ? "Sending..." : "Verify Now"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Account Menu Items */}
                          <div className="py-1">
                            {userMenuItems.map((item) => (
                              <button
                                key={item.label}
                                onClick={() => {
                                  navigate(item.path);
                                  setAccountDropdownOpen(false);
                                }}
                                className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
                              >
                                <span className="text-gray-500 transition-colors group-hover:text-indigo-500">{item.icon}</span>
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge > 0 && (
                                  <span className="px-1.5 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                    {item.badge}
                                  </span>
                                )}
                                <FiChevronRight className="w-4 h-4 text-gray-600 transition-colors group-hover:text-indigo-500" />
                              </button>
                            ))}
                          </div>

                          {/* Logout */}
                          <div className="pt-1 mt-1 border-t border-gray-800">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <FiLogOut className="w-4 h-4" />
                              <span className="flex-1 text-left">Logout</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Not Logged In View */
                        <div className="p-4">
                          <div className="mb-4 text-center">
                            <p className="text-sm font-medium text-white">Welcome to KwetuShop!</p>
                            <p className="mt-1 text-xs text-gray-400">Sign in to access your account</p>
                          </div>
                          
                          {/* Single Combined Login Button */}
                          <button
                            onClick={() => {
                              navigate(API_ENDPOINTS.LOGIN);
                              setAccountDropdownOpen(false);
                            }}
                            className="relative w-full px-4 py-3 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                            <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                            <span className="relative flex items-center justify-center gap-2">
                              <FiLogIn className="w-4 h-4" />
                              Sign In / Register
                            </span>
                          </button>
                          
                          <p className="mt-3 text-xs text-center text-gray-500">
                            New here? Sign in to create an account
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                data-menu-toggle
                onClick={toggleMobileMenu}
                className="p-2 text-gray-400 transition-all rounded-full lg:hidden hover:text-white hover:bg-white/10"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {mobileSearchVisible && (
            <div className="pb-3 lg:hidden animate-fadeIn">
              <div className="group relative flex items-center w-full overflow-hidden rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all">
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
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative">
                    <FiSearch className="w-5 h-5" />
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ========== OPTIMIZED MOBILE MENU ========== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md" 
            onClick={toggleMobileMenu} 
          />
          
          {/* Mobile drawer */}
          <div
            ref={mobileMenuRef}
            className="absolute top-0 right-0 bg-gradient-to-b from-gray-900 to-black shadow-2xl rounded-l-2xl border-l border-gray-800
                       w-64 max-w-[80vw] h-full overflow-y-auto"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-l-2xl opacity-20 blur-xl"></div>
            
            <div className="relative">
              {/* Header */}
              <div className="sticky top-0 p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-tl-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {isLoggedIn && user?.avatar && !avatarError ? (
                        <img
                          src={getFullImageUrl(user.avatar)}
                          alt={user.name}
                          className="object-cover w-10 h-10 rounded-full"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 text-sm rounded-full bg-gradient-to-r from-indigo-600 to-blue-600">
                          {isLoggedIn ? (
                            <span className="font-bold text-white">
                              {user?.name?.charAt(0) || <FiUser className="w-5 h-5" />}
                            </span>
                          ) : (
                            <FiUser className="w-5 h-5 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      {isLoggedIn ? (
                        <>
                          <p className="font-semibold text-white">{user?.name?.split(" ")[0] || "User"}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[120px]">{user?.email}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-white">Welcome!</p>
                          <p className="text-xs text-gray-400">Sign in for faster checkout</p>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Sign In for non-logged-in users */}
                {!isLoggedIn && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        navigate(API_ENDPOINTS.LOGIN);
                        setMobileMenuOpen(false);
                      }}
                      className="relative w-full px-3 py-2 overflow-hidden text-xs font-medium text-white transition-all rounded-full group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                      <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        <FiLogIn className="w-4 h-4" />
                        Sign In / Register
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Search */}
              <div className="p-3 border-b border-gray-800">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full py-2 pr-3 text-sm text-gray-300 border border-gray-700 rounded-lg bg-gray-800/50 pl-9 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  />
                  <FiSearch className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                </div>
              </div>

              {/* Mobile Quick Links - SIMPLIFIED */}
              <div className="p-3 border-b border-gray-800">
                <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                  <FiTruck className="w-4 h-4 text-indigo-500" />
                  Quick Links
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      navigate(API_ENDPOINTS.TRACK_ORDER);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 group"
                  >
                    <FiTruck className="w-4 h-4 transition-colors group-hover:text-indigo-500" />
                    <span className="flex-1 text-left">Track Order</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate(API_ENDPOINTS.DEALS);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 group"
                  >
                    <BsLightningCharge className="w-4 h-4 transition-colors group-hover:text-indigo-500" />
                    <span className="flex-1 text-left">Hot Deals</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate(API_ENDPOINTS.HELP);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 group"
                  >
                    <FiHelpCircle className="w-4 h-4 transition-colors group-hover:text-indigo-500" />
                    <span className="flex-1 text-left">Help Center</span>
                  </button>
                </div>
              </div>

              {/* Account Section for Logged In Users - SIMPLIFIED */}
              {isLoggedIn && (
                <div className="p-3 border-b border-gray-800">
                  <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                    <FiUser className="w-4 h-4 text-indigo-500" />
                    My Account
                  </h3>
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 group"
                      >
                        <span className="text-gray-500 transition-colors group-hover:text-indigo-500">{item.icon}</span>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium text-white bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shop Section - SIMPLIFIED */}
              <div className="p-3 border-b border-gray-800">
                <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                  <FiShoppingCart className="w-4 h-4 text-indigo-500" />
                  Shop
                </h3>
                <div className="space-y-1">
                  {/* Wishlist */}
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        navigate(API_ENDPOINTS.WISHLIST);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 group"
                    >
                      <div className="relative">
                        <FiHeart className="w-4 h-4 transition-colors group-hover:text-indigo-500" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1rem] h-4 px-1 text-[8px] font-bold text-white bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            {wishlistCount > 9 ? '9+' : wishlistCount}
                          </span>
                        )}
                      </div>
                      <span className="flex-1 text-left">My Wishlist</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        navigate(API_ENDPOINTS.LOGIN);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 group"
                    >
                      <FiHeart className="w-4 h-4 transition-colors group-hover:text-indigo-500" />
                      <span className="flex-1 text-left">Wishlist</span>
                    </button>
                  )}

                  {/* Cart */}
                  <button
                    onClick={() => {
                      navigate(API_ENDPOINTS.CART);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 group"
                  >
                    <div className="relative">
                      <FiShoppingCart className="w-4 h-4 transition-colors group-hover:text-indigo-500" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1rem] h-4 px-1 text-[8px] font-bold text-white bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </div>
                    <span className="flex-1 text-left">Cart</span>
                  </button>
                </div>
              </div>

              {/* Categories - SIMPLIFIED (show only top 4) */}
              <div className="p-3 border-b border-gray-800">
                <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                  <FiGrid className="w-4 h-4 text-indigo-500" />
                  Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categoriesLoading ? (
                    <div className="col-span-2 py-4 text-center text-gray-500">Loading...</div>
                  ) : (
                    categories.slice(0, 4).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          navigate(`/shop?category=${cat.slug || cat.id}`);
                          setMobileMenuOpen(false);
                        }}
                        className="flex flex-col items-center p-2 transition-all rounded-lg bg-gray-800/50 hover:bg-white/5 group"
                      >
                        <span className="mb-1 text-xl text-gray-400 transition-colors group-hover:text-indigo-500">
                          {cat.icon}
                        </span>
                        <span className="w-full text-xs font-medium text-center text-gray-400 truncate group-hover:text-white">
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
                  className="flex items-center justify-center w-full gap-1 py-2 mt-3 text-xs font-medium text-center text-indigo-500 transition-colors hover:text-indigo-400 group"
                >
                  View All
                  <BsArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Support - SIMPLIFIED */}
              <div className="p-3">
                <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                  <FiPhone className="w-4 h-4 text-indigo-500" />
                  Support
                </h3>
                <div className="space-y-2">
                  <a 
                    href="tel:0700KWEƬU" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/5 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPhone className="w-4 h-4 transition-colors group-hover:text-indigo-500" />
                    <span className="font-medium">0700 KWEƬU</span>
                  </a>
                  <a 
                    href="mailto:support@kwetushop.com" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/5 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiMail className="w-4 h-4 transition-colors group-hover:text-indigo-500" />
                    <span className="truncate">support@kwetushop.com</span>
                  </a>
                </div>
              </div>

              {/* Logout Button for Logged In Users */}
              {isLoggedIn && (
                <div className="sticky bottom-0 p-3 bg-gray-900 border-t border-gray-800">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-3 py-2 text-sm text-red-500 transition-all rounded-lg hover:text-red-400 hover:bg-red-500/10"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="flex-1 text-left">Logout</span>
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="sticky bottom-0 p-3 text-xs text-center text-gray-500 bg-gray-900 border-t border-gray-800">
                © {currentYear} KwetuShop
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== EMAIL VERIFICATION MODAL ========== */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md animate-slideUp">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl opacity-30 blur-xl"></div>
            <div className="relative border border-gray-800 shadow-2xl bg-gradient-to-b from-gray-900 to-black rounded-2xl">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600">
                        <FiMail className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full opacity-50 blur"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Verify Your Email</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Enter the 6-digit code sent to</p>
                      <p className="text-sm font-semibold text-indigo-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsVerifyModalOpen(false);
                      setVerifyOtp(["", "", "", "", "", ""]);
                    }}
                    className="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10"
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
                        className="w-12 h-12 text-xl font-bold text-center text-white transition-all bg-gray-800 border-2 border-gray-700 outline-none sm:w-14 sm:h-14 sm:text-2xl rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={verifyLoading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400">
                      <FiClock className="w-4 h-4" />
                      <span>Code expires in <span className="font-semibold text-indigo-500">10 minutes</span></span>
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
                        className="text-xs font-medium text-indigo-500 sm:text-sm hover:text-indigo-400 hover:underline disabled:opacity-50"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={verifyLoading || verifyOtp.join("").length !== 6}
                      className="relative flex-1 px-6 py-3 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
                      <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        {verifyLoading ? (
                          <>
                            <FiClock className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify Email"
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVerifyModalOpen(false);
                        setVerifyOtp(["", "", "", "", "", ""]);
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-300 transition-colors bg-gray-800 rounded-full hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                <div className="flex items-start gap-2 p-3 mt-4 border rounded-xl bg-indigo-600/10 border-indigo-600/20">
                  <FiShield className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-400">
                    Never share your verification code. Our team will never ask for this code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.5);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.8);
        }
      `}</style>
    </>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;