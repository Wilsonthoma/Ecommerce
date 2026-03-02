// src/pages/Deals.jsx - COMPLETE with Yellow-Orange Theme, LoadingSpinner, and Algorithm Tracking
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiPercent, 
  FiTag, 
  FiShoppingBag,
  FiChevronRight,
  FiZap,
  FiHome,
  FiMapPin,
  FiHeart,
  FiShoppingCart
} from 'react-icons/fi';
import { BsLightningCharge, BsArrowRight } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { clientProductService } from '../services/client/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner, { CardSkeleton, ContentLoader } from '../components/LoadingSpinner';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Font styles - Yellow-Orange theme
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .section-title-wrapper {
    position: relative;
    display: inline-block;
    padding: 2px;
    border-radius: 12px;
    background: linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B);
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-weight: 800;
    font-size: 2rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin: 0;
    padding: 0.5rem 2rem;
    background: #111827;
    border-radius: 10px;
    display: inline-block;
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 1.5rem;
      padding: 0.4rem 1.5rem;
    }
  }
  
  .deal-card {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.1);
    transition: all 0.3s ease;
  }
  
  .deal-card:hover {
    border-color: rgba(245, 158, 11, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.2);
  }
  
  .countdown-timer {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 0.5rem;
    padding: 0.25rem 0.5rem;
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
`;

// Animation styles
const animationStyles = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }
`;

// Gradient for header
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Header image
const dealsHeaderImage = "https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Top Bar Component
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-1.5 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          <FiMapPin className="w-3 h-3" />
          <span>FIND STORE</span>
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-1 text-xs font-bold">
      <span className="px-1.5 py-1 rounded bg-yellow-600 text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
      <span className="text-yellow-500">:</span>
      <span className="px-1.5 py-1 rounded bg-yellow-600 text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span className="text-yellow-500">:</span>
      <span className="px-1.5 py-1 rounded bg-yellow-600 text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  );
};

// Flash Sale Banner Component
const FlashSaleBanner = ({ deal, onViewAll }) => (
  <div className="relative overflow-hidden rounded-2xl deal-card" data-aos="fade-up">
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20"></div>
    <div className="relative p-6 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BsLightningCharge className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-500">FLASH SALE</span>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">{deal.title}</h2>
          <p className="mb-4 text-gray-400">{deal.description}</p>
          <div className="flex items-center gap-4">
            <CountdownTimer endDate={deal.endDate} />
            <span className="text-sm text-gray-400">ends in</span>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="px-6 py-3 text-sm font-medium text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
        >
          View All Deals
        </button>
      </div>
    </div>
  </div>
);

// Deal Category Component
const DealCategory = ({ icon: Icon, title, count, color }) => (
  <div className="p-4 cursor-pointer deal-card rounded-xl hover:border-yellow-500/50">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h3 className="text-sm font-semibold text-white">{title}</h3>
    <p className="text-xs text-gray-400">{count} deals</p>
  </div>
);

