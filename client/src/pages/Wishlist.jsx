// src/pages/Wishlist.jsx - COMPLETE FIXED VERSION using ProductCard component
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard'; // ← IMPORT ProductCard
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
import { BsArrowRight, BsLightningCharge } from 'react-icons/bs';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Font styles matching homepage
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .section-title {
    font-weight: 800;
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin-bottom: 0;
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  }
  
  .glow-text:hover {
    text-shadow: 0 0 50px rgba(59, 130, 246, 0.8);
  }
`;

// Animation styles
const animationStyles = `
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
    100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
  }
  
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
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
    transform: translateZ(20px);
  }
`;

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600';

// Wishlist header image - DISTINCT image
const wishlistHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for header bottom transition - indigo/blue/cyan
const headerGradient = "from-indigo-600/20 via-blue-600/20 to-cyan-600/20";

// Top Bar Component (matching homepage)
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-2 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white"
        >
          <FiMapPin className="w-3 h-3" />
          <span>FIND STORE</span>
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs text-gray-400 transition-colors hover:text-white"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

// Normalize product data function (matching ProductCard expectations)
const normalizeProductData = (product) => {
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
    isJustArrived: product.isJustArrived || false
  };
};

const Wishlist = () => {
  const navigate = useNavigate();
  const { 
    wishlistItems, 
    wishlistCount, 
    loading, 
    removeFromWishlist, 
    clearWishlist 
  } = useWishlist();
  const { addToCart } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
      easing: 'ease-out-cubic',
      anchorPlacement: 'top-bottom',
    });
    
    setTimeout(() => {
      AOS.refresh();
    }, 1000);
  }, []);

  // Refresh AOS when wishlist changes
  useEffect(() => {
    setTimeout(() => {
      AOS.refresh();
    }, 500);
  }, [wishlistItems]);

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Update select all when items change
  useEffect(() => {
    if (selectedItems.length === wishlistItems.length && wishlistItems.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, wishlistItems]);

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
    
    // Update selected items
    setSelectedItems(prev => prev.filter(id => id !== productId));
  };

  // Handle select all
  const handleSelectAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item._id || item.id));
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
    
    if (wishlistItems.length === 0) return;

    let successCount = 0;
    for (const product of wishlistItems) {
      const productId = product._id || product.id;
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      const success = await addToCart(product, 1);
      if (success) successCount++;
      
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }

    toast.success(`Added ${successCount} of ${wishlistItems.length} items to cart`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="w-48 h-8 mb-8 bg-gray-800 rounded"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
                  <div className="w-full h-48 mb-4 bg-gray-800 rounded"></div>
                  <div className="w-3/4 h-4 mb-2 bg-gray-800 rounded"></div>
                  <div className="w-1/2 h-4 mb-4 bg-gray-800 rounded"></div>
                  <div className="w-1/3 h-6 bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="container px-4 py-12 mx-auto">
          <div 
            className="max-w-md mx-auto text-center"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
          >
            <div className="relative inline-block mb-6">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600">
                <FiHeart className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full opacity-50 blur-xl"></div>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-white">Your Wishlist is Empty</h1>
            <p className="mb-8 text-gray-400">
              Save items you love to your wishlist and they'll appear here
            </p>
            <Link
              to="/shop"
              className="relative inline-flex items-center gap-2 px-6 py-3 overflow-hidden font-medium text-white transition-all rounded-full group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"></span>
              <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl group-hover:opacity-100"></span>
              <span className="relative flex items-center gap-2">
                <FiShoppingCart className="w-5 h-5" />
                Start Shopping
                <BsArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />

      {/* Wishlist Header Image - with indigo/blue/cyan gradient at bottom */}
      <div 
        className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64"
        data-aos="fade-in"
        data-aos-duration="1500"
        data-aos-delay="200"
        data-aos-once="false"
      >
        <div className="absolute inset-0">
          <img 
            src={wishlistHeaderImage}
            alt="My Wishlist"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          {/* Dark overlay for text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          {/* Bottom gradient - indigo/blue/cyan that transitions to black */}
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          {/* Final black gradient at the very bottom to blend with background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        {/* Header Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
              data-aos-delay="400"
              data-aos-once="false"
            >
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                MY WISHLIST
              </h1>
              <p className="mt-1 text-sm text-gray-300 sm:text-base">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav 
          className="flex items-center gap-2 mb-6 text-sm"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          <Link to="/" className="text-gray-400 transition-colors hover:text-white">Home</Link>
          <FiChevronRight className="w-4 h-4 text-gray-600" />
          <Link to="/shop" className="text-gray-400 transition-colors hover:text-white">Shop</Link>
          <FiChevronRight className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-white">Wishlist</span>
        </nav>

        {/* Header */}
        <div 
          className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="400"
        >
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">My Wishlist</h1>
            <p className="text-gray-400">{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {wishlistItems.length > 0 && (
              <>
                <button
                  onClick={handleAddAllToCart}
                  className="relative px-4 py-2 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
                  data-aos="zoom-in"
                  data-aos-delay="500"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-green-600 to-emerald-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-2">
                    <FiShoppingCart className="w-4 h-4" />
                    Add All to Cart
                  </span>
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="relative px-4 py-2 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
                  data-aos="zoom-in"
                  data-aos-delay="600"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-red-600 to-pink-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-2">
                    <FiTrash2 className="w-4 h-4" />
                    Remove Selected ({selectedItems.length})
                  </span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm font-medium text-gray-400 transition-colors border border-gray-700 rounded-full hover:text-white hover:border-gray-600"
                  data-aos="zoom-in"
                  data-aos-delay="700"
                >
                  <FiX className="inline w-4 h-4 mr-1" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Select All */}
        {wishlistItems.length > 0 && (
          <div 
            className="flex items-center gap-2 p-4 mb-4 bg-gray-900 border border-gray-700 rounded-lg"
            data-aos="fade-up"
            data-aos-delay="800"
          >
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded cursor-pointer focus:ring-indigo-500 focus:ring-offset-0"
            />
            <label className="text-sm font-medium text-white cursor-pointer" onClick={handleSelectAll}>
              Select All ({wishlistItems.length} items)
            </label>
          </div>
        )}

        {/* Wishlist Grid - Using ProductCard component */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((product, index) => {
            const productId = product._id || product.id;
            const normalizedProduct = normalizeProductData(product);
            
            return (
              <div 
                key={productId}
                className="relative group card-3d"
                data-aos="flip-up"
                data-aos-duration="1000"
                data-aos-delay={900 + (index * 100)}
                data-aos-easing="ease-out-cubic"
                data-aos-once="false"
              >
                {/* Custom remove button overlay for wishlist functionality */}
                <button
                  onClick={(e) => handleRemove(productId, e)}
                  className="absolute z-50 p-1.5 transition-all rounded-full shadow-lg -top-2 -right-2 bg-gray-900 border border-gray-700 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] group/btn"
                  title="Remove from wishlist"
                  style={{ pointerEvents: 'auto', zIndex: 60 }}
                >
                  <FiTrash2 className="w-3.5 h-3.5 text-gray-400 transition-colors group-hover/btn:text-indigo-500" />
                </button>
                
                {/* Checkbox for selection */}
                <div className="absolute z-50 -top-2 -left-2" style={{ pointerEvents: 'auto', zIndex: 60 }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(productId)}
                    onChange={(e) => handleSelectItem(productId, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded cursor-pointer focus:ring-indigo-500 focus:ring-offset-0"
                  />
                </div>
                
                {/* Product Card */}
                <div className="relative card-3d-content">
                  <ProductCard product={normalizedProduct} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Shop */}
        <div 
          className="mt-8 text-center"
          data-aos="fade-up"
          data-aos-delay="1200"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-gray-400 transition-colors group hover:text-white"
          >
            <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Continue Shopping
            <BsArrowRight className="w-4 h-4 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;