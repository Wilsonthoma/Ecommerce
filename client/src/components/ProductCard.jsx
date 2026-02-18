// src/components/ProductCard.jsx - FIXED with homepage styling
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiStar, FiHeart } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

// Font styles matching homepage
const fontStyles = `
  .product-card-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
    transition: color 0.3s ease;
    line-height: 1.4;
  }
  
  .product-card-title:hover {
    color: #3B82F6;
  }
  
  .product-card-price {
    font-weight: 600;
    font-size: 1.1rem;
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .product-card-old-price {
    font-weight: 500;
    font-size: 0.8rem;
    color: #9CA3AF;
    text-decoration: line-through;
  }
  
  .product-card-category {
    font-weight: 500;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9CA3AF;
  }
  
  .badge-discount-small {
    background: linear-gradient(135deg, #EF4444, #F59E0B);
    color: white;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }
  
  .badge-featured-small {
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    color: white;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }
  
  .stock-badge {
    font-weight: 500;
    font-size: 0.6rem;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';

const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Safety check
  if (!product) {
    console.error('❌ ProductCard received null product');
    return null;
  }

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useState(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Extract product data
  const productId = product._id || product.id;
  const productName = product.name || 'Product';
  const productPrice = product.price || 0;
  const productDiscountedPrice = product.discountedPrice || product.discountPrice || null;
  const productImage = product.images?.[0]?.url || product.image || null;
  const productImages = product.images || [];
  const productDescription = product.description || '';
  const productCategory = product.category || '';
  const productBrand = product.brand || '';
  const productRating = product.rating || 0;
  const productReviews = product.reviewsCount || product.reviews || 0;
  const productStock = product.stock || product.quantity || 0;
  const productWeight = product.weight || 1;
  const productFeatured = product.featured || false;
  const isOnSale = product.isOnSale || product.discountPercentage > 0 || !!productDiscountedPrice;

  const stockValue = productStock;

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const discountPercentage = productDiscountedPrice && productPrice
    ? Math.round(((productPrice - productDiscountedPrice) / productPrice) * 100)
    : 0;

  const inWishlist = isInWishlist(productId);

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

  const getImageUrl = () => {
    if (imageError) return FALLBACK_IMAGE;
    
    const imagePath = productImage;
    
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

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error('Please login to use wishlist');
      return;
    }
    
    const completeProduct = {
      _id: productId,
      id: productId,
      name: productName,
      price: productPrice,
      discountPrice: productDiscountedPrice,
      discountedPrice: productDiscountedPrice,
      image: productImage,
      images: productImages,
      description: productDescription,
      category: productCategory,
      brand: productBrand,
      rating: productRating,
      reviews: productReviews,
      stock: productStock,
      quantity: productStock,
      weight: productWeight,
      featured: productFeatured,
      isOnSale: isOnSale,
      discountPercentage: discountPercentage
    };
    
    await toggleWishlist(completeProduct);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🛒 ADD TO CART CLICKED for product:', {
      id: productId,
      name: productName,
      price: productPrice
    });
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    const completeProduct = {
      _id: productId,
      id: productId,
      name: productName,
      price: productPrice,
      discountPrice: productDiscountedPrice,
      discountedPrice: productDiscountedPrice,
      image: productImage,
      images: productImages,
      description: productDescription,
      category: productCategory,
      brand: productBrand,
      rating: productRating,
      reviews: productReviews,
      stock: productStock,
      quantity: productStock,
      weight: productWeight,
      featured: productFeatured,
      isOnSale: isOnSale,
      discountPercentage: discountPercentage
    };
    
    console.log('🛒 Sending to cart:', completeProduct);
    
    await addToCart(completeProduct, 1);
  };

  return (
    <>
      <style>{fontStyles}</style>
      <div className="group relative overflow-hidden transition-all duration-300 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-1">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
        
        <div className="relative">
          {/* Product Image Container */}
          <div className="relative w-full overflow-hidden bg-gray-800 aspect-square">
            {/* Loading Skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse">
                <div className="w-8 h-8 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            )}
            
            {/* Image */}
            <img
              src={getImageUrl()}
              alt={productName}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } group-hover:scale-110`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* Wishlist Button */}
            {isLoggedIn && (
              <button
                onClick={handleWishlistToggle}
                className="absolute z-30 p-2 transition-all rounded-full shadow-lg top-2 right-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] group/btn"
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FiHeart
                  className={`w-4 h-4 ${
                    inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/btn:text-red-500'
                  } transition-colors`}
                />
              </button>
            )}
            
            {/* Badges */}
            <div className="absolute flex flex-wrap gap-1 top-2 left-2">
              {discountPercentage > 0 && (
                <span className="badge-discount-small">
                  {discountPercentage}% OFF
                </span>
              )}
              {productFeatured && (
                <span className="badge-featured-small">
                  <FiStar className="inline w-2 h-2 mr-0.5" /> Featured
                </span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="absolute bottom-2 left-2">
              <span className={`stock-badge ${
                stockValue > 10 ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                stockValue > 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                'bg-red-500/20 text-red-500 border border-red-500/30'
              }`}>
                {stockValue > 10 ? 'In Stock' : 
                 stockValue > 0 ? 'Low Stock' : 
                 'Out of Stock'}
              </span>
            </div>

            {/* Mobile Action Buttons */}
            <div className="absolute z-20 flex gap-2 bottom-2 right-2 sm:hidden">
              {isLoggedIn && (
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 text-white transition-all rounded-full shadow-lg ${
                    inWishlist ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                  }`}
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
                </button>
              )}
              
              <Link
                to={`/product/${productId}`}
                className="p-2 text-white transition-all border border-gray-700 rounded-full shadow-lg bg-gradient-to-br from-gray-800 to-gray-900"
                title="View Details"
              >
                <FiEye className="w-4 h-4" />
              </Link>
              
              <button
                onClick={handleAddToCart}
                disabled={stockValue === 0 || cartLoading}
                className="p-2 text-white transition-all rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add to Cart"
              >
                {cartLoading ? (
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <FiShoppingCart className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Desktop Hover Overlay */}
            <div className="absolute inset-0 items-center justify-center hidden gap-2 transition-opacity duration-300 opacity-0 sm:flex bg-black/60 backdrop-blur-sm group-hover:opacity-100">
              {isLoggedIn && (
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 transition-all rounded-full hover:scale-110 ${
                    inWishlist 
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' 
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-gray-400 hover:text-white'
                  }`}
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
                </button>
              )}
              
              <Link
                to={`/product/${productId}`}
                className="p-3 text-gray-400 transition-all border border-gray-700 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 hover:text-white hover:scale-110"
                title="View Details"
              >
                <FiEye className="w-5 h-5" />
              </Link>
              
              <button
                onClick={handleAddToCart}
                disabled={stockValue === 0 || cartLoading}
                className="p-3 text-white transition-all rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add to Cart"
              >
                {cartLoading ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <FiShoppingCart className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-3">
            {/* Category */}
            <div className="mb-1">
              <span className="product-card-category">
                {productCategory || 'Uncategorized'}
              </span>
            </div>
            
            {/* Product Name */}
            <Link to={`/product/${productId}`}>
              <h3 className="product-card-title">
                {productName}
              </h3>
            </Link>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-1 mb-2">
              <div className="flex">
                {renderStars(productRating)}
              </div>
              <span className="text-[8px] text-gray-500">
                ({productReviews})
              </span>
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="product-card-price">
                    {formatKES(productDiscountedPrice || productPrice)}
                  </span>
                  {productDiscountedPrice && (
                    <span className="product-card-old-price">
                      {formatKES(productPrice)}
                    </span>
                  )}
                </div>
                {productDiscountedPrice && (
                  <p className="mt-0.5 text-[8px] text-green-500">
                    Save {formatKES(productPrice - productDiscountedPrice)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;