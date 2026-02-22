// src/components/ProductCard.jsx - FIXED with proper variable ordering
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiHeart } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

// Font styles matching homepage EXACTLY
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  .product-card {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .product-card-title {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    color: #FFFFFF;
    line-height: 1.4;
    margin-bottom: 0.25rem;
    letter-spacing: -0.01em;
    transition: color 0.2s ease;
  }
  
  .product-card-title:hover {
    color: #60A5FA;
  }
  
  .product-card-price {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }
  
  .product-card-price-discounted {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    background: linear-gradient(135deg, #60A5FA, #C084FC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .product-card-old-price {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.8rem;
    color: #9CA3AF;
    text-decoration: line-through;
    margin-left: 0.25rem;
  }
  
  .product-card-category {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9CA3AF;
  }
  
  .badge-discount-card {
    background: linear-gradient(135deg, #EF4444, #F59E0B);
    color: white;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
    text-transform: uppercase;
  }
  
  .badge-featured-card {
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    color: white;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.15rem;
  }
  
  .stock-badge-card {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.6rem;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    backdrop-filter: blur(4px);
  }
  
  .stock-badge-card.in-stock {
    background: rgba(16, 185, 129, 0.15);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  .stock-badge-card.low-stock {
    background: rgba(245, 158, 11, 0.15);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  .stock-badge-card.out-of-stock {
    background: rgba(239, 68, 68, 0.15);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  .product-rating-count {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.6rem;
    color: #6B7280;
  }
  
  .product-save-text {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.6rem;
    color: #10B981;
    margin-top: 0.15rem;
  }
`;

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    console.log('🔐 Login status:', !!token);
  }, []);

  // Safety check
  if (!product) {
    console.error('❌ ProductCard received null product');
    return null;
  }

  // DEBUG: Log the product to see what we're working with
  console.log('🔍 ProductCard rendering:', {
    id: product._id || product.id,
    name: product.name,
    quantity: product.quantity,
    stock: product.stock,
    price: product.price
  });

  // Extract product data with fallbacks for all fields
  const productId = product._id || product.id;
  const productName = product.name || 'Product Name';
  const productPrice = product.price || 0;
  const productComparePrice = product.comparePrice || null;
  const productCategory = product.category || '';
  const productRating = product.rating || 0;
  const productReviews = product.reviewsCount || product.reviews || 0;
  
  // CRITICAL FIX: Get stock from either quantity or stock field
  const productStock = product.quantity !== undefined ? product.quantity : 
                      (product.stock !== undefined ? product.stock : 10);
  
  const productFeatured = product.featured || false;
  const productIsTrending = product.isTrending || false;
  const productIsFlashSale = product.isFlashSale || false;
  const productIsJustArrived = product.isJustArrived || false;
  
  // Check if product has discount
  const hasDiscount = productComparePrice && productComparePrice > productPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((productComparePrice - productPrice) / productComparePrice) * 100)
    : 0;

  // ============ FIXED: Move these before they're used in the JSX ============
  // Determine stock status
  const isInStock = productStock > 0;
  const stockStatus = productStock > 10 ? 'in-stock' : 
                      productStock > 0 ? 'low-stock' : 
                      'out-of-stock';
  // ===========================================================================

  // Get image URL from various possible fields
  const getImageUrl = () => {
    if (imageError) return FALLBACK_IMAGE;
    
    let imagePath = null;
    
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      imagePath = typeof firstImage === 'object' ? firstImage.url : firstImage;
    } else if (product.image) {
      imagePath = product.image;
    } else if (product.primaryImage) {
      imagePath = product.primaryImage;
    } else if (product.thumbnail) {
      imagePath = product.thumbnail;
    }
    
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

  const inWishlist = isInWishlist(productId);

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating % 1) >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<AiFillStar key={i} className="w-3 h-3 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <AiFillStar className="w-3 h-3 text-gray-600" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <AiFillStar className="w-3 h-3 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<AiFillStar key={i} className="w-3 h-3 text-gray-600" />);
      }
    }
    return stars;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = FALLBACK_IMAGE;
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('💖 Wishlist button clicked for:', productName);
    
    if (!isLoggedIn) {
      toast.error('Please login to use wishlist');
      return;
    }
    
    const completeProduct = {
      _id: productId,
      id: productId,
      name: productName,
      price: productPrice,
      comparePrice: productComparePrice,
      image: getImageUrl(),
      images: product.images || [],
      category: productCategory,
      rating: productRating,
      reviewsCount: productReviews,
      quantity: productStock,
      stock: productStock,
      featured: productFeatured,
      isTrending: productIsTrending,
      isFlashSale: productIsFlashSale,
      isJustArrived: productIsJustArrived
    };
    
    await toggleWishlist(completeProduct);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🛒 CART BUTTON CLICKED for product:', {
      id: productId,
      name: productName,
      price: productPrice,
      stock: productStock,
      timestamp: new Date().toISOString()
    });
    
    // Force enable for testing - REMOVE THIS AFTER DEBUGGING
    const forceEnable = true;
    
    if (!forceEnable && !isInStock) {
      console.log('❌ Product out of stock, cannot add to cart');
      toast.error('Product is out of stock');
      return;
    }
    
    const token = localStorage.getItem('token');
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'no token');
    
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    setIsAdding(true);
    
    try {
      const completeProduct = {
        _id: productId,
        id: productId,
        name: productName,
        price: productPrice,
        comparePrice: productComparePrice,
        image: getImageUrl(),
        images: product.images || [],
        category: productCategory,
        rating: productRating,
        reviewsCount: productReviews,
        quantity: productStock,
        stock: productStock,
        featured: productFeatured,
        isTrending: productIsTrending,
        isFlashSale: productIsFlashSale,
        isJustArrived: productIsJustArrived
      };
      
      console.log('📤 Calling addToCart with product:', completeProduct);
      
      const result = await addToCart(completeProduct, 1);
      
      console.log('✅ addToCart result:', result);
      console.log('✅ Product added to cart successfully');
      
      toast.success(`${productName} added to cart!`, {
        icon: '🛒',
        duration: 2000
      });
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      console.error('❌ Error details:', error.message, error.stack);
      toast.error('Failed to add to cart: ' + (error.message || 'Unknown error'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('👁️ View details clicked for:', productName);
    navigate(`/product/${productId}`);
  };

  // DEBUG: Test if button is being rendered
  console.log('🔧 Rendering cart button for:', productName, 'isInStock:', isInStock);

  return (
    <>
      <style>{fontStyles}</style>
      <div className="product-card group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] hover:-translate-y-1">
        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-purple-600/0 group-hover:from-blue-600/20 group-hover:via-blue-600/20 group-hover:to-purple-600/20 rounded-xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
        
        <div className="relative flex flex-col h-full">
          {/* Image Container - Full width */}
          <div className="relative w-full overflow-hidden bg-gray-800 aspect-square">
            {/* Loading Skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            )}
            
            {/* Product Image - Cover the whole container */}
            <img
              src={getImageUrl()}
              alt={productName}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 cursor-pointer ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              } group-hover:scale-110`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={handleViewDetails}
              loading="lazy"
            />
            
            {/* Gradient Overlay for better text visibility */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
            
            {/* Top Badges */}
            <div className="absolute z-10 flex flex-wrap gap-2 top-3 left-3">
              {hasDiscount && (
                <span className="badge-discount-card">
                  -{discountPercentage}%
                </span>
              )}
              {productFeatured && (
                <span className="badge-featured-card">
                  <FiEye className="w-2.5 h-2.5 mr-0.5" /> Featured
                </span>
              )}
              {productIsTrending && (
                <span className="badge-featured-card" style={{background: 'linear-gradient(135deg, #8B5CF6, #EC4899)'}}>
                  Trending
                </span>
              )}
              {productIsFlashSale && (
                <span className="badge-discount-card" style={{background: 'linear-gradient(135deg, #F59E0B, #EF4444)'}}>
                  Flash
                </span>
              )}
              {productIsJustArrived && (
                <span className="badge-featured-card" style={{background: 'linear-gradient(135deg, #10B981, #3B82F6)'}}>
                  New
                </span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="absolute z-10 bottom-3 left-3">
              <span className={`stock-badge-card ${stockStatus}`}>
                {productStock > 10 ? 'In Stock' : 
                 productStock > 0 ? `${productStock} left` : 
                 'Out of Stock'}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute z-30 flex gap-2 bottom-3 right-3">
              {/* Wishlist Button */}
              {isLoggedIn && (
                <button
                  onClick={handleWishlistToggle}
                  className="p-2 transition-all border border-gray-700 rounded-full bg-gray-900/80 backdrop-blur-sm hover:border-red-500/50 hover:scale-110"
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 40 }}
                >
                  <FiHeart
                    className={`w-4 h-4 ${
                      inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-red-500'
                    } transition-colors`}
                  />
                </button>
              )}
              
              {/* View Details Button */}
              <button
                onClick={handleViewDetails}
                className="p-2 transition-all border border-gray-700 rounded-full bg-gray-900/80 backdrop-blur-sm hover:border-blue-500/50 hover:scale-110"
                title="View Details"
                style={{ pointerEvents: 'auto', position: 'relative', zIndex: 40 }}
              >
                <FiEye className="w-4 h-4 text-white" />
              </button>
              
              {/* Cart Button */}
              <button
                id={`cart-btn-${productId}`}
                data-product-id={productId}
                onClick={handleAddToCart}
                disabled={!isInStock || isAdding}
                className={`p-2 rounded-full transition-all hover:scale-110 ${
                  isInStock && !isAdding
                    ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
                title={!isInStock ? 'Out of Stock' : 'Add to Cart'}
                style={{ pointerEvents: 'auto', position: 'relative', zIndex: 40 }}
              >
                {isAdding ? (
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <FiShoppingCart className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
          
          {/* Product Info - Clickable to product page */}
          <div className="flex-1 p-3 bg-gray-900 cursor-pointer" onClick={handleViewDetails}>
            {/* Category */}
            {productCategory && (
              <div className="mb-1">
                <span className="product-card-category">
                  {productCategory}
                </span>
              </div>
            )}
            
            {/* Product Name */}
            <h3 className="product-card-title line-clamp-2 hover:text-blue-500">
              {productName}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-1 mb-2">
              <div className="flex">
                {renderStars(productRating)}
              </div>
              <span className="product-rating-count">
                ({productReviews})
              </span>
            </div>
            
            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-1">
              {hasDiscount ? (
                <>
                  <span className="product-card-price-discounted">
                    {formatKES(productPrice)}
                  </span>
                  <span className="product-card-old-price">
                    {formatKES(productComparePrice)}
                  </span>
                </>
              ) : (
                <span className="product-card-price">
                  {formatKES(productPrice)}
                </span>
              )}
            </div>
            
            {/* Savings */}
            {hasDiscount && (
              <p className="product-save-text">
                Save {formatKES(productComparePrice - productPrice)}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;