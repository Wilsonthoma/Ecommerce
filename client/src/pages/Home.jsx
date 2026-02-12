// src/pages/Home.jsx - FIXED VERSION
import React, { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext"; // Changed from CartContext to useCart
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
  FiBattery,
  FiSpeaker,
  FiStar,
  FiArrowRight,
  FiCheckCircle,
  FiPlay,
  FiPause,
  FiShoppingBag,
  FiShoppingCart,
  FiHome,
  FiPackage
} from "react-icons/fi";
import { 
  BsLightningFill, 
  BsArrowRight,
  BsBatteryCharging,
  BsQuote,
  BsStarFill,
  BsStarHalf,
  BsFire
} from "react-icons/bs";
import { MdLocalShipping, MdSecurity, MdSupportAgent, MdPerson } from "react-icons/md";
import { AiFillThunderbolt, AiFillFire, AiOutlineRight, AiFillStar } from "react-icons/ai";
import { IoFlashSharp } from "react-icons/io5";

const Home = () => {
  const { user, isAuthenticated } = useContext(AppContext);
  const { addToCart } = useCart(); // Changed from useContext(CartContext) to useCart()
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  
  const categoryRef = useRef(null);
  const featuredRef = useRef(null);
  const videoRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsResponse, categoriesResponse, featuredResponse] = await Promise.all([
        clientProductService.getProducts({ limit: 16, sort: '-createdAt' }),
        clientProductService.getCategories(),
        clientProductService.getFeaturedProducts().catch(() => ({ 
          success: true, 
          products: [] 
        }))
      ]);

      // Handle products response
      if (productsResponse.success) {
        const productsData = productsResponse.data?.products || productsResponse.products || [];
        setProducts(productsData);
        setTrendingProducts(productsData.slice(0, 8));
      }

      // Handle categories response
      if (categoriesResponse.success) {
        const categoriesData = categoriesResponse.data?.categories || categoriesResponse.categories || [];
        setCategories(categoriesData);
      }

      // Handle featured products response
      if (featuredResponse.success) {
        const featuredData = featuredResponse.data?.products || featuredResponse.products || [];
        setFeaturedProducts(featuredData);
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load products. Please try again.");
      
      // Fallback empty states
      setProducts([]);
      setCategories([]);
      setFeaturedProducts([]);
      setTrendingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Video handling
  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.muted = true;
          await videoRef.current.play();
          setVideoPlaying(true);
        } catch (err) {
          console.log("Video autoplay failed:", err);
          setVideoPlaying(false);
        }
      }
    };

    const timer = setTimeout(() => {
      playVideo();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
        setVideoPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setVideoPlaying(true))
          .catch(e => console.log("Video play failed:", e));
      }
      
      if (videoRef.current.muted) {
        videoRef.current.muted = false;
      }
    }
  };

  const scrollCategories = (dir) => {
    if (categoryRef.current) {
      categoryRef.current.scrollBy({ 
        left: dir === "left" ? -350 : 350, 
        behavior: "smooth" 
      });
    }
  };

  const scrollFeatured = (dir) => {
    if (featuredRef.current) {
      featuredRef.current.scrollBy({ 
        left: dir === "left" ? -350 : 350, 
        behavior: "smooth" 
      });
    }
  };

  // Format price to Kenyan Shillings
  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  // Color theme constants
  const themeColors = {
    primary: "from-blue-600 to-cyan-500",
    secondary: "from-orange-500 to-red-500",
    accent: "from-purple-500 to-pink-500",
    success: "from-emerald-500 to-green-500",
    dark: "from-blue-900 to-cyan-800",
    light: "from-blue-50 to-cyan-50"
  };

  const benefits = [
    { 
      icon: <MdLocalShipping className="w-8 h-8" />, 
      title: "Free Shipping", 
      desc: "On orders over KSh 6,000", 
      bg: `bg-gradient-to-r ${themeColors.primary}`,
      color: "text-white",
      delay: "0ms"
    },
    { 
      icon: <MdSecurity className="w-8 h-8" />, 
      title: "2 Year Warranty", 
      desc: "On all products", 
      bg: `bg-gradient-to-r ${themeColors.success}`,
      color: "text-white",
      delay: "100ms"
    },
    { 
      icon: <FiRefreshCw className="w-8 h-8" />, 
      title: "30-Day Returns", 
      desc: "Money back guarantee", 
      bg: `bg-gradient-to-r ${themeColors.accent}`,
      color: "text-white",
      delay: "200ms"
    },
    { 
      icon: <MdSupportAgent className="w-8 h-8" />, 
      title: "24/7 Support", 
      desc: "Dedicated support team", 
      bg: `bg-gradient-to-r ${themeColors.secondary}`,
      color: "text-white",
      delay: "300ms"
    },
  ];

  const productCategories = [
    { 
      id: "electronics", 
      name: "Electronics", 
      icon: <FiSmartphone />, 
      bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    { 
      id: "audio", 
      name: "Audio Gear", 
      icon: <FiHeadphones />, 
      bg: "bg-gradient-to-r from-purple-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    { 
      id: "wearables", 
      name: "Wearables", 
      icon: <FiWatch />, 
      bg: "bg-gradient-to-r from-emerald-500 to-green-500",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    { 
      id: "home-appliances", 
      name: "Home Appliances", 
      icon: <FiPackage />, 
      bg: "bg-gradient-to-r from-orange-500 to-red-500",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
  ];

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<AiFillStar key={i} className="w-4 h-4 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<BsStarHalf key="half" className="w-4 h-4 text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/30">
      {/* Hero Banner with Video Background */}
      <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="object-cover w-full h-full"
            poster="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            onClick={toggleVideoPlay}
          >
            <source 
              src="https://assets.mixkit.co/videos/preview/mixkit-electronics-in-a-technology-store-30185-large.mp4" 
              type="video/mp4" 
            />
            <img 
              src="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
              alt="Premium Electronics" 
              className="object-cover w-full h-full"
            />
          </video>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/80 to-cyan-800/75"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Video Controls */}
        <button
          onClick={toggleVideoPlay}
          className="absolute z-20 p-3 text-white transition-colors rounded-full top-6 right-6 bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          {videoPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
        </button>

        {/* Content Overlay */}
        <div className="relative z-10 flex items-center h-full">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm animate-pulse">
                  <AiFillThunderbolt className="text-yellow-300" />
                  <span className="text-sm font-medium">Limited Time Offer</span>
                </div>
                
                <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                  Premium Technology
                  <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
                    At Amazing Prices
                  </span>
                </h1>
                
                <p className="max-w-xl mb-8 text-lg text-blue-100">
                  Discover cutting-edge electronics, immersive audio experiences, 
                  and smart devices at unbeatable prices in Kenyan Shillings.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/shop"
                    className={`px-8 py-3 bg-gradient-to-r ${themeColors.primary} text-white font-semibold rounded-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group shadow-lg`}
                  >
                    <span>Shop Collection</span>
                    <BsArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link 
                    to="/shop?sort=discount"
                    className="flex items-center gap-2 px-8 py-3 font-semibold text-white transition-all border rounded-lg bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 hover:shadow-lg"
                  >
                    <AiFillFire className="text-orange-300" /> Hot Deals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute text-white transform -translate-x-1/2 bottom-8 left-1/2 animate-bounce">
          <FiChevronDown className="w-6 h-6" />
        </div>
      </div>

      {/* Benefits Bar */}
      <div className={`bg-gradient-to-r ${themeColors.light} py-8 relative z-20 shadow-sm`}>
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="animate-fadeInUp"
                style={{ animationDelay: benefit.delay }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${benefit.bg} ${benefit.color} shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flash Sale Banner */}
      <div className="relative py-8 overflow-hidden shadow-lg bg-gradient-to-r from-orange-500 via-red-500 to-pink-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10"></div>
        <div className="relative z-10 px-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <BsFire className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h2 className="text-2xl font-bold md:text-3xl">🔥 FLASH SALE</h2>
              </div>
              <p className="mb-4 text-orange-100">Limited time offers ending soon!</p>
            </div>
            <Link 
              to="/shop?sort=discount"
              className="px-8 py-3 font-bold text-orange-600 transition-all bg-white rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105"
            >
              Shop Flash Deals →
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products - Flash Sale */}
      <section className="px-4 py-16 mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-10 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-r ${themeColors.secondary} rounded-xl shadow-lg`}>
              <AiFillFire className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Flash Deals</h2>
              <p className="text-gray-600">Limited time offers. Don't miss out!</p>
            </div>
          </div>
          <Link 
            to="/shop?sort=discount"
            className="flex items-center gap-2 font-semibold text-blue-600 transition-all hover:text-blue-700 hover:gap-3"
          >
            View All <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div ref={featuredRef} className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide">
              {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)).map((product) => (
                <div key={product._id} className="flex-shrink-0 w-64">
                  <div className="relative p-4 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
                    {/* Product Image */}
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'}
                        alt={product.name}
                        className="object-cover w-full h-48 transition-transform duration-300 hover:scale-105"
                      />
                      {product.discountPrice && (
                        <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded top-2 left-2">
                          SAVE {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <h3 className="mb-2 font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {renderStars(product.rating || 4.5)}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({product.reviews || 0})
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatKES(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatKES(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Add to Cart
                      </button>
                      <Link 
                        to={`/product/${product._id}`}
                        className="px-3 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <FiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => scrollFeatured("left")}
              className="absolute left-0 p-2 transition-shadow -translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:shadow-xl"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scrollFeatured("right")}
              className="absolute right-0 p-2 transition-shadow translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:shadow-xl"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </section>

      {/* Shop by Category */}
      <section className={`bg-gradient-to-b ${themeColors.light} py-16`}>
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-blue-800 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100">
              <FiCheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">SHOP BY CATEGORY</span>
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Browse Popular Categories</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Find exactly what you need from our carefully curated tech categories
            </p>
          </div>

          <div className="relative">
            <div ref={categoryRef} className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide">
              {productCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group flex-shrink-0 w-64 cursor-pointer transition-all ${
                    activeCategory === category.id ? 'scale-105 ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 rounded-2xl hover:shadow-2xl">
                    {/* Category Image */}
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={category.image}
                        alt={category.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 ${category.bg} opacity-20`}></div>
                    </div>
                    
                    {/* Category Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${category.bg} text-white shadow-lg`}>
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => scrollCategories("left")}
              className="absolute left-0 p-2 transition-shadow -translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:shadow-xl"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scrollCategories("right")}
              className="absolute right-0 p-2 transition-shadow translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:shadow-xl"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-4 py-16 mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-10 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-3 text-orange-800 rounded-full bg-gradient-to-r from-orange-100 to-red-100">
              <BsFire className="w-4 h-4" />
              <span className="text-sm font-medium">TRENDING NOW</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">Most Popular Products</h2>
            <p className="text-gray-600">Discover what everyone is buying this week</p>
          </div>
          <div className="flex gap-2 pb-2 overflow-x-auto">
            {["all", "electronics", "audio", "wearables", "home-appliances"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? `bg-gradient-to-r ${themeColors.primary} text-white shadow-lg` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {cat === "all" ? "All Products" : cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredProducts.slice(0, 10).map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link 
            to="/shop"
            className="flex items-center gap-2 px-8 py-3 mx-auto font-semibold text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-700"
          >
            Browse All Products <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;