// client/src/components/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';

const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart, loading: cartLoading } = useCart();

  // Safety check - ensure product exists
  if (!product) {
    console.error('❌ ProductCard received null product');
    return null;
  }

  // Extract product data with all fields
  const productId = product._id || product.id;
  const productName = product.name || 'Product';
  const productPrice = product.price || 0;
  // Backend returns discountedPrice, not discountPrice
  const productDiscountedPrice = product.discountedPrice || product.discountPrice || null;
  const productImage = product.images?.[0]?.url || product.image || null;
  const productImages = product.images || [];
  const productDescription = product.description || '';
  const productCategory = product.category || '';
  const productBrand = product.brand || '';
  // Backend returns rating field
  const productRating = product.rating || 0;
  // Backend doesn't have reviews count in product object
  const productReviews = product.reviewsCount || product.reviews || 0;
  const productStock = product.stock || product.quantity || 0;
  const productWeight = product.weight || 1;
  const productFeatured = product.featured || false;
  // Check if product is on sale
  const isOnSale = product.isOnSale || product.discountPercentage > 0 || !!productDiscountedPrice;

  const stockValue = productStock;

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const discountPercentage = productDiscountedPrice && productPrice
    ? Math.round(((productPrice - productDiscountedPrice) / productPrice) * 100)
    : 0;

  // Proper star rendering - DISPLAY ONLY
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating % 1) >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<AiFillStar key={i} className="w-3 h-3 text-yellow-400 sm:w-4 sm:h-4" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <AiFillStar className="w-3 h-3 text-gray-300 sm:w-4 sm:h-4" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <AiFillStar className="w-3 h-3 text-yellow-400 sm:w-4 sm:h-4" />
            </div>
          </div>
        );
      } else {
        stars.push(<AiFillStar key={i} className="w-3 h-3 text-gray-300 sm:w-4 sm:h-4" />);
      }
    }
    return stars;
  };

  // Construct image URL
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

  // Add to cart using context with complete product data
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
    
    // Create complete product object with all fields
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
          alt={productName}
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
        {productFeatured && (
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

        {/* Mobile Action Buttons */}
        <div className="absolute z-20 flex gap-2 bottom-2 right-2 sm:hidden">
          {/* View Details Button */}
          <Link
            to={`/product/${productId}`}
            className="p-2 text-white transition-all bg-gray-800 rounded-full shadow-lg hover:bg-gray-900"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </Link>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={stockValue === 0 || cartLoading}
            className="p-2 text-white transition-all bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="absolute inset-0 items-center justify-center hidden gap-2 transition-opacity duration-300 opacity-0 sm:flex bg-black/40 group-hover:opacity-100">
          {/* View Details Button */}
          <Link
            to={`/product/${productId}`}
            className="p-3 transition-all bg-white rounded-full hover:bg-gray-100 hover:scale-110"
            title="View Details"
          >
            <FiEye className="w-5 h-5 text-gray-700" />
          </Link>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={stockValue === 0 || cartLoading}
            className="p-3 transition-all bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
            title="Add to Cart"
          >
            {cartLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            ) : (
              <FiShoppingCart className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-2 sm:p-3 md:p-4">
        {/* Category */}
        <div className="mb-1 sm:mb-2">
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
            {productCategory || 'Uncategorized'}
          </span>
        </div>
        
        {/* Product Name */}
        <Link to={`/product/${productId}`}>
          <h3 className="mb-1 text-xs font-semibold text-gray-900 transition-colors line-clamp-2 sm:text-sm md:text-base hover:text-blue-600">
            {productName}
          </h3>
        </Link>
        
        {/* Rating - DISPLAY ONLY */}
        <div className="flex items-center gap-1 mb-2 sm:gap-2 sm:mb-3">
          <div className="flex">
            {renderStars(productRating)}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500">
            ({productReviews})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-sm font-bold text-gray-900 sm:text-base md:text-xl">
                {formatKES(productDiscountedPrice || productPrice)}
              </span>
              {productDiscountedPrice && (
                <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                  {formatKES(productPrice)}
                </span>
              )}
            </div>
            {productDiscountedPrice && (
              <p className="mt-0.5 text-[8px] sm:text-xs text-green-600">
                Save {formatKES(productPrice - productDiscountedPrice)}
              </p>
            )}
          </div>
        </div>
        
        {/* Brand */}
        {productBrand && (
          <p className="mt-2 text-[8px] text-gray-500 sm:mt-3 sm:text-xs">
            Brand: <span className="font-medium">{productBrand}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;