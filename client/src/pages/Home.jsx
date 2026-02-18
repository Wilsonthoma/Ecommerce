// src/pages/Home.jsx - WITH AOS 3D ANIMATIONS
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { clientProductService } from "../services/client/products";
import { toast } from "react-hot-toast";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronDown,
  FiTruck, 
  FiShield, 
  FiRefreshCw, 
  FiHeadphones,
  FiSmartphone,
  FiWatch,
  FiArrowRight,
  FiCheckCircle,
  FiPlay,
  FiPause,
  FiPackage,
  FiTrendingUp,
  FiStar,
  FiMapPin,
  FiSearch,
  FiBattery,
  FiZap,
  FiMusic,
  FiClock,
  FiUsers,
  FiGlobe,
  FiAward,
  FiThumbsUp,
  FiShoppingBag
} from "react-icons/fi";
import { 
  BsArrowRight,
  BsFire,
  BsLightningCharge,
  BsShieldCheck,
  BsTruck,
  BsArrowRepeat,
  BsHeadphones,
  BsStarFill,
  BsStarHalf,
  BsSmartwatch,
  BsPhone,
  BsBatteryCharging
} from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";
import { IoHeadsetOutline, IoWatchOutline, IoFlashOutline } from "react-icons/io5";
import { MdOutlineSecurity, MdOutlineLocalShipping } from "react-icons/md";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

// Category header images (relevant to each section) - TALLER height
const categoryHeaderImages = {
  trust: "https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1600",
  featured: "https://images.pexels.com/photos/5083408/pexels-photo-5083408.jpeg?auto=compress&cs=tinysrgb&w=1600",
  categories: "https://images.pexels.com/photos/3850213/pexels-photo-3850213.jpeg?auto=compress&cs=tinysrgb&w=1600",
  testimonials: "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1600",
  flashSale: "https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=1600"
};

// Category images for each category - UNIQUE images for each
const categoryImages = {
  audio: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600",
  powerbanks: "https://images.pexels.com/photos/8216516/pexels-photo-8216516.jpeg?auto=compress&cs=tinysrgb&w=600",
  wearables: "https://images.pexels.com/photos/4370372/pexels-photo-4370372.jpeg?auto=compress&cs=tinysrgb&w=600",
  "hair-clippers": "https://images.pexels.com/photos/3998410/pexels-photo-3998410.jpeg?auto=compress&cs=tinysrgb&w=600",
  smartphones: "https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=600",
  laptops: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
  tablets: "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600",
  accessories: "https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=600",
  electronics: "https://images.pexels.com/photos/5083408/pexels-photo-5083408.jpeg?auto=compress&cs=tinysrgb&w=600",
  gaming: "https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=600",
  cameras: "https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=600",
  headphones: "https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=600",
  speakers: "https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=600",
  monitors: "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=600",
  keyboards: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600",
  mice: "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=600"
};

