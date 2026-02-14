// src/pages/Home.jsx - FIXED FLASH SALE PRODUCTS
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
  FiStar
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
  BsStarHalf
} from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";

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
  
  const categoryRef = useRef(null);
  const featuredRef = useRef(null);
  const videoRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch regular products
      const productsResponse = await clientProductService.getProducts({ limit: 16, sort: '-createdAt' });
      
      // Fetch categories
      const categoriesResponse = await clientProductService.getCategories();
      
      // ✅ FIXED: Fetch products with discounts for flash sale
      let flashSaleData = [];
      try {
        // Try to get discounted products first
        const discountedResponse = await clientProductService.getProducts({ 
          hasDiscount: true, 
          limit: 8,
          sort: '-discountPercentage' 
        });
        
        if (discountedResponse.success && discountedResponse.products?.length > 0) {
          flashSaleData = discountedResponse.products;
        } else {
          // Fallback to featured products
          const featuredResponse = await clientProductService.getFeaturedProducts();
          if (featuredResponse.success && featuredResponse.products?.length > 0) {
            flashSaleData = featuredResponse.products;
          }
        }
      } catch (error) {
        console.log("Using fallback for flash sale products");
        // If API fails, use products with discountPrice from regular products
        if (productsResponse.success && productsResponse.products) {
          flashSaleData = productsResponse.products
            .filter(p => p.discountPrice && p.discountPrice < p.price)
            .slice(0, 8);
        }
      }

      // Process products response
      if (productsResponse.success) {
        const productsData = productsResponse.data?.products || productsResponse.products || [];
        setProducts(productsData);
        setTrendingProducts(productsData.slice(0, 8));
      }

      // Process categories response
      if (categoriesResponse.success) {
        const categoriesData = categoriesResponse.data?.categories || categoriesResponse.categories || [];
        setCategories(categoriesData);
      }

      // Set flash sale products
      setFlashSaleProducts(flashSaleData);
      
      // Also try to get featured products separately
      try {
        const featuredResponse = await clientProductService.getFeaturedProducts();
        if (featuredResponse.success) {
          const featuredData = featuredResponse.data?.products || featuredResponse.products || [];
          setFeaturedProducts(featuredData);
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

  // Video handling
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

  // Format price
  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  // Theme colors
  const themeColors = {
    primary: "from-blue-600 to-cyan-500",
    secondary: "from-orange-500 to-red-500",
    accent: "from-purple-500 to-pink-500",
    success: "from-emerald-500 to-green-500",
    dark: "from-blue-900 to-cyan-800",
    light: "from-blue-50 to-cyan-50"
  };

  // Benefits
  const benefits = [
    { 
      icon: <BsTruck className="w-6 h-6" />, 
      title: "Free Shipping", 
      desc: "Orders over KSh 6,000", 
      bg: `bg-gradient-to-r ${themeColors.primary}`,
      delay: "0ms"
    },
    { 
      icon: <BsShieldCheck className="w-6 h-6" />, 
      title: "2 Year Warranty", 
      desc: "On all products", 
      bg: `bg-gradient-to-r ${themeColors.success}`,
      delay: "100ms"
    },
    { 
      icon: <BsArrowRepeat className="w-6 h-6" />, 
      title: "30-Day Returns", 
      desc: "Money back guarantee", 
      bg: `bg-gradient-to-r ${themeColors.accent}`,
      delay: "200ms"
    },
    { 
      icon: <BsHeadphones className="w-6 h-6" />, 
      title: "24/7 Support", 
      desc: "Dedicated team", 
      bg: `bg-gradient-to-r ${themeColors.secondary}`,
      delay: "300ms"
    },
  ];

  // Categories
  const productCategories = [
    { 
      id: "electronics", 
      name: "Electronics", 
      icon: <FiSmartphone className="w-6 h-6" />, 
      bg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      count: "245+"
    },
    { 
      id: "audio", 
      name: "Audio Gear", 
      icon: <FiHeadphones className="w-6 h-6" />, 
      bg: "bg-gradient-to-br from-purple-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      count: "189+"
    },
    { 
      id: "wearables", 
      name: "Wearables", 
      icon: <FiWatch className="w-6 h-6" />, 
      bg: "bg-gradient-to-br from-emerald-500 to-green-500",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      count: "156+"
    },
    { 
      id: "home-appliances", 
      name: "Home Appliances", 
      icon: <FiPackage className="w-6 h-6" />, 
      bg: "bg-gradient-to-br from-orange-500 to-red-500",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      count: "112+"
    },
  ];

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<BsStarFill key={i} className="w-3 h-3 text-yellow-400 sm:w-4 sm:h-4" />);
      } else {
        stars.push(<BsStarHalf key={i} className="w-3 h-3 text-gray-300 sm:w-4 sm:h-4" />);
      }
    }
    return stars;
  };

  // Determine which products to show in flash sale
  const displayFlashSaleProducts = flashSaleProducts.length > 0 
    ? flashSaleProducts 
    : (featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner */}
      <div className="relative h-[70vh] min-h-[500px] lg:h-[80vh] lg:min-h-[600px] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {!videoError ? (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="auto"
              className="object-cover w-full h-full"
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
              alt="Electronics Store" 
              className="object-cover w-full h-full"
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/85 to-cyan-800/80"></div>
        </div>

        {/* Video Controls */}
        {!videoError && (
          <button
            onClick={toggleVideoPlay}
            className="absolute z-20 p-2 text-white transition-all rounded-full top-4 right-4 sm:top-6 sm:right-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-110"
            aria-label={videoPlaying ? "Pause video" : "Play video"}
          >
            {videoPlaying ? <FiPause className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiPlay className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        )}

        {/* Hero Content */}
        <div className="relative z-10 flex items-center h-full">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium text-orange-600 bg-orange-100 rounded-full sm:px-4 sm:py-2 sm:text-sm animate-pulse">
                <BsLightningCharge className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Limited Time Offer</span>
              </div>
              
              <h1 className="mb-3 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Premium Technology
                <span className="block mt-1 text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
                  At Amazing Prices
                </span>
              </h1>
              
              <p className="max-w-xl mb-6 text-sm text-blue-100 sm:text-base md:text-lg">
                Discover cutting-edge electronics, immersive audio experiences, 
                and smart devices at unbeatable prices in Kenyan Shillings.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link 
                  to="/shop"
                  className="px-6 py-2.5 text-sm font-semibold text-white transition-all bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-2xl hover:scale-105 sm:px-8 sm:py-3 sm:text-base flex items-center gap-2 group"
                >
                  <span>Shop Collection</span>
                  <BsArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  to="/shop?sort=discount"
                  className="px-6 py-2.5 text-sm font-semibold text-white transition-all border rounded-lg backdrop-blur-sm border-white/30 bg-white/10 hover:bg-white/20 sm:px-8 sm:py-3 sm:text-base flex items-center gap-2"
                >
                  <BsFire className="text-orange-300" /> Hot Deals
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute hidden text-white transform -translate-x-1/2 bottom-8 left-1/2 animate-bounce md:block">
          <FiChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Benefits Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:py-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-2 transition-all rounded-lg hover:shadow-md sm:p-3 group"
              >
                <div className={`p-2 rounded-lg ${benefit.bg} text-white shadow-md group-hover:scale-110 transition-transform sm:p-2.5`}>
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 sm:text-sm">{benefit.title}</h3>
                  <p className="text-[10px] text-gray-600 sm:text-xs">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flash Sale Banner */}
      <div className="relative py-6 overflow-hidden shadow-md sm:py-8 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center"></div>
        <div className="relative z-10 px-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-white md:text-left">
              <div className="flex items-center justify-center gap-2 mb-1 md:justify-start">
                <BsFire className="w-5 h-5 text-yellow-300 animate-pulse sm:w-6 sm:h-6" />
                <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">FLASH SALE</h2>
              </div>
              <p className="text-xs text-orange-100 sm:text-sm">Limited time offers ending soon!</p>
            </div>
            <Link 
              to="/shop?sort=discount"
              className="px-6 py-2.5 text-sm font-bold text-orange-600 transition-all bg-white rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105 sm:px-8 sm:py-3"
            >
              Shop Flash Deals →
            </Link>
          </div>
        </div>
      </div>

      {/* Flash Sale Products - FIXED */}
      <section className="px-4 py-12 mx-auto max-w-7xl sm:py-16">
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 sm:p-3">
              <AiFillFire className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Flash Deals</h2>
              <p className="text-xs text-gray-600 sm:text-sm">Limited time offers. Don't miss out!</p>
            </div>
          </div>
          <Link 
            to="/shop?sort=discount"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition-all hover:text-blue-700 hover:gap-2 sm:text-base"
          >
            View All <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse sm:h-56"></div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div ref={featuredRef} className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide sm:gap-6">
              {displayFlashSaleProducts.length > 0 ? (
                displayFlashSaleProducts.map((product) => (
                  <div key={product._id || product.id} className="flex-shrink-0 w-48 sm:w-56">
                    <div className="p-3 transition-shadow bg-white border border-gray-100 shadow-md rounded-xl hover:shadow-lg sm:p-4">
                      {/* Product Image */}
                      <div className="relative mb-3 overflow-hidden rounded-lg aspect-square">
                        <img 
                          src={product.images?.[0]?.url || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'}
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
                          }}
                        />
                        {product.discountPrice && (
                          <div className="absolute px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded top-2 left-2 sm:px-2 sm:py-1 sm:text-xs">
                            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <h3 className="mb-1 text-xs font-semibold text-gray-900 line-clamp-1 sm:text-sm">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {renderStars(product.rating || 4.5)}
                        </div>
                        <span className="text-[10px] text-gray-500 sm:text-xs">
                          ({product.reviews || 0})
                        </span>
                      </div>
                      
                      {/* Price */}
                      <div className="mb-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-sm font-bold text-gray-900 sm:text-base">
                            {formatKES(product.discountPrice || product.price)}
                          </span>
                          {product.discountPrice && (
                            <span className="text-[10px] text-gray-500 line-through sm:text-xs">
                              {formatKES(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 py-1.5 text-[10px] font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 sm:py-2 sm:text-xs"
                        >
                          Add to Cart
                        </button>
                        <Link 
                          to={`/product/${product._id || product.id}`}
                          className="px-2 py-1.5 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 sm:px-3 sm:py-2"
                        >
                          <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-12 text-center text-gray-500">
                  No flash sale products available at the moment
                </div>
              )}
            </div>
            
            {/* Scroll Buttons */}
            {displayFlashSaleProducts.length > 4 && (
              <>
                <button 
                  onClick={() => scrollFeatured("left")}
                  className="left-0 hidden p-2 transition-shadow -translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:shadow-xl md:absolute md:block"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scrollFeatured("right")}
                  className="right-0 hidden p-2 transition-shadow translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:shadow-xl md:absolute md:block"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* Shop by Category */}
      <section className="py-12 bg-gradient-to-b from-blue-50 to-white sm:py-16">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-8 text-center sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-medium text-blue-800 bg-blue-100 rounded-full sm:px-4 sm:py-2 sm:text-sm">
              <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>SHOP BY CATEGORY</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">Browse Categories</h2>
            <p className="max-w-2xl mx-auto text-xs text-gray-600 sm:text-sm">
              Find exactly what you need from our curated collections
            </p>
          </div>

          <div className="relative">
            <div ref={categoryRef} className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide sm:gap-6">
              {productCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group flex-shrink-0 w-48 cursor-pointer transition-all sm:w-56 ${
                    activeCategory === category.id ? 'scale-105 ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:shadow-xl">
                    <div className="h-32 overflow-hidden sm:h-40">
                      <img 
                        src={category.image}
                        alt={category.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 ${category.bg} opacity-20`}></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${category.bg} text-white shadow-md sm:p-2.5`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 sm:text-base">{category.name}</h3>
                          <p className="text-xs text-gray-500">{category.count} items</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => scrollCategories("left")}
              className="left-0 hidden p-2 transition-shadow -translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:shadow-xl md:absolute md:block"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollCategories("right")}
              className="right-0 hidden p-2 transition-shadow translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:shadow-xl md:absolute md:block"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-4 py-12 mx-auto max-w-7xl sm:py-16">
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-medium text-orange-800 bg-orange-100 rounded-full sm:px-4 sm:py-2 sm:text-sm">
              <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>TRENDING NOW</span>
            </div>
            <h2 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Most Popular</h2>
            <p className="text-xs text-gray-600 sm:text-sm">Discover what everyone is buying</p>
          </div>
          
          <div className="flex gap-2 pb-2 overflow-x-auto">
            {["all", "electronics", "audio", "wearables", "home-appliances"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all sm:px-4 sm:py-2 sm:text-sm ${
                  activeCategory === cat 
                    ? `bg-gradient-to-r ${themeColors.primary} text-white shadow-md` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === "all" ? "All" : cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse sm:h-56"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredProducts.slice(0, 10).map((product) => (
              <ProductCard 
                key={product._id || product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:mt-12">
          <Link 
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-700 sm:px-8 sm:py-3"
          >
            Browse All Products <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;