const Deals = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // States
  const [flashDeals, setFlashDeals] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);
  const [clearanceDeals, setClearanceDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Algorithm performance states (internal only)
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

  // Sample flash sale banner
  const flashSaleBanner = {
    title: "Flash Sale Extravaganza",
    description: "Up to 70% off on selected items. Limited time only!",
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  };

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

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    fetchDeals();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Generic fetch function with performance tracking
  const fetchWithTracking = async (fetchFn, sectionName) => {
    const startTime = performance.now();
    
    try {
      const response = await fetchFn();
      const endTime = performance.now();
      const loadTimeMs = (endTime - startTime).toFixed(0);
      const isCached = response?.cached || false;
      
      setLoadTime(loadTimeMs);
      setFromCache(isCached);
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
      }));
      
      console.log(`⚡ Deals ${sectionName} loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch ${sectionName}:`, error);
      return null;
    }
  };

  // Fetch deals
  const fetchDeals = async () => {
    try {
      setLoading(true);
      
      // Fetch flash sale products
      const flashResponse = await fetchWithTracking(
        () => clientProductService.getFlashSaleProducts(8),
        'flashSale'
      );
      
      if (flashResponse?.success) {
        setFlashDeals(flashResponse.products || []);
      }

      // Fetch daily deals (products with discount)
      const dailyResponse = await fetchWithTracking(
        () => clientProductService.getProducts({ 
          limit: 8, 
          sort: '-discountPercentage',
          minDiscount: 20
        }),
        'dailyDeals'
      );
      
      if (dailyResponse?.success) {
        setDailyDeals(dailyResponse.products || []);
      }

      // Fetch clearance deals (products with high discount)
      const clearanceResponse = await fetchWithTracking(
        () => clientProductService.getProducts({ 
          limit: 8, 
          sort: '-discountPercentage',
          minDiscount: 50
        }),
        'clearance'
      );
      
      if (clearanceResponse?.success) {
        setClearanceDeals(clearanceResponse.products || []);
      }

    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = (product) => {
    toggleWishlist(product);
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        <TopBar />

        {/* Header Image */}
        <div 
          className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={dealsHeaderImage}
              alt="Hot Deals"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="w-full px-4 mx-auto max-w-7xl">
              <div 
                className="max-w-2xl"
                data-aos="fade-right"
                data-aos-duration="1200"
              >
                <div className="section-title-wrapper">
                  <h1 className="section-title">HOT DEALS</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading amazing deals...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Cards */}
        <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
          <div className="h-40 mb-6 bg-gray-800 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <CardSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>

      <TopBar />

      {/* Header Image */}
      <div 
        className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={dealsHeaderImage}
            alt="Hot Deals"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
            >
              <div className="section-title-wrapper">
                <h1 className="section-title">HOT DEALS</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                Amazing discounts waiting for you
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-6 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Hot Deals</span>
        </nav>

        {/* Flash Sale Banner */}
        <FlashSaleBanner 
          deal={flashSaleBanner}
          onViewAll={() => navigate('/shop?onSale=true')}
        />

        {/* Deal Categories */}
        <div className="grid grid-cols-2 gap-3 my-8 sm:grid-cols-4">
          <DealCategory 
            icon={FiZap}
            title="Flash Sale"
            count="24"
            color="from-yellow-600 to-orange-600"
          />
          <DealCategory 
            icon={FiPercent}
            title="20-40% Off"
            count="56"
            color="from-green-600 to-emerald-600"
          />
          <DealCategory 
            icon={FiTag}
            title="Clearance"
            count="32"
            color="from-red-600 to-pink-600"
          />
          <DealCategory 
            icon={FiShoppingBag}
            title="Buy 1 Get 1"
            count="18"
            color="from-purple-600 to-indigo-600"
          />
        </div>

        {/* Flash Deals Section */}
        {flashDeals.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">⚡ Flash Deals</h2>
              <button 
                onClick={() => navigate('/shop?flashSale=true')}
                className="text-xs text-yellow-500 hover:text-yellow-400"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {flashDeals.slice(0, 4).map((product) => (
                <div key={product._id} className="relative">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Daily Deals Section */}
        {dailyDeals.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">🔥 Daily Deals</h2>
              <button 
                onClick={() => navigate('/shop?discount=20-40')}
                className="text-xs text-yellow-500 hover:text-yellow-400"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {dailyDeals.slice(0, 4).map((product) => (
                <div key={product._id} className="relative">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clearance Section */}
        {clearanceDeals.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">🏷️ Clearance Sale</h2>
              <button 
                onClick={() => navigate('/shop?discount=50+')}
                className="text-xs text-yellow-500 hover:text-yellow-400"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {clearanceDeals.slice(0, 4).map((product) => (
                <div key={product._id} className="relative">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter Signup */}
        <div className="p-6 mt-8 text-center rounded-2xl deal-card">
          <h3 className="mb-2 text-lg font-bold text-white">Don't Miss Out!</h3>
          <p className="mb-4 text-sm text-gray-400">Subscribe to get notifications about new deals</p>
          <div className="flex max-w-md gap-2 mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 text-sm text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
            />
            <button className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deals;