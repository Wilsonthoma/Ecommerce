// src/pages/Home.jsx - FIXED with all icon imports
import React, { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { clientProductService } from "../services/client/products";
import { toast } from "react-hot-toast";
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
  FiShoppingBag // ✅ ADD THIS MISSING IMPORT
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
  BsBatteryCharging,
  BsGithub
} from "react-icons/bs";
import { AiFillFire, AiOutlineThunderbolt } from "react-icons/ai";
import { IoHeadsetOutline, IoWatchOutline, IoBatteryChargingOutline, IoFlashOutline } from "react-icons/io5";
import { MdOutlineSecurity, MdOutlineLocalShipping } from "react-icons/md";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const Home = () => {
  const { user, isAuthenticated } = useContext(AppContext);
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const categoryRef = useRef(null);
  const featuredRef = useRef(null);
  const videoRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch real products from API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all products with proper endpoints
      const productsResponse = await clientProductService.getProducts({ 
        limit: 20, 
        sort: '-createdAt' 
      });
      
      // Fetch categories
      const categoriesResponse = await clientProductService.getCategories();
      
      // Fetch flash sale products (with discounts)
      let flashSaleData = [];
      try {
        const discountedResponse = await clientProductService.getProducts({ 
          hasDiscount: true, 
          limit: 10,
          sort: '-discountPercentage' 
        });
        
        if (discountedResponse.success && discountedResponse.products?.length > 0) {
          flashSaleData = discountedResponse.products;
        } else if (productsResponse.success && productsResponse.products) {
          // Fallback: filter from regular products
          flashSaleData = productsResponse.products
            .filter(p => p.discountPrice && p.discountPrice < p.price)
            .slice(0, 10);
        }
      } catch (error) {
        console.log("Using fallback for flash sale products");
        if (productsResponse.success && productsResponse.products) {
          flashSaleData = productsResponse.products
            .filter(p => p.discountPrice && p.discountPrice < p.price)
            .slice(0, 10);
        }
      }

      // Process products response
      if (productsResponse.success) {
        const productsData = productsResponse.data?.products || productsResponse.products || [];
        setProducts(productsData);
        setTrendingProducts(productsData.slice(0, 10));
      }

      // Process categories response
      if (categoriesResponse.success) {
        const categoriesData = categoriesResponse.data?.categories || categoriesResponse.categories || [];
        setCategories(categoriesData);
      }

      // Set flash sale products
      setFlashSaleProducts(flashSaleData.map(p => ({ ...p, section: 'flash' })));
      
      // Fetch featured products separately
      try {
        const featuredResponse = await clientProductService.getFeaturedProducts();
        if (featuredResponse.success) {
          const featuredData = featuredResponse.data?.products || featuredResponse.products || [];
          setFeaturedProducts(featuredData.map(p => ({ ...p, section: 'featured' })));
        }
      } catch (error) {
        console.log("No featured products found");
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Video handling with black gradient overlay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
        setVideoPlaying(true);
        setVideoError(false);
      } catch (err) {
        console.log("Video autoplay prevented:", err.message);
        setVideoPlaying(false);
        setVideoError(true);
      }
    };

    const handleVideoError = (e) => {
      console.log("Video failed to load:", e);
      setVideoError(true);
    };

    video.addEventListener('error', handleVideoError);
    
    const timer = setTimeout(playVideo, 100);

    return () => {
      clearTimeout(timer);
      video.removeEventListener('error', handleVideoError);
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
      categoryRef.current.scrollBy({ 
        left: dir === "left" ? -300 : 300, 
        behavior: "smooth" 
      });
    }
  };

  const scrollFeatured = (dir) => {
    if (featuredRef.current) {
      featuredRef.current.scrollBy({ 
        left: dir === "left" ? -300 : 300, 
        behavior: "smooth" 
      });
    }
  };

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  // Enhanced Benefits with glowing effects
  const benefits = [
    { 
      icon: <MdOutlineLocalShipping className="w-6 h-6" />, 
      title: "Free Shipping", 
      desc: "Orders over KSh 6,000", 
      gradient: "from-blue-600 to-cyan-600",
      glow: "shadow-blue-500/50",
      link: "/shop?shipping=free"
    },
    { 
      icon: <MdOutlineSecurity className="w-6 h-6" />, 
      title: "2 Year Warranty", 
      desc: "On all products", 
      gradient: "from-emerald-600 to-green-600",
      glow: "shadow-emerald-500/50",
      link: "/warranty"
    },
    { 
      icon: <FiRefreshCw className="w-6 h-6" />, 
      title: "30-Day Returns", 
      desc: "Money back guarantee", 
      gradient: "from-orange-600 to-red-600",
      glow: "shadow-orange-500/50",
      link: "/returns"
    },
    { 
      icon: <FiHeadphones className="w-6 h-6" />, 
      title: "24/7 Support", 
      desc: "Dedicated team", 
      gradient: "from-purple-600 to-pink-600",
      glow: "shadow-purple-500/50",
      link: "/support"
    },
  ];

  // Categories with oraimo styling
  const productCategories = [
    { 
      id: "audio", 
      slug: "audio",
      name: "TWS Earphones", 
      icon: <IoHeadsetOutline className="w-6 h-6" />, 
      gradient: "from-blue-600 to-cyan-600",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      count: "18+",
      link: "/shop?category=audio"
    },
    { 
      id: "powerbanks", 
      slug: "powerbanks",
      name: "Power Banks", 
      icon: <BsBatteryCharging className="w-6 h-6" />, 
      gradient: "from-emerald-600 to-green-600",
      image: "https://images.unsplash.com/photo-1609592424831-7f6c4461e232?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      count: "12+",
      link: "/shop?category=powerbanks"
    },
    { 
      id: "wearables", 
      slug: "wearables",
      name: "Smart Watches", 
      icon: <IoWatchOutline className="w-6 h-6" />, 
      gradient: "from-purple-600 to-pink-600",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      count: "9+",
      link: "/shop?category=wearables"
    },
    { 
      id: "hair-clippers", 
      slug: "hair-clippers",
      name: "Hair Clippers", 
      icon: <FiZap className="w-6 h-6" />, 
      gradient: "from-orange-600 to-red-600",
      image: "https://images.unsplash.com/photo-1621607512214-68297480165e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      count: "7+",
      link: "/shop?category=hair-clippers"
    },
  ];

  // Trust stats with glowing effects
  const trustStats = [
    { number: "200", label: "MILLION+", suffix: "USERS", icon: <FiUsers className="w-6 h-6" />, gradient: "from-blue-600 to-cyan-600" },
    { number: "60+", label: "", suffix: "COUNTRIES", icon: <FiGlobe className="w-6 h-6" />, gradient: "from-emerald-600 to-green-600" },
    { number: "365", label: "", suffix: "DAYS WARRANTY", icon: <FiAward className="w-6 h-6" />, gradient: "from-orange-600 to-red-600" },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Unbox Therapy",
      text: "OpenArc is the ultimate gym companion, from intense workouts to training sessions.",
      image: "https://images.unsplash.com/photo-1531427186629-2f6d6b1a7b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      rating: 5
    },
    {
      name: "Fisayo Fosudo",
      text: "Vocals and the instrumentals were very outstanding. Here I was impressed.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      rating: 5
    },
    {
      name: "Chouaib Reviews",
      text: "The sound in music is impressive and the bass is very good and rich.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      rating: 4
    }
  ];

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const displayFlashSaleProducts = flashSaleProducts.length > 0 
    ? flashSaleProducts 
    : (featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* ===== GLOWING TOP BAR ===== */}
      <div className="relative border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
        <div className="relative flex items-center justify-between px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              FREE SHIPPING OVER KSh 6,000
            </span>
            <span className="text-gray-700">|</span>
            <span>2 YEAR WARRANTY</span>
            <span className="hidden text-gray-700 md:inline">|</span>
            <span className="hidden md:inline">30-DAY RETURNS</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/stores" className="flex items-center gap-1 text-gray-400 transition-colors hover:text-white group">
              <FiMapPin className="w-3 h-3 transition-colors group-hover:text-blue-500" />
              <span className="group-hover:glow-text">FIND STORE</span>
            </Link>
            <Link to="/shop" className="flex items-center gap-1 text-gray-400 transition-colors hover:text-white group">
              <FiShoppingBag className="w-3 h-3 transition-colors group-hover:text-blue-500" /> {/* ✅ Now properly imported */}
              <span className="group-hover:glow-text">SHOP ONLINE</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== HERO SECTION WITH BLACK GRADIENT AND GLOWING BUTTONS ===== */}
      <div className="relative h-[80vh] min-h-[600px] overflow-hidden">
        {/* Background with black gradient overlay */}
        <div className="absolute inset-0">
          {!videoError ? (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="auto"
              className="object-cover w-full h-full opacity-40"
              poster="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            >
              <source 
                src="https://assets.mixkit.co/videos/preview/mixkit-electronics-in-a-technology-store-30185-large.mp4" 
                type="video/mp4" 
              />
            </video>
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
              alt="Technology Store" 
              className="object-cover w-full h-full opacity-40"
            />
          )}
          {/* Multiple gradient layers for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black"></div>
        </div>

        {/* Video Controls */}
        {!videoError && (
          <button
            onClick={toggleVideoPlay}
            className="absolute z-20 p-4 text-white transition-all rounded-full top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 hover:border-white/40 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            aria-label={videoPlaying ? "Pause video" : "Play video"}
          >
            {videoPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
          </button>
        )}

        {/* Hero Content */}
        <div className="relative z-10 flex items-center h-full">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-blue-500/30 rounded-full bg-black/50 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <IoFlashOutline className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium tracking-wider text-blue-400">ORAIMO</span>
              </div>
              
              <h1 className="mb-4 text-6xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-purple-400 md:text-7xl lg:text-8xl glow-text">
                SpaceBuds
                <span className="block text-5xl md:text-6xl lg:text-7xl text-white/90">Pro</span>
              </h1>
              
              <p className="mb-2 text-2xl font-light text-gray-300 md:text-3xl">
                50dB Adaptive Hybrid ANC
              </p>
              
              <p className="mb-8 text-lg text-gray-400">
                TWS Earphones with Immersive Sound
              </p>
              
              <div className="flex flex-wrap gap-6">
                <Link 
                  to="/product/spacebuds-pro"
                  className="relative px-10 py-4 overflow-hidden text-lg font-semibold text-white transition-all rounded-full group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-50 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-2">
                    EXPLORE NOW
                    <BsArrowRight className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link 
                  to="/shop"
                  className="relative px-10 py-4 overflow-hidden text-lg font-semibold text-white transition-all rounded-full group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl group-hover:opacity-50"></span>
                  <span className="relative flex items-center gap-2 px-8 py-2 border rounded-full border-white/20">
                    SHOP ALL
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Product Thumbnails with glow */}
        <div className="absolute hidden gap-4 bottom-8 right-8 lg:flex">
          {["SpaceBuds Pro", "OpenArc", "Necklace Pro"].map((item, i) => (
            <div 
              key={i} 
              className="relative overflow-hidden transition-all duration-300 cursor-pointer group w-28 h-28 rounded-xl hover:scale-110"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50 group-hover:opacity-100 blur-xl"></div>
              <div className="absolute inset-0 transition-colors duration-300 border-2 border-white/20 group-hover:border-blue-500/50 rounded-xl"></div>
              <img 
                src={`https://images.unsplash.com/photo-${i === 0 ? '1583394838336-acd977736f90' : i === 1 ? '1505740420928-5e560c06d30e' : '1572569511254-d8f0fe4a9a49'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80`}
                alt={item}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute -translate-x-1/2 left-1/2 bottom-8 animate-bounce">
          <div className="flex justify-center w-10 h-16 border-2 rounded-full border-white/20">
            <div className="w-1 h-3 mt-2 rounded-full bg-gradient-to-b from-blue-500 to-purple-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* ===== TRUSTED BY SECTION WITH GLOWING CARDS ===== */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        
        <div className="relative px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {trustStats.map((stat, index) => (
              <div 
                key={index}
                className="relative p-8 overflow-hidden transition-all duration-500 border border-gray-800 group rounded-2xl bg-gradient-to-br from-gray-900 to-black hover:border-gray-700"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                
                <div className="relative flex items-center gap-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} bg-opacity-10`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-white">{stat.number}</div>
                    <div className="text-sm text-gray-400">{stat.label} {stat.suffix}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FEATURED PRODUCTS WITH GLOWING CARDS ===== */}
      <section className="relative px-4 py-20 mx-auto max-w-7xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        
        <div className="relative mb-12 text-center">
          <h2 className="mb-4 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 glow-text">
            EXPLORE OUR LATEST TECH
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="relative overflow-hidden h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <div key={product._id || product.id} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                <div className="relative overflow-hidden transition-all duration-500 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl group-hover:border-gray-700">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== CATEGORIES GRID WITH GLOW ===== */}
      <section className="relative px-4 py-20 mx-auto max-w-7xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        
        <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4">
          {productCategories.map((category, index) => (
            <Link
              key={category.id}
              to={category.link}
              className="relative group"
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
              <div className="relative overflow-hidden transition-all duration-500 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black group-hover:border-gray-700">
                <div className="relative aspect-square">
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  
                  {/* Glowing overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className={`inline-flex p-3 mb-3 bg-gradient-to-r ${category.gradient} rounded-xl shadow-lg`}>
                      {category.icon}
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-white">{category.name}</h3>
                    <p className="text-sm text-gray-400">{category.count} Products</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="relative px-4 py-20 mx-auto max-w-7xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        
        <div className="relative mb-12 text-center">
          <h2 className="mb-4 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 glow-text">
            HEAR WHAT THEY ARE SAYING
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
              <div className="relative p-8 transition-all duration-500 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black group-hover:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 border-2 rounded-full border-blue-500/50"
                    />
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-50 blur transition-opacity duration-500"></div>
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        i < testimonial.rating ? 
                          <FaStar key={i} className="w-4 h-4 text-yellow-500" /> :
                          i + 0.5 === testimonial.rating ?
                            <FaStarHalfAlt key={i} className="w-4 h-4 text-yellow-500" /> :
                            <FaRegStar key={i} className="w-4 h-4 text-gray-600" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="leading-relaxed text-gray-400">"{testimonial.text}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FLASH SALE BANNER WITH GLOW ===== */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        
        <div className="relative px-4 mx-auto max-w-7xl">
          <div className="relative p-12 overflow-hidden border border-gray-800 rounded-3xl bg-gradient-to-br from-gray-900 to-black">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
            
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center gap-3 mb-4 md:justify-start">
                  <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl animate-pulse">
                    <AiFillFire className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 glow-text">
                    FLASH SALE
                  </h2>
                </div>
                <p className="text-xl text-gray-400">Limited time offers ending soon!</p>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 text-sm rounded-full bg-white/10">🔥 Up to 50% OFF</span>
                  <span className="px-3 py-1 text-sm rounded-full bg-white/10">⚡ 24 Hours Left</span>
                </div>
              </div>
              <Link 
                to="/shop?sort=discount"
                className="relative px-12 py-5 overflow-hidden text-xl font-bold text-white transition-all rounded-full group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600"></span>
                <span className="absolute inset-0 transition-opacity opacity-50 bg-gradient-to-r from-orange-600 to-red-600 blur-xl group-hover:opacity-100"></span>
                <span className="relative flex items-center gap-3">
                  SHOP NOW
                  <BsArrowRight className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FLASH SALE PRODUCTS ===== */}
      <section className="relative px-4 py-20 mx-auto max-w-7xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        
        <div className="relative">
          <div ref={featuredRef} className="flex gap-6 pb-8 overflow-x-auto scrollbar-hide">
            {displayFlashSaleProducts.map((product) => (
              <div key={`flash-${product._id || product.id}`} className="relative flex-shrink-0 w-64 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                <div className="relative overflow-hidden transition-all duration-500 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl group-hover:border-gray-700">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
          
          {displayFlashSaleProducts.length > 4 && (
            <>
              <button 
                onClick={() => scrollFeatured("left")}
                className="absolute p-4 transition-all -translate-y-1/2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-full shadow-2xl left-0 top-1/2 -translate-x-4 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] group"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-400 transition-colors group-hover:text-blue-500" />
              </button>
              <button 
                onClick={() => scrollFeatured("right")}
                className="absolute p-4 transition-all -translate-y-1/2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-full shadow-2xl right-0 top-1/2 translate-x-4 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] group"
              >
                <FiChevronRight className="w-6 h-6 text-gray-400 transition-colors group-hover:text-blue-500" />
              </button>
            </>
          )}
        </div>
      </section>

      {/* Global Styles for Glow Effects */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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
      `}</style>
    </div>
  );
};

export default Home;