// Font configuration - EXACTLY LIKE SCREENSHOT
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: normal;
  }
  
  .nav-link {
    font-weight: 500;
    font-size: 0.9rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  
  .section-title {
    font-weight: 800;
    font-size: 2.8rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin-bottom: 0;
  }
  
  .section-subtitle {
    font-weight: 500;
    font-size: 1.2rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .section-header-container {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .stat-number {
    font-weight: 700;
    font-size: 3.5rem;
    line-height: 1;
    color: white;
  }
  
  .stat-label {
    font-weight: 500;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9CA3AF;
  }
  
  .product-title {
    font-weight: 500;
    font-size: 0.9rem;
  }
  
  .product-price {
    font-weight: 500;
    font-size: 0.9rem;
    color: #9CA3AF;
  }
`;

// Beautiful gradient combinations for each section
const sectionGradients = {
  hero: "from-blue-600/20 via-purple-600/20 to-pink-600/20",
  trust: "from-emerald-600/20 via-teal-600/20 to-cyan-600/20",
  featured: "from-purple-600/20 via-pink-600/20 to-rose-600/20",
  categories: "from-amber-600/20 via-orange-600/20 to-red-600/20",
  testimonials: "from-indigo-600/20 via-blue-600/20 to-cyan-600/20",
  flashSale: "from-orange-600/20 via-red-600/20 to-pink-600/20"
};

// Animation styles
const animationStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  .shimmer {
    animation: shimmer 2s infinite;
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  }
  
  .glow-text:hover {
    text-shadow: 0 0 50px rgba(59, 130, 246, 0.8);
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .bg-fixed {
    background-attachment: fixed;
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  /* 3D Card Effects */
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d-content {
    transform: translateZ(20px);
  }
  
  @media (max-width: 768px) {
    .bg-fixed {
      background-attachment: scroll;
    }
  }
`;

// Top Bar Component (FIND STORE | SHOP ONLINE) - EXACTLY LIKE SCREENSHOT
const TopBar = () => (
  <div className="py-3 border-b border-gray-800 bg-black/90">
    <div className="flex items-center justify-end px-6 mx-auto space-x-6 max-w-7xl">
      <button 
        onClick={() => navigate('/stores')}
        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <FiMapPin className="w-4 h-4" />
        FIND STORE
      </button>
      <span className="text-gray-700">|</span>
      <button 
        onClick={() => navigate('/shop')}
        className="text-sm text-gray-400 transition-colors hover:text-white"
      >
        SHOP ONLINE
      </button>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AppContext);
  const { addToCart } = useCart();
  
  // Product states
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingFlashSale, setLoadingFlashSale] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  
  const categoryRef = useRef(null);
  const featuredRef = useRef(null);
  const videoRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");

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
    
    // Refresh AOS when content loads
    setTimeout(() => {
      AOS.refresh();
    }, 1000);
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await clientProductService.getProducts({ 
        limit: 20, 
        sort: '-createdAt' 
      });
      
      if (response.success) {
        console.log('✅ Products fetched:', response.products);
        setProducts(response.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Fetch featured products
  const fetchFeaturedProducts = async () => {
    try {
      setLoadingFeatured(true);
      const response = await clientProductService.getFeaturedProducts(8);
      
      if (response.success) {
        console.log('✅ Featured products fetched:', response.products);
        setFeaturedProducts(response.products || []);
      } else {
        // Fallback to regular products
        const fallbackResponse = await clientProductService.getProducts({ 
          limit: 8,
          featured: true 
        });
        if (fallbackResponse.success) {
          setFeaturedProducts(fallbackResponse.products || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    } finally {
      setLoadingFeatured(false);
    }
  };

  // Fetch latest products
  const fetchLatestProducts = async () => {
    try {
      setLoadingLatest(true);
      const response = await clientProductService.getProducts({ 
        limit: 8, 
        sort: '-createdAt' 
      });
      
      if (response.success) {
        console.log('✅ Latest products fetched:', response.products);
        setLatestProducts(response.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch latest products:", error);
    } finally {
      setLoadingLatest(false);
    }
  };

  // Fetch flash sale products
  const fetchFlashSaleProducts = async () => {
    try {
      setLoadingFlashSale(true);
      const response = await clientProductService.getProducts({ 
        hasDiscount: true, 
        limit: 10,
        sort: '-discountPercentage' 
      });
      
      if (response.success) {
        console.log('✅ Flash sale products fetched:', response.products);
        setFlashSaleProducts(response.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch flash sale products:", error);
    } finally {
      setLoadingFlashSale(false);
    }
  };

  // Fetch trending products
  const fetchTrendingProducts = async () => {
    try {
      setLoadingTrending(true);
      const response = await clientProductService.getTopSellingProducts(8);
      
      if (response.success) {
        console.log('✅ Trending products fetched:', response.products);
        setTrendingProducts(response.products || []);
      } else {
        // Fallback to regular products sorted by rating
        const fallbackResponse = await clientProductService.getProducts({ 
          limit: 8,
          sort: '-rating' 
        });
        if (fallbackResponse.success) {
          setTrendingProducts(fallbackResponse.products || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch trending products:", error);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await clientProductService.getCategories();
      
      if (response.success) {
        console.log('✅ Categories fetched from backend:', response.categories);
        setCategories(response.categories || []);
      } else {
        console.log('❌ No categories from backend');
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchFeaturedProducts(),
        fetchLatestProducts(),
        fetchFlashSaleProducts(),
        fetchTrendingProducts(),
        fetchCategories()
      ]);
      setLoading(false);
      
      // Refresh AOS after data loads
      setTimeout(() => {
        AOS.refresh();
      }, 500);
    };
    
    fetchAllData();
  }, []);

  // VIDEO AUTOPLAY
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    
    const playVideo = async () => {
      try {
        await video.play();
        setVideoPlaying(true);
        setVideoError(false);
        console.log("✅ Tech video playing");
      } catch (err) {
        console.log("❌ Video autoplay failed:", err);
        setVideoPlaying(false);
        setVideoError(true);
      }
    };

    playVideo();

    const handleError = () => {
      setVideoError(true);
      setVideoPlaying(false);
    };

    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('error', handleError);
      video.pause();
    };
  }, []);

  const toggleVideoPlay = () => {
    const video = videoRef.current;
    if (!video || videoError) return;

    if (videoPlaying) {
      video.pause();
      setVideoPlaying(false);
    } else {
      video.play()
        .then(() => setVideoPlaying(true))
        .catch(err => console.log("Video play failed:", err));
    }
  };

  const scrollCategories = (dir) => {
    if (categoryRef.current) {
      const scrollAmount = dir === "left" ? -400 : 400;
      categoryRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  const scrollFeatured = (dir) => {
    if (featuredRef.current) {
      const scrollAmount = dir === "left" ? -300 : 300;
      featuredRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, 1);
  };

  const handleImageError = (productId) => {
    console.log(`❌ Image error for product: ${productId}`);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const getProductImage = (product) => {
    if (imageErrors[product._id || product.id]) {
      return null; // Will trigger fallback in ProductCard
    }
    return product.images?.[0]?.url || product.image || null;
  };

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  // Get category image based on category name
  const getCategoryImage = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    
    if (name.includes('audio') || name.includes('earphone') || name.includes('headphone') || name.includes('headset')) {
      return categoryImages.headphones || categoryImages.audio;
    } else if (name.includes('power') || name.includes('battery') || name.includes('bank')) {
      return categoryImages.powerbanks;
    } else if (name.includes('watch') || name.includes('wearable') || name.includes('band')) {
      return categoryImages.wearables;
    } else if (name.includes('hair') || name.includes('clipper') || name.includes('trimmer')) {
      return categoryImages['hair-clippers'];
    } else if (name.includes('phone') || name.includes('smartphone') || name.includes('mobile')) {
      return categoryImages.smartphones;
    } else if (name.includes('laptop') || name.includes('computer') || name.includes('notebook')) {
      return categoryImages.laptops;
    } else if (name.includes('tablet') || name.includes('ipad')) {
      return categoryImages.tablets;
    } else if (name.includes('accessory') || name.includes('charger') || name.includes('cable') || name.includes('adapter')) {
      return categoryImages.accessories;
    } else if (name.includes('camera') || name.includes('photo') || name.includes('video')) {
      return categoryImages.cameras;
    } else if (name.includes('game') || name.includes('gaming') || name.includes('console')) {
      return categoryImages.gaming;
    } else if (name.includes('speaker') || name.includes('sound') || name.includes('audio')) {
      return categoryImages.speakers || categoryImages.audio;
    } else if (name.includes('monitor') || name.includes('display') || name.includes('screen')) {
      return categoryImages.monitors || categoryImages.electronics;
    } else if (name.includes('keyboard') || name.includes('type')) {
      return categoryImages.keyboards || categoryImages.accessories;
    } else if (name.includes('mouse') || name.includes('pointer')) {
      return categoryImages.mice || categoryImages.accessories;
    } else {
      return categoryImages.electronics;
    }
  };

  // Build categories from backend only - NO DEFAULT DATA
  const buildCategories = () => {
    // If we have categories from API, use them with appropriate images
    if (categories.length > 0) {
      return categories.map(cat => ({
        id: cat._id || cat.id,
        slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'),
        name: cat.name,
        image: getCategoryImage(cat.name),
        count: cat.productCount ? `${cat.productCount}+` : "0",
        link: `/shop?category=${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}`
      }));
    }
    
    // Return empty array if no categories from backend
    return [];
  };

  const displayCategories = buildCategories();

  // Trust stats
  const trustStats = [
    { number: "200", label: "MILLION+ USERS", icon: <FiUsers className="w-6 h-6" />, gradient: "from-blue-600 to-cyan-600" },
    { number: "60+", label: "COUNTRIES", icon: <FiGlobe className="w-6 h-6" />, gradient: "from-emerald-600 to-green-600" },
    { number: "365", label: "DAYS WARRANTY", icon: <FiAward className="w-6 h-6" />, gradient: "from-orange-600 to-red-600" },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Unbox Therapy",
      text: "OpenArc is the ultimate gym companion, from intense workouts to training sessions.",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5
    },
    {
      name: "Fisayo Fosudo",
      text: "Vocals and the instrumentals were very outstanding. Here I was impressed.",
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5
    },
    {
      name: "Chouaib Reviews",
      text: "The sound in music is impressive and the bass is very good and rich.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 4
    }
  ];

  // Log products for debugging
  useEffect(() => {
    console.log('📦 Current products state:', {
      products: products.length,
      featured: featuredProducts.length,
      latest: latestProducts.length,
      flashSale: flashSaleProducts.length,
      trending: trendingProducts.length,
      categories: categories.length,
      displayCategories: displayCategories.length
    });
  }, [products, featuredProducts, latestProducts, flashSaleProducts, trendingProducts, categories, displayCategories]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Inject font styles and animations */}
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      {/* Animated gradient overlay for entire page */}
      <div className="fixed inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none animate-gradient"></div>
      
      {/* Top Bar - FIND STORE | SHOP ONLINE */}
      <TopBar />

      {/* HERO SECTION - Fade In */}
      <div 
        className="relative h-screen min-h-[800px] overflow-hidden"
        data-aos="fade-in"
        data-aos-duration="1500"
        data-aos-delay="200"
      >
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            className="object-cover w-full h-full opacity-80"
            poster="https://images.pexels.com/photos/5083408/pexels-photo-5083408.jpeg?auto=compress&cs=tinysrgb&w=1600"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
          </video>
          
          <div className={`absolute inset-0 bg-gradient-to-r ${sectionGradients.hero} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        {!videoError && (
          <button
            onClick={toggleVideoPlay}
            className="absolute z-20 p-4 text-white transition-all rounded-full top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 hover:border-white/40"
          >
            {videoPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
          </button>
        )}

        <div className="relative z-10 flex items-center h-full">
          <div className="w-full px-6 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
              data-aos-delay="400"
            >
              <h1 className="text-6xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
                SpaceBuds
                <span className="block text-5xl md:text-6xl lg:text-7xl text-gray-300">Pro</span>
              </h1>
              
              <p className="mt-4 text-xl font-medium text-gray-300 md:text-2xl">
                50dB Adaptive Hybrid ANC
              </p>
              
              <p className="mt-2 text-lg text-gray-400">
                TWS Earphones with Immersive Sound
              </p>
              
              <div 
                className="flex flex-wrap gap-6 mt-8"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="600"
              >
                <button 
                  onClick={() => navigate('/product/spacebuds-pro')}
                  className="px-8 py-3 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors"
                >
                  EXPLORE NOW
                </button>
                <button 
                  onClick={() => navigate('/shop')}
                  className="px-8 py-3 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors"
                >
                  SHOP ALL
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -translate-x-1/2 left-1/2 bottom-8 animate-bounce">
          <div className="flex justify-center w-10 h-16 border-2 rounded-full border-white/20">
            <div className="w-1 h-3 mt-2 rounded-full bg-gradient-to-b from-blue-500 to-purple-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* TRUST STATS SECTION - 3D Flip Cards */}
      <section className="py-16 bg-black border-b border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          {/* Header Image with Zoom Effect */}
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <img 
              src={categoryHeaderImages.trust}
              alt="Trusted by millions"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <h2 className="section-title">TRUSTED BY MILLIONS</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24">
            {trustStats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center"
                data-aos="flip-left"
                data-aos-duration="1200"
                data-aos-delay={400 + (index * 150)}
              >
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION - Cards with staggered animations */}
      <section className="py-20 bg-black">
        <div className="px-6 mx-auto max-w-7xl">
          {/* Header Image with Zoom */}
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <img 
              src={categoryHeaderImages.featured}
              alt="Featured products"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <h2 className="section-title">FEATURED PRODUCTS</h2>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[1,2,3,4].map((i, index) => (
                <div 
                  key={i} 
                  className="h-80 bg-gray-900 rounded animate-pulse"
                  data-aos="fade-up"
                  data-aos-delay={300 + (index * 100)}
                ></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product, index) => {
                const productId = product._id || product.id;
                return (
                  <div 
                    key={productId} 
                    className="cursor-pointer group card-3d"
                    onClick={() => productId && handleProductClick(productId)}
                    data-aos="flip-up"
                    data-aos-duration="1000"
                    data-aos-delay={400 + (index * 150)}
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="card-3d-content">
                      <ProductCard product={product} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              No featured products available
            </div>
          )}
        </div>
      </section>

      {/* LATEST PRODUCTS SECTION - Fade Right Animations */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          {/* Header Image */}
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <img 
              src={categoryHeaderImages.featured}
              alt="Latest products"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <h2 className="section-title">JUST ARRIVED</h2>
          </div>

          {loadingLatest ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[1,2,3,4].map((i, index) => (
                <div 
                  key={i} 
                  className="h-80 bg-gray-900 rounded animate-pulse"
                  data-aos="fade-up"
                  data-aos-delay={300 + (index * 100)}
                ></div>
              ))}
            </div>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {latestProducts.slice(0, 4).map((product, index) => {
                const productId = product._id || product.id;
                return (
                  <div 
                    key={productId} 
                    className="cursor-pointer group card-3d"
                    onClick={() => productId && handleProductClick(productId)}
                    data-aos="fade-right"
                    data-aos-duration="1000"
                    data-aos-delay={400 + (index * 150)}
                  >
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              No latest products available
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES SECTION - 3D Rotating Cards */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          {/* Header Image */}
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <img 
              src={categoryHeaderImages.categories}
              alt="Shop by category"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <h2 className="section-title">SHOP BY CATEGORY</h2>
          </div>
          
          {loadingCategories ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[1,2,3,4].map((i, index) => (
                <div 
                  key={i} 
                  className="h-80 bg-gray-900 rounded animate-pulse"
                  data-aos="fade-up"
                  data-aos-delay={300 + (index * 100)}
                ></div>
              ))}
            </div>
          ) : displayCategories.length > 0 ? (
            <div className="relative">
              {/* Category Carousel - Larger cards for desktop (3 visible) */}
              <div 
                ref={categoryRef} 
                className="flex gap-8 pb-8 overflow-x-auto scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
              >
                {displayCategories.map((category, index) => (
                  <div 
                    key={category.id || index} 
                    className="flex-shrink-0 w-72 cursor-pointer group card-3d"
                    onClick={() => navigate(category.link)}
                    onMouseEnter={() => setHoveredCategory(index)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    data-aos="rotate-in-down-right"
                    data-aos-duration="1200"
                    data-aos-delay={400 + (index * 100)}
                  >
                    <div className="relative mb-3 overflow-hidden bg-gray-900 rounded-lg aspect-square">
                      {/* Glow Effect */}
                      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:opacity-30 blur-xl"></div>
                      
                      {/* Category Image */}
                      <img 
                        src={category.image}
                        alt={category.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      
                      {/* Category Name */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                        <p className="text-sm text-gray-300">{category.count} Products</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation Buttons */}
              {displayCategories.length > 3 && (
                <>
                  <button 
                    onClick={() => scrollCategories("left")}
                    className="absolute left-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group"
                    aria-label="Previous categories"
                  >
                    <FiChevronLeft className="w-6 h-6 text-white transition-colors group-hover:text-blue-500" />
                  </button>
                  <button 
                    onClick={() => scrollCategories("right")}
                    className="absolute right-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group"
                    aria-label="Next categories"
                  >
                    <FiChevronRight className="w-6 h-6 text-white transition-colors group-hover:text-blue-500" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              No categories available
            </div>
          )}
          
          {/* View All Categories Link */}
          {displayCategories.length > 0 && (
            <div 
              className="mt-8 text-center"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="800"
            >
              <button 
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors border border-gray-700 rounded-full hover:bg-white/10"
              >
                VIEW ALL CATEGORIES
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* TRENDING PRODUCTS SECTION - Slide In Left */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          {/* Header Image */}
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <img 
              src={categoryHeaderImages.featured}
              alt="Trending products"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <h2 className="section-title">TRENDING NOW</h2>
          </div>

          {loadingTrending ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[1,2,3,4].map((i, index) => (
                <div 
                  key={i} 
                  className="h-80 bg-gray-900 rounded animate-pulse"
                  data-aos="fade-up"
                  data-aos-delay={300 + (index * 100)}
                ></div>
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {trendingProducts.slice(0, 4).map((product, index) => {
                const productId = product._id || product.id;
                return (
                  <div 
                    key={productId} 
                    className="cursor-pointer group card-3d"
                    onClick={() => productId && handleProductClick(productId)}
                    data-aos="slide-left"
                    data-aos-duration="1000"
                    data-aos-delay={400 + (index * 150)}
                  >
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              No trending products available
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS SECTION - Fade Up with Delay */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          {/* Header Image */}
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <img 
              src={categoryHeaderImages.testimonials}
              alt="What people say about us"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <h2 className="section-title">HEAR WHAT THEY ARE SAYING</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="p-6 transition-transform duration-300 bg-gray-900/50 rounded-lg hover:scale-105"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay={400 + (index * 150)}
                data-aos-easing="ease-out-back"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        i < testimonial.rating ? 
                          <FaStar key={i} className="w-4 h-4 text-yellow-500" /> :
                          <FaRegStar key={i} className="w-4 h-4 text-gray-600" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLASH SALE SECTION - Zoom In Cards */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          {/* Header Image */}
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <img 
              src={categoryHeaderImages.flashSale}
              alt="Flash sale"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <h2 className="section-title">FLASH SALE</h2>
          </div>

          <div 
            className="flex flex-col items-center justify-between gap-8 mb-12 md:flex-row"
            data-aos="fade-left"
            data-aos-duration="1000"
            data-aos-delay="400"
          >
            <p className="text-2xl font-semibold text-gray-300">Limited time offers ending soon!</p>
            <button 
              onClick={() => navigate('/shop?sort=discount')}
              className="px-8 py-3 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors"
            >
              SHOP NOW
            </button>
          </div>

          <div className="relative">
            <div 
              ref={featuredRef} 
              className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {loadingFlashSale ? (
                [...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 w-48 bg-gray-900 rounded-lg h-80 animate-pulse"
                  ></div>
                ))
              ) : flashSaleProducts.length > 0 ? (
                flashSaleProducts.slice(0, 8).map((product, index) => {
                  const productId = product._id || product.id;
                  return (
                    <div 
                      key={`flash-${productId}`} 
                      className="flex-shrink-0 w-48 cursor-pointer group"
                      onClick={() => productId && handleProductClick(productId)}
                      data-aos="zoom-in-up"
                      data-aos-duration="1000"
                      data-aos-delay={500 + (index * 100)}
                    >
                      <ProductCard product={product} />
                    </div>
                  );
                })
              ) : (
                <div className="w-full py-12 text-center text-gray-400">
                  No flash sale products available
                </div>
              )}
            </div>
            
            {flashSaleProducts.length > 4 && (
              <>
                <button 
                  onClick={() => scrollFeatured("left")}
                  className="absolute left-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group"
                >
                  <FiChevronLeft className="w-6 h-6 text-white transition-colors group-hover:text-blue-500" />
                </button>
                <button 
                  onClick={() => scrollFeatured("right")}
                  className="absolute right-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group"
                >
                  <FiChevronRight className="w-6 h-6 text-white transition-colors group-hover:text-blue-500" />
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;