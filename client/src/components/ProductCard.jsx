// client/src/components/ProductCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiStar } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { wishlistService } from '../services/client/wishlist';
import { cartService } from '../services/client/cart';
import { toast } from 'react-toastify';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';

const ProductCard = ({ product, onAddToCart, showWishlist = true }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Get stock value from either stock or quantity field
  const stockValue = product.stock || product.quantity || 0;
  
  // Get real rating and review count
  const productRating = product.rating || 0;
  const reviewCount = product.reviews || product.reviewCount || 0;

  // Check if product is in wishlist on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const productId = product._id || product.id;
        const response = await wishlistService.checkInWishlist(productId);
        if (response.success) {
          setIsInWishlist(response.inWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };
    
    checkWishlistStatus();
  }, [product._id, product.id]);

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const discountPercentage = product.discountPrice && product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Proper star rendering with half-star support
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating % 1) >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // Full star
        stars.push(
          <AiFillStar
            key={i}
            className="w-3 h-3 text-yellow-400 sm:w-4 sm:h-4"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        // Half star
        stars.push(
          <div key={i} className="relative">
            <AiFillStar className="w-3 h-3 text-gray-300 sm:w-4 sm:h-4" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <AiFillStar className="w-3 h-3 text-yellow-400 sm:w-4 sm:h-4" />
            </div>
          </div>
        );
      } else {
        // Empty star
        stars.push(
          <AiFillStar
            key={i}
            className="w-3 h-3 text-gray-300 sm:w-4 sm:h-4"
          />
        );
      }
    }
    return stars;
  };

  // Construct image URL
  const getImageUrl = () => {
    if (imageError) return FALLBACK_IMAGE;
    
    const imagePath = product.images?.[0]?.url || product.images?.[0] || product.image;
    
    if (!imagePath) return FALLBACK_IMAGE;
    
    if (imagePath.startsWith('http')) return imagePath;
    
    if (imagePath.startsWith('/uploads/')) {
      return `${API_URL}${imagePath}`;
    }
    
    if (imagePath.startsWith('uploads/')) {
      return `${API_URL}/${imagePath}`;
    }
    
    return `${API_URL}/uploads/products/${imagePath}`;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = FALLBACK_IMAGE;
  };

  // ✅ FIXED: Proper add to cart with API
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    setCartLoading(true);
    
    try {
      const productId = product._id || product.id;
      const response = await cartService.addToCart(productId, 1);
      
      if (response.success) {
        toast.success(`${product.name} added to cart!`);
        if (onAddToCart) {
          onAddToCart(product);
        }
      } else {
        toast.error(response.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  // ✅ FIXED: Proper wishlist toggle with API
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    
    setWishlistLoading(true);
    
    try {
      const productId = product._id || product.id;
      
      if (isInWishlist) {
        const response = await wishlistService.removeFromWishlist(productId);
        if (response.success) {
          setIsInWishlist(false);
          toast.success('Removed from wishlist');
        } else {
          toast.error(response.error || 'Failed to remove from wishlist');
        }
      } else {
        const response = await wishlistService.addToWishlist(productId);
        if (response.success) {
          setIsInWishlist(true);
          toast.success('Added to wishlist');
        } else {
          toast.error(response.error || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('An error occurred');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg group rounded-xl hover:shadow-xl hover:-translate-y-1">
      {/* Product Image Container */}
      <div className="relative w-full overflow-hidden bg-gray-100 aspect-square">
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <div className="w-8 h-8 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        )}
        
        {/* Image */}
        <img
          src={getImageUrl()}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } group-hover:scale-110`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold text-white bg-red-500 rounded top-2 left-2 sm:top-3 sm:left-3 shadow-lg z-10">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold text-yellow-800 bg-yellow-100 rounded top-2 left-2 sm:top-3 sm:left-3 shadow-lg z-10">
            <FiStar className="inline w-3 h-3 mr-1" /> Featured
          </div>
        )}
        
        {/* Stock Status */}
        <div className="absolute z-10 top-2 right-2 sm:top-3 sm:right-3">
          <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-xs font-medium rounded-full shadow-lg ${
            stockValue > 10 ? 'bg-green-500 text-white' :
            stockValue > 0 ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {stockValue > 10 ? 'In Stock' : 
             stockValue > 0 ? 'Low Stock' : 
             'Out of Stock'}
          </span>
        </div>
        
        {/* Quick Actions Overlay - Desktop */}
        <div className="absolute inset-0 items-center justify-center hidden gap-1 transition-opacity duration-300 opacity-0 sm:flex sm:gap-2 bg-black/40 group-hover:opacity-100">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={stockValue === 0 || cartLoading}
            className="p-2 transition-all bg-white rounded-full sm:p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
            title="Add to Cart"
          >
            {cartLoading ? (
              <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin sm:w-5 sm:h-5"></div>
            ) : (
              <FiShoppingCart className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5" />
            )}
          </button>
          
          {/* View Details Link */}
          <Link
            to={`/product/${product._id}`}
            className="p-2 transition-all bg-white rounded-full sm:p-3 hover:bg-gray-100 hover:scale-110"
            title="View Details"
          >
            <FiEye className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5" />
          </Link>
          
          {/* Wishlist Button */}
          {showWishlist && (
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className="p-2 transition-all bg-white rounded-full sm:p-3 hover:bg-gray-100 hover:scale-110 disabled:opacity-50"
              title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {wishlistLoading ? (
                <div className="w-4 h-4 border-2 border-red-600 rounded-full border-t-transparent animate-spin sm:w-5 sm:h-5"></div>
              ) : (
                <FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
              )}
            </button>
          )}
        </div>

        {/* Mobile Quick Add Button */}
        <button
          onClick={handleAddToCart}
          disabled={stockValue === 0 || cartLoading}
          className="absolute z-10 p-2 text-white transition-all bg-blue-600 rounded-full shadow-lg bottom-2 right-2 sm:hidden hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Quick Add"
        >
          {cartLoading ? (
            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
          ) : (
            <FiShoppingCart className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Product Info */}
      <div className="p-2 sm:p-3 md:p-4">
        {/* Category */}
        <div className="mb-1 sm:mb-2">
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
            {product.category || 'Uncategorized'}
          </span>
        </div>
        
        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="mb-1 text-xs font-semibold text-gray-900 transition-colors line-clamp-2 sm:text-sm md:text-base hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating - NOW USING REAL DATA */}
        <div className="flex items-center gap-1 mb-2 sm:gap-2 sm:mb-3">
          <div className="flex">
            {renderStars(productRating)}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500">
            ({reviewCount})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-sm font-bold text-gray-900 sm:text-base md:text-xl">
                {formatKES(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                  {formatKES(product.price)}
                </span>
              )}
            </div>
            {product.discountPrice && (
              <p className="mt-0.5 text-[8px] sm:text-xs text-green-600">
                Save {formatKES(product.price - product.discountPrice)}
              </p>
            )}
          </div>
          
          {/* Desktop Quick Add - Hidden on mobile */}
          <button
            onClick={handleAddToCart}
            disabled={stockValue === 0 || cartLoading}
            className="hidden p-1.5 text-white transition-colors bg-blue-600 rounded-lg sm:block hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed sm:p-2"
            title="Quick Add to Cart"
          >
            {cartLoading ? (
              <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin sm:w-4 sm:h-4"></div>
            ) : (
              <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
        
        {/* Brand */}
        {product.brand && (
          <p className="mt-2 text-[8px] text-gray-500 sm:mt-3 sm:text-xs">
            Brand: <span className="font-medium">{product.brand}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;