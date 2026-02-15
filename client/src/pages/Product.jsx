// client/src/pages/Product.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiHeart, 
  FiShare2, 
  FiTruck, 
  FiShield, 
  FiRefreshCw,
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiMinus,
  FiPlus,
  FiX,
  FiZoomIn,
  FiStar,
  FiClock,
  FiGlobe,
  FiPackage,
  FiDollarSign,
  FiBox,
  FiLayers,
  FiUser,
  FiCalendar,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { clientProductService } from '../services/client/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext'; // ✅ ADDED

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, refreshCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist(); // ✅ ADDED
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  // Rating and review states
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewPagination, setReviewPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Get stock value from either stock or quantity field
  const getStockValue = (product) => {
    return product?.stock || product?.quantity || 0;
  };

  // Format KES currency
  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  // Construct full image URL
  const getFullImageUrl = (imagePath) => {
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

  // Extract all product images
  const getProductImages = (product) => {
    if (!product) return [];
    
    let images = [];
    
    if (product.images && Array.isArray(product.images)) {
      images = product.images.map(img => {
        if (img && typeof img === 'object' && img.url) {
          return {
            url: getFullImageUrl(img.url),
            isPrimary: img.isPrimary || false,
            altText: img.altText || product.name
          };
        }
        if (typeof img === 'string') {
          return {
            url: getFullImageUrl(img),
            isPrimary: false,
            altText: product.name
          };
        }
        return null;
      }).filter(Boolean);
    } else if (product.image) {
      images = [{
        url: getFullImageUrl(product.image),
        isPrimary: true,
        altText: product.name
      }];
    }
    
    if (images.length === 0) {
      images = [{
        url: FALLBACK_IMAGE,
        isPrimary: true,
        altText: product.name
      }];
    }
    
    return images;
  };

  // Render stars for display
  const renderStars = (rating, size = "w-3 h-3 md:w-4 md:h-4") => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating % 1) >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<AiFillStar key={i} className={`${size} text-yellow-400`} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <AiFillStar className={`${size} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <AiFillStar className={`${size} text-yellow-400`} />
            </div>
          </div>
        );
      } else {
        stars.push(<AiFillStar key={i} className={`${size} text-gray-300`} />);
      }
    }
    return stars;
  };

  // Rating Stars Component for interactive rating
  const RatingStars = ({ interactive = false, size = "w-4 h-4 md:w-5 md:h-5" }) => {
    const stars = [];
    const currentRating = interactive ? (hoverRating || userRating) : (product?.rating || 0);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => interactive && setUserRating(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
        >
          <AiFillStar
            className={`${size} ${
              i <= currentRating
                ? 'text-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  useEffect(() => {
    fetchProductData();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      const response = await clientProductService.getProduct(id);
      console.log('📥 Product response:', response);
      
      if (response.success) {
        const productData = response.product || response.data;
        setProduct(productData);
        setRelatedProducts(response.relatedProducts || []);
      } else {
        toast.error('Product not found');
        navigate('/shop');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (page = 1) => {
    try {
      const response = await clientProductService.getProductReviews(id, page, 10);
      console.log('📥 Reviews response:', response);
      
      if (response.success) {
        setReviews(response.reviews || []);
        setRatingDistribution(response.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        setReviewPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Calculate total price based on quantity
  const calculateTotalPrice = () => {
    if (!product) return 0;
    const basePrice = product.discountedPrice || product.price;
    return basePrice * quantity;
  };

  // Calculate savings
  const calculateSavings = () => {
    if (!product || !product.discountedPrice) return 0;
    return (product.price - product.discountedPrice) * quantity;
  };

  // Calculate shipping cost
  const calculateShippingCost = () => {
    if (!product) return 0;
    if (product.freeShipping) return 0;
    if (product.flatShippingRate) return product.flatShippingRate;
    
    switch (shippingMethod) {
      case 'express':
        return 500;
      case 'overnight':
        return 1500;
      default:
        return 0;
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    const success = await addToCart(product, quantity);
    if (success) {
      await refreshCart();
    }
    setIsAddingToCart(false);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to use wishlist');
      navigate('/login');
      return;
    }
    
    await toggleWishlist(product);
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }

    if (!userRating) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmittingReview(true);
    
    try {
      const reviewData = {
        rating: userRating,
        comment: reviewText.trim()
      };

      let response;
      if (editingReview) {
        response = await clientProductService.updateReview(editingReview._id, reviewData);
      } else {
        response = await clientProductService.addProductReview(id, reviewData);
      }

      console.log('📥 Review submission response:', response);

      if (response.success) {
        toast.success(editingReview ? 'Review updated successfully!' : 'Review added successfully!');
        setUserRating(0);
        setReviewText('');
        setShowReviewForm(false);
        setEditingReview(null);
        fetchReviews();
        fetchProductData();
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle edit review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setUserRating(review.rating);
    setReviewText(review.comment);
    setShowReviewForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await clientProductService.deleteReview(reviewId);
      
      if (response.success) {
        toast.success('Review deleted successfully');
        fetchReviews();
        fetchProductData();
      } else {
        toast.error(response.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-4 bg-gray-50 md:py-8">
        <div className="container px-3 mx-auto md:px-4">
          <div className="animate-pulse">
            <div className="w-24 h-3 mb-4 bg-gray-200 rounded md:h-4 md:w-32 md:mb-6"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
              <div className="bg-gray-200 rounded-lg aspect-square md:rounded-xl"></div>
              <div className="space-y-3 md:space-y-4">
                <div className="w-3/4 h-4 bg-gray-200 rounded md:h-6"></div>
                <div className="w-1/2 h-3 bg-gray-200 rounded md:h-4"></div>
                <div className="w-1/3 h-6 bg-gray-200 rounded md:h-8"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded md:h-3"></div>
                  <div className="h-2 bg-gray-200 rounded md:h-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const productImages = getProductImages(product);
  const stockValue = getStockValue(product);
  const discountedPrice = product.discountedPrice || product.price;
  const originalPrice = product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) 
    : 0;
  
  const totalPrice = calculateTotalPrice();
  const totalSavings = calculateSavings();
  const shippingCost = calculateShippingCost();
  const grandTotal = totalPrice + shippingCost;

  // Calculate rating summary
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : product.rating?.toFixed(1) || '0.0';

  // Check if product is in wishlist
  const inWishlist = isInWishlist(product._id || product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-3 py-4 mx-auto md:px-4 md:py-8">
        {/* Breadcrumb - responsive */}
        <nav className="flex items-center gap-1 mb-4 text-xs text-gray-600 md:gap-2 md:mb-6 md:text-sm">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 whitespace-nowrap">Home</button>
          <FiChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          <button onClick={() => navigate('/shop')} className="hover:text-blue-600 whitespace-nowrap">Shop</button>
          <FiChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          <span className="font-medium text-gray-900 truncate">{product.name}</span>
        </nav>

        {/* Product Main Section - Fixed 2-column layout for all screens */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
          {/* Left Column - Images (always 50% width) */}
          <div className="space-y-2 md:space-y-3">
            {/* Main Image */}
            <div className="relative overflow-hidden bg-white border border-gray-200 rounded-lg aspect-square md:rounded-xl">
              {productImages.length > 0 && !imageErrors[selectedImageIndex] ? (
                <img
                  src={productImages[selectedImageIndex]?.url}
                  alt={productImages[selectedImageIndex]?.altText || product.name}
                  className="object-contain w-full h-full cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                  onError={() => handleImageError(selectedImageIndex)}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <img
                    src={FALLBACK_IMAGE}
                    alt="Fallback"
                    className="object-contain w-2/3 opacity-50 h-2/3"
                  />
                </div>
              )}
              
              {/* Zoom Indicator */}
              {productImages.length > 0 && !imageErrors[selectedImageIndex] && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute p-1.5 bg-white rounded-full shadow-md bottom-2 right-2 md:p-2 hover:bg-gray-100"
                  title="Zoom image"
                >
                  <FiZoomIn className="w-3 h-3 text-gray-700 md:w-4 md:h-4" />
                </button>
              )}

              {/* Wishlist Button on Image */}
              {isLoggedIn && (
                <button
                  onClick={handleWishlistToggle}
                  className="absolute p-2 transition-transform bg-white rounded-full shadow-md top-2 right-2 hover:scale-110"
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart
                    className={`w-5 h-5 ${
                      inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>
              )}

              {/* Badges */}
              <div className="absolute flex gap-1 top-2 left-2 md:gap-2">
                {hasDiscount && (
                  <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded md:px-2 md:py-1">
                    {discountPercentage}% OFF
                  </span>
                )}
                {product.featured && (
                  <span className="px-1.5 py-0.5 text-xs font-bold text-yellow-800 bg-yellow-100 rounded md:px-2 md:py-1">
                    <FiStar className="inline w-2 h-2 mr-0.5 md:w-3 md:h-3" /> Featured
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-1 md:gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden bg-white border rounded-lg transition-all aspect-square ${
                      selectedImageIndex === index 
                        ? 'border-blue-600 ring-1 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} - view ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => e.target.src = FALLBACK_IMAGE}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Details (always 50% width) */}
          <div className="space-y-3 md:space-y-4">
            {/* Category and Title */}
            <div>
              <div className="flex flex-wrap items-center gap-1 mb-1 md:gap-2">
                <span className="px-1.5 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full md:px-2 md:py-1">
                  {product.category || 'Uncategorized'}
                </span>
                {product.featured && (
                  <span className="px-1.5 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full md:px-2 md:py-1">
                    <FiStar className="inline w-2 h-2 mr-0.5" /> Featured
                  </span>
                )}
              </div>
              <h1 className="text-lg font-bold text-gray-900 md:text-xl lg:text-2xl">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(parseFloat(averageRating))}
              </div>
              <span className="text-xs text-gray-600 md:text-sm">
                {averageRating} ({totalReviews})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900 md:text-2xl">
                {formatKES(totalPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-gray-400 line-through md:text-sm">
                    {formatKES(originalPrice * quantity)}
                  </span>
                  <span className="px-1 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Per-unit price */}
            {hasDiscount && (
              <div className="text-xs text-gray-600">
                {quantity} × {formatKES(discountedPrice)} per unit
                <span className="ml-2 font-medium text-green-600">
                  Save {formatKES(totalSavings)}
                </span>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {stockValue > 0 ? (
                <>
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">In Stock</span>
                  <span className="text-gray-600">({stockValue} units)</span>
                </>
              ) : (
                <>
                  <FiMinus className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm leading-relaxed text-gray-700 line-clamp-3 md:line-clamp-4">
                {product.description || 'No description available.'}
              </p>
            </div>

            {/* Quantity and Actions */}
            {stockValue > 0 && (
              <div className="pt-2 space-y-3 border-t border-gray-200">
                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 md:px-3"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-sm font-medium text-center md:w-10">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(stockValue, prev + 1))}
                      disabled={quantity >= stockValue}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 md:px-3"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={stockValue === 0 || isAddingToCart}
                    className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 md:py-2.5"
                  >
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => navigate('/checkout')}
                    disabled={stockValue === 0}
                    className="flex-1 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 md:py-2.5"
                  >
                    Buy Now
                  </button>
                </div>
                
                {/* Wishlist Button - Using WishlistContext */}
                <button
                  onClick={handleWishlistToggle}
                  className="flex items-center justify-center w-full gap-2 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 md:py-2.5"
                >
                  <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            )}

            {/* Shipping Info */}
            {product.requiresShipping !== false && (
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 md:p-4">
                <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold md:text-base">
                  <FiTruck className="w-4 h-4 text-blue-600" />
                  Shipping Information
                </h3>
                
                <div className="space-y-1 text-xs md:text-sm">
                  {product.freeShipping && (
                    <div className="flex items-center text-green-600">
                      <FiCheck className="w-3 h-3 mr-1" />
                      <span>Free Shipping</span>
                    </div>
                  )}
                  
                  {product.flatShippingRate > 0 && !product.freeShipping && (
                    <div className="flex items-center text-gray-700">
                      <FiDollarSign className="w-3 h-3 mr-1 text-gray-500" />
                      <span>Flat Rate: {formatKES(product.flatShippingRate)}</span>
                    </div>
                  )}
                  
                  {product.weight > 0 && (
                    <div className="flex items-center text-gray-700">
                      <FiBox className="w-3 h-3 mr-1 text-gray-500" />
                      <span>{product.weight}{product.weightUnit}</span>
                    </div>
                  )}
                  
                  {product.estimatedDeliveryMin && product.estimatedDeliveryMax && (
                    <div className="flex items-center text-gray-700">
                      <FiClock className="w-3 h-3 mr-1 text-gray-500" />
                      <span>{product.estimatedDeliveryMin}-{product.estimatedDeliveryMax} days</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info Icons - 2x2 grid that becomes 4x1 on larger screens */}
            <div className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-4 md:gap-3">
              <div className="flex flex-col items-center p-2 text-center rounded-lg bg-gray-50">
                <FiTruck className="w-4 h-4 mb-1 text-blue-600" />
                <span className="text-xs font-medium">Free Shipping</span>
                <span className="text-[10px] text-gray-500">Over 6K</span>
              </div>
              <div className="flex flex-col items-center p-2 text-center rounded-lg bg-gray-50">
                <FiShield className="w-4 h-4 mb-1 text-blue-600" />
                <span className="text-xs font-medium">2 Year</span>
                <span className="text-[10px] text-gray-500">Warranty</span>
              </div>
              <div className="flex flex-col items-center p-2 text-center rounded-lg bg-gray-50">
                <FiRefreshCw className="w-4 h-4 mb-1 text-blue-600" />
                <span className="text-xs font-medium">30-Day</span>
                <span className="text-[10px] text-gray-500">Returns</span>
              </div>
              <div className="flex flex-col items-center p-2 text-center rounded-lg bg-gray-50">
                <FiShare2 className="w-4 h-4 mb-1 text-blue-600" />
                <span className="text-xs font-medium">24/7</span>
                <span className="text-[10px] text-gray-500">Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Full width */}
        <div className="mt-6 md:mt-8 lg:mt-12">
          <h2 className="mb-3 text-lg font-bold md:text-xl">Customer Reviews</h2>
          
          {/* Rating Summary */}
          <div className="p-3 mb-4 bg-white border border-gray-200 rounded-lg md:p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Average Rating */}
              <div className="text-center md:text-left md:w-1/4">
                <div className="text-2xl font-bold md:text-3xl">{averageRating}</div>
                <div className="flex justify-center mt-1 md:justify-start">
                  {renderStars(parseFloat(averageRating), "w-4 h-4")}
                </div>
                <p className="mt-1 text-xs text-gray-600">{totalReviews} reviews</p>
              </div>
              
              {/* Rating Distribution - visible on all screens */}
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-2 text-xs">{star}</span>
                    <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs">{ratingDistribution[star]}</span>
                  </div>
                ))}
              </div>
              
              {/* Write Review Button */}
              <div className="text-center md:text-right md:w-1/5">
                {!showReviewForm ? (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast.error('Please login to write a review');
                        navigate('/login');
                        return;
                      }
                      setShowReviewForm(true);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 md:w-auto"
                  >
                    Write Review
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 md:w-auto"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="p-3 mb-4 bg-white border border-gray-200 rounded-lg md:p-4">
              <h3 className="mb-3 text-sm font-semibold md:text-base">
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </h3>
              
              <div className="mb-3">
                <RatingStars interactive={true} size="w-5 h-5" />
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 mb-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                placeholder="Share your experience with this product..."
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setUserRating(0);
                    setReviewText('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingReview ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      {editingReview ? 'Updating...' : 'Submitting...'}
                    </span>
                  ) : (
                    editingReview ? 'Update Review' : 'Submit Review'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-3 md:space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id || review.id} className="p-3 bg-white border border-gray-200 rounded-lg md:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full md:w-10 md:h-10">
                        <FiUser className="w-4 h-4 text-blue-600 md:w-5 md:h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold md:text-base">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.verified && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                          <FiCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {isLoggedIn && currentUser && currentUser.name === review.userName && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-1 text-gray-500 rounded hover:text-blue-600 hover:bg-blue-50"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-1 text-gray-500 rounded hover:text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(review.rating, "w-3 h-3")}
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-white border border-gray-200 rounded-lg md:py-12">
                <FiStar className="w-8 h-8 mx-auto mb-2 text-gray-400 md:w-12 md:h-12" />
                <h3 className="mb-1 text-sm font-semibold md:text-base">No reviews yet</h3>
                <p className="text-xs text-gray-500">Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-6 md:mt-8 lg:mt-12">
            <h2 className="mb-3 text-lg font-bold md:text-xl">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {relatedProducts.map((relatedProduct) => {
                const relatedImage = relatedProduct.images?.[0]?.url || relatedProduct.image || FALLBACK_IMAGE;
                
                return (
                  <div
                    key={relatedProduct._id || relatedProduct.id}
                    onClick={() => {
                      navigate(`/product/${relatedProduct._id || relatedProduct.id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md"
                  >
                    <div className="bg-gray-100 aspect-square">
                      <img
                        src={getFullImageUrl(relatedImage)}
                        alt={relatedProduct.name}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        onError={(e) => e.target.src = FALLBACK_IMAGE}
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs font-medium line-clamp-2 md:text-sm">{relatedProduct.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(relatedProduct.rating || 0, "w-2 h-2 md:w-3 md:h-3")}
                      </div>
                      <p className="text-sm font-bold text-blue-600 md:text-base">
                        {formatKES(relatedProduct.discountedPrice || relatedProduct.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div 
            className="relative bg-white rounded-lg shadow-2xl w-[90%] sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute p-2 bg-white rounded-full shadow-lg -top-3 -right-3 hover:bg-gray-100"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="p-4">
              <div className="relative aspect-square">
                <img
                  src={productImages[selectedImageIndex]?.url}
                  alt={product.name}
                  className="object-contain w-full h-full"
                  onError={() => handleImageError(selectedImageIndex)}
                />
              </div>

              {productImages.length > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : productImages.length - 1)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {selectedImageIndex + 1} / {productImages.length}
                  </span>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev < productImages.length - 1 ? prev + 1 : 0)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 text-center border-t">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-sm text-gray-600">{formatKES(product.discountedPrice || product.price)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;