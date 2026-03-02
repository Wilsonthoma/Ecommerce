// src/pages/Wishlist.jsx - COMPACT with Yellow-Orange Theme, LoadingSpinner (algorithm tracking hidden from UI)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { clientProductService } from '../services/client/products';
import ProductCard from '../components/ProductCard';
import LoadingSpinner, { CardSkeleton } from '../components/LoadingSpinner';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiTrash2, 
  FiArrowLeft,
  FiChevronRight,
  FiEye,
  FiX,
  FiStar,
  FiPackage,
  FiMapPin
} from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { BsArrowRight } from 'react-icons/bs';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Font styles - UPDATED with yellow-orange theme and Dashboard-style heading
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  /* Section title styling from Dashboard (matching Cart page) */
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
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  .glow-text:hover {
    text-shadow: 0 0 50px rgba(245, 158, 11, 0.8);
  }
  
  /* COMPACT TEXT SIZES */
  .text-2xl {
    font-size: 1.2rem;
  }
  
  .text-xl {
    font-size: 1.1rem;
  }
  
  .text-lg {
    font-size: 0.95rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .text-xs {
    font-size: 0.65rem;
  }
`;

// Animation styles
const animationStyles = `
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
    50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
    100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
  }
  
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
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
  
  .glow-border {
    animation: glow 2s ease-in-out infinite;
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d-content {
    transform: translateZ(15px);
  }
`;

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';

// Wishlist header image
const wishlistHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for header - UPDATED to yellow-orange
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Normalize product data function (matching ProductCard expectations)
const normalizeProductData = (product, cached = false) => {
  if (!product) return null;
  
  return {
    ...product,
    _id: product._id || product.id,
    id: product.id || product._id,
    quantity: product.quantity !== undefined ? product.quantity : 
              (product.stock !== undefined ? product.stock : 10),
    stock: product.stock !== undefined ? product.stock : 
           (product.quantity !== undefined ? product.quantity : 10),
    price: product.price || 0,
    comparePrice: product.comparePrice || null,
    images: product.images || [],
    image: product.image || null,
    primaryImage: product.primaryImage || product.image || null,
    rating: product.rating || 0,
    reviewsCount: product.reviewsCount || product.reviews || 0,
    featured: product.featured || false,
    isTrending: product.isTrending || false,
    isFlashSale: product.isFlashSale || false,
    isJustArrived: product.isJustArrived || false,
    _cached: cached // Keep for internal tracking only
  };
};

const Wishlist = () => {
  const navigate = useNavigate();
  const { 
    wishlistItems, 
    wishlistCount, 
    loading: wishlistLoading, 
    removeFromWishlist, 
    clearWishlist 
  } = useWishlist();
  const { addToCart } = useCart();

  // Algorithm performance states (internal only - not shown to users)
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [enhancedProducts, setEnhancedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

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

  // Refresh AOS when wishlist changes
  useEffect(() => {
    setTimeout(() => {
      AOS.refresh();
    }, 500);
  }, [wishlistItems, enhancedProducts]);

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch enhanced product details when wishlist changes
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!wishlistItems.length) {
        setEnhancedProducts([]);
        setInitialLoad(false);
        return;
      }

      setLoadingProducts(true);
      const startTime = performance.now();
      
      try {
        const productIds = wishlistItems.map(item => item._id || item.id).filter(Boolean);
        
        if (productIds.length === 0) {
          setEnhancedProducts(wishlistItems.map(p => normalizeProductData(p)));
          return;
        }
        
        const response = await clientProductService.getProductsByIds?.(productIds);
        
        const endTime = performance.now();
        const loadTimeMs = (endTime - startTime).toFixed(0);
        const isCached = response?.cached || false;
        
        setLoadTime(loadTimeMs);
        setFromCache(isCached);
        
        setCacheStats(prev => ({
          totalRequests: prev.totalRequests + 1,
          cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
        }));
        
        // Log to console only - hidden from UI
        console.log(`⚡ Wishlist products loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
        
        if (response?.success) {
          // Create a map of enhanced products
          const enhancedMap = {};
          response.products.forEach(p => {
            enhancedMap[p.id] = p;
          });
          
          // Merge wishlist items with enhanced data
          const merged = wishlistItems.map(item => {
            const itemId = item._id || item.id;
            const enhanced = enhancedMap[itemId];
            if (enhanced) {
              return normalizeProductData(enhanced, isCached);
            }
            return normalizeProductData(item);
          });
          
          setEnhancedProducts(merged);
        } else {
          // Use wishlist items as fallback
          setEnhancedProducts(wishlistItems.map(p => normalizeProductData(p)));
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setEnhancedProducts(wishlistItems.map(p => normalizeProductData(p)));
      } finally {
        setLoadingProducts(false);
        setInitialLoad(false);
      }
    };

    fetchProductDetails();
  }, [wishlistItems]);

  // Update select all when items change
  useEffect(() => {
    const items = enhancedProducts.length ? enhancedProducts : wishlistItems;
    if (selectedItems.length === items.length && items.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, enhancedProducts, wishlistItems]);

  // Format KES currency
  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  // Get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return FALLBACK_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
    return `${API_URL}/uploads/products/${imagePath}`;
  };

  // Handle remove from wishlist
  const handleRemove = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(productId);
    setSelectedItems(prev => prev.filter(id => id !== productId));
  };

  // Handle select all
  const handleSelectAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const items = enhancedProducts.length ? enhancedProducts : wishlistItems;
    
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id || item.id));
    }
  };

  // Handle select item
  const handleSelectItem = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedItems.includes(productId)) {
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedItems(prev => [...prev, productId]);
    }
  };

  // Handle bulk remove
  const handleBulkRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }

    if (window.confirm(`Remove ${selectedItems.length} item(s) from wishlist?`)) {
      selectedItems.forEach(id => removeFromWishlist(id));
      setSelectedItems([]);
    }
  };

  // Handle add all to cart
  const handleAddAllToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const items = enhancedProducts.length ? enhancedProducts : wishlistItems;
    
    if (items.length === 0) return;

    let successCount = 0;
    for (const product of items) {
      const productId = product._id || product.id;
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      const success = await addToCart(product, 1);
      if (success) successCount++;
      
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }

    toast.success(`Added ${successCount} of ${items.length} items to cart`);
  };

  // Handle clear all
  const handleClearAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Clear your entire wishlist?')) {
      clearWishlist();
      setSelectedItems([]);
    }
  };

  // Calculate cache hit rate (internal only)
  const cacheHitRate = cacheStats.totalRequests > 0 
    ? ((cacheStats.cacheHits / cacheStats.totalRequests) * 100).toFixed(0)
    : 0;

  const displayItems = enhancedProducts.length ? enhancedProducts : wishlistItems;

  // Loading state with CardSkeleton
  if ((wishlistLoading || (loadingProducts && initialLoad)) && wishlistItems.length > 0) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        {/* Wishlist Header Image */}
        <div 
          className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={wishlistHeaderImage}
              alt="My Wishlist"
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
                  <h1 className="section-title">MY WISHLIST</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading your wishlist...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Cards */}
        <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
          <CardSkeleton count={Math.min(wishlistItems.length, 8)} />
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container px-3 py-10 mx-auto">
          <div 
            className="max-w-md mx-auto text-center"
            data-aos="zoom-in"
            data-aos-duration="1200"
          >
            <div className="relative inline-block mb-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                <FiHeart className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-50 blur-xl"></div>
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">Your Wishlist is Empty</h1>
            <p className="mb-5 text-xs text-gray-400">
              Save items you love to your wishlist and they'll appear here
            </p>
            <Link
              to="/shop"
              className="relative inline-flex items-center gap-1.5 px-5 py-2.5 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
              <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
              <span className="relative flex items-center gap-1.5">
                <FiShoppingCart className="w-4 h-4" />
                Start Shopping
                <BsArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>

      {/* Wishlist Header Image - COMPACT with Dashboard-style heading */}
      <div 
        className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={wishlistHeaderImage}
            alt="My Wishlist"
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
              {/* Updated heading with Dashboard style */}
              <div className="section-title-wrapper">
                <h1 className="section-title">MY WISHLIST</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </p>
              
              {/* Algorithm Performance Badge REMOVED - hidden from users */}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumb - COMPACT */}
        <nav 
          className="flex items-center gap-1 mb-4 text-xs"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <Link to="/" className="text-gray-400 transition-colors hover:text-yellow-500">Home</Link>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <Link to="/shop" className="text-gray-400 transition-colors hover:text-yellow-500">Shop</Link>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Wishlist</span>
        </nav>

        {/* Header - COMPACT */}
        <div 
          className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <div>
            <h1 className="text-lg font-bold text-white md:text-xl">My Wishlist</h1>
            <p className="text-xs text-gray-400">{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved</p>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {wishlistItems.length > 0 && (
              <>
                <button
                  onClick={handleAddAllToCart}
                  className="relative px-3 py-1.5 overflow-hidden text-xs font-medium text-white transition-all rounded-full group"
                  data-aos="zoom-in"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-1">
                    <FiShoppingCart className="w-3 h-3" />
                    Add All
                  </span>
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="relative px-3 py-1.5 overflow-hidden text-xs font-medium text-white transition-all rounded-full group"
                  data-aos="zoom-in"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-red-600 to-pink-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-1">
                    <FiTrash2 className="w-3 h-3" />
                    Remove ({selectedItems.length})
                  </span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors border border-gray-700 rounded-full hover:text-white hover:border-yellow-500/50"
                  data-aos="zoom-in"
                >
                  <FiX className="inline w-3 h-3 mr-0.5" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Algorithm Stats Summary REMOVED - hidden from users */}

        {/* Select All - COMPACT */}
        {displayItems.length > 0 && (
          <div 
            className="flex items-center gap-1.5 p-2 mb-3 bg-gray-900 border border-gray-700 rounded-lg"
            data-aos="fade-up"
          >
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              onClick={(e) => e.stopPropagation()}
              className="w-3.5 h-3.5 text-yellow-600 bg-gray-700 border-gray-600 rounded cursor-pointer focus:ring-yellow-500 focus:ring-offset-0"
            />
            <label className="text-xs font-medium text-white cursor-pointer" onClick={handleSelectAll}>
              Select All ({displayItems.length} items)
            </label>
          </div>
        )}

        {/* Loading overlay for subsequent loads */}
        {loadingProducts && !initialLoad && (
          <div className="flex justify-center py-4">
            <LoadingSpinner message="Updating wishlist..." size="sm" fullScreen={false} />
          </div>
        )}

        {/* Wishlist Grid - Using ProductCard component */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayItems.map((product, index) => {
            const productId = product._id || product.id;
            
            return (
              <div 
                key={productId}
                className="relative group card-3d"
                data-aos="flip-up"
                data-aos-duration="800"
                data-aos-delay={index * 50}
              >
                {/* Cache Indicator Badge REMOVED - hidden from users */}
                
                {/* Custom remove button overlay - COMPACT */}
                <button
                  onClick={(e) => handleRemove(productId, e)}
                  className="absolute z-50 p-1 transition-all rounded-full shadow-lg -top-1.5 -right-1.5 bg-gray-900 border border-gray-700 hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] group/btn"
                  title="Remove from wishlist"
                  style={{ pointerEvents: 'auto', zIndex: 60 }}
                >
                  <FiTrash2 className="w-3 h-3 text-gray-400 transition-colors group-hover/btn:text-yellow-500" />
                </button>
                
                {/* Checkbox for selection - COMPACT */}
                <div className="absolute z-50 -top-1.5 -left-1.5" style={{ pointerEvents: 'auto', zIndex: 60 }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(productId)}
                    onChange={(e) => handleSelectItem(productId, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 text-yellow-600 bg-gray-700 border-gray-600 rounded cursor-pointer focus:ring-yellow-500 focus:ring-offset-0"
                  />
                </div>
                
                {/* Product Card */}
                <div className="relative card-3d-content">
                  <ProductCard product={product} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Shop - COMPACT */}
        <div 
          className="mt-6 text-center"
          data-aos="fade-up"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-xs text-gray-400 transition-colors group hover:text-yellow-500"
          >
            <FiArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
            Continue Shopping
            <BsArrowRight className="w-3 h-3 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;