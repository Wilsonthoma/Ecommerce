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

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, refreshCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
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
  const renderStars = (rating, size = "w-4 h-4") => {
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
  const RatingStars = ({ interactive = false, size = "w-8 h-8" }) => {
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
        
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsInWishlist(wishlist.includes(productData._id || productData.id));
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
        fetchReviews(); // Refresh reviews
        fetchProductData(); // Refresh product to get updated rating
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
        fetchReviews(); // Refresh reviews
        fetchProductData(); // Refresh product to get updated rating
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="w-1/4 h-4 mb-6 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="bg-gray-200 rounded-2xl" style={{ height: '350px' }}></div>
              <div className="space-y-4">
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
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

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-xs text-gray-600 sm:text-sm">
          <button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button>
          <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          <button onClick={() => navigate('/shop')} className="hover:text-blue-600">Shop</button>
          <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[300px]">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative overflow-hidden bg-white border border-gray-200 rounded-xl" style={{ height: '350px' }}>
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
                  className="absolute p-1.5 transition-colors bg-white rounded-full shadow-md bottom-2 right-2 hover:bg-gray-100 sm:p-2"
                  title="Zoom image"
                >
                  <FiZoomIn className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-lg top-3 left-3 sm:px-3 sm:py-1.5 sm:text-sm">
                  {discountPercentage}% OFF
                </div>
              )}

              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute px-2 py-1 text-xs font-bold text-yellow-800 bg-yellow-100 rounded-lg top-3 right-3 sm:px-3 sm:py-1.5">
                  <FiStar className="inline w-3 h-3 mr-1" /> Featured
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden bg-white border-2 rounded-lg transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-600 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ height: '70px' }}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} - view ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full sm:px-3 sm:py-1">
                  {product.category || 'Uncategorized'}
                </span>
                {product.featured && (
                  <span className="px-2 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full sm:px-3 sm:py-1">
                    <FiStar className="inline w-3 h-3 mr-1" /> Featured
                  </span>
                )}
              </div>
              <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{product.name}</h1>
            </div>

            {/* Rating Display */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(parseFloat(averageRating), "w-5 h-5")}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Dynamic Price Display */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  KSh {Math.round(totalPrice).toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through sm:text-lg">
                      KSh {Math.round(originalPrice * quantity).toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded sm:px-2 sm:py-1">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>
              
              {/* Show per-unit price and total savings */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  {quantity} × KSh {Math.round(discountedPrice).toLocaleString()} per unit
                </span>
                {hasDiscount && totalSavings > 0 && (
                  <span className="font-medium text-green-600">
                    Save KSh {Math.round(totalSavings).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {stockValue > 0 ? (
                <>
                  <FiCheck className="w-4 h-4 text-green-600 sm:w-5 sm:h-5" />
                  <span className="font-medium text-green-600">In Stock</span>
                  <span className="text-gray-600">
                    ({stockValue} units available)
                  </span>
                </>
              ) : (
                <>
                  <FiMinus className="w-4 h-4 text-red-600 sm:w-5 sm:h-5" />
                  <span className="font-medium text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                {product.description || 'No description available.'}
              </p>
            </div>

            {/* Quantity Selector */}
            {stockValue > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <h2 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">Quantity</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="px-2 py-1.5 text-gray-600 transition-colors hover:text-blue-600 hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:py-2"
                    >
                      <FiMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <span className="w-10 text-sm font-medium text-center text-gray-900 sm:w-12 sm:text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(stockValue, prev + 1))}
                      disabled={quantity >= stockValue}
                      className="px-2 py-1.5 text-gray-600 transition-colors hover:text-blue-600 hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:py-2"
                    >
                      <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-600 sm:text-sm">
                    Max: {stockValue} units
                  </span>
                </div>
                
                {/* Live price update indicator */}
                <div className="mt-2 text-xs text-blue-600 sm:text-sm">
                  Total: KSh {Math.round(totalPrice).toLocaleString()}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 space-y-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={stockValue === 0 || isAddingToCart}
                  className="flex items-center justify-center flex-1 gap-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 sm:gap-2 sm:px-6 sm:py-3"
                >
                  <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={stockValue === 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 sm:px-6 sm:py-3"
                >
                  Buy Now
                </button>
              </div>
              
              <button
                onClick={() => {
                  const productId = product._id || product.id;
                  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                  
                  if (isInWishlist) {
                    localStorage.setItem('wishlist', JSON.stringify(wishlist.filter(id => id !== productId)));
                    setIsInWishlist(false);
                    toast.info('Removed from wishlist');
                  } else {
                    wishlist.push(productId);
                    localStorage.setItem('wishlist', JSON.stringify(wishlist));
                    setIsInWishlist(true);
                    toast.success('Added to wishlist');
                  }
                }}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 sm:px-6 sm:py-3"
              >
                <FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Shipping Information Section */}
            {product.requiresShipping !== false && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <FiTruck className="w-5 h-5 mr-2 text-blue-600" />
                  Shipping Information
                </h3>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Free Shipping Badge */}
                  {product.freeShipping && (
                    <div className="flex items-center text-green-600">
                      <FiCheck className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Free Shipping</span>
                    </div>
                  )}
                  
                  {/* Flat Rate */}
                  {product.flatShippingRate > 0 && !product.freeShipping && (
                    <div className="flex items-center text-gray-700">
                      <FiDollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Flat Rate: <span className="font-semibold">KSh {product.flatShippingRate.toLocaleString()}</span></span>
                    </div>
                  )}
                  
                  {/* Weight */}
                  {product.weight > 0 && (
                    <div className="flex items-center text-gray-700">
                      <FiBox className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Weight: {product.weight} {product.weightUnit}</span>
                    </div>
                  )}
                  
                  {/* Dimensions */}
                  {product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0) && (
                    <div className="flex items-center text-gray-700">
                      <FiLayers className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        Dimensions: {product.dimensions.length || 0} × {product.dimensions.width || 0} × {product.dimensions.height || 0} {product.dimensions.unit || 'cm'}
                      </span>
                    </div>
                  )}
                  
                  {/* Shipping Class */}
                  {product.shippingClass && product.shippingClass !== 'standard' && (
                    <div className="flex items-center text-gray-700">
                      <FiPackage className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm capitalize">Shipping Class: {product.shippingClass}</span>
                    </div>
                  )}
                  
                  {/* Estimated Delivery */}
                  {product.estimatedDeliveryMin && product.estimatedDeliveryMax && (
                    <div className="flex items-center text-gray-700">
                      <FiClock className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        Est. Delivery: {product.estimatedDeliveryMin}-{product.estimatedDeliveryMax} business days
                      </span>
                    </div>
                  )}
                  
                  {/* International Shipping */}
                  {product.internationalShipping && (
                    <div className="flex items-center col-span-2 text-blue-600">
                      <FiGlobe className="w-4 h-4 mr-2" />
                      <span className="text-sm">Available for international shipping</span>
                    </div>
                  )}
                </div>

                {/* Shipping Method Selection */}
                {!product.freeShipping && !product.flatShippingRate && (
                  <div className="pt-3 mt-4 border-t border-gray-200">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Shipping Method
                    </label>
                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="standard">Standard Shipping (5-7 days) - Free</option>
                      <option value="express">Express Shipping (2-3 days) - KSh 500</option>
                      <option value="overnight">Overnight Shipping (Next day) - KSh 1,500</option>
                    </select>
                    
                    {/* Total with shipping */}
                    <div className="p-3 mt-3 rounded-lg bg-blue-50">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">KSh {Math.round(totalPrice).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-1 text-sm">
                        <span>Shipping:</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? 'Free' : `KSh ${shippingCost.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 mt-2 font-bold border-t border-blue-200">
                        <span>Total:</span>
                        <span className="text-blue-700">KSh {Math.round(grandTotal).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Info Cards */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 sm:grid-cols-4">
              <div className="flex flex-col items-center p-2 text-center bg-gray-50 rounded-xl sm:p-3">
                <FiTruck className="w-4 h-4 mb-1 text-blue-600 sm:w-5 sm:h-5 sm:mb-2" />
                <span className="text-[10px] font-medium sm:text-xs">Free Shipping</span>
                <span className="text-[8px] text-gray-500 sm:text-xs">Over KSh 6,000</span>
              </div>
              <div className="flex flex-col items-center p-2 text-center bg-gray-50 rounded-xl sm:p-3">
                <FiShield className="w-4 h-4 mb-1 text-blue-600 sm:w-5 sm:h-5 sm:mb-2" />
                <span className="text-[10px] font-medium sm:text-xs">2 Year Warranty</span>
                <span className="text-[8px] text-gray-500 sm:text-xs">On all products</span>
              </div>
              <div className="flex flex-col items-center p-2 text-center bg-gray-50 rounded-xl sm:p-3">
                <FiRefreshCw className="w-4 h-4 mb-1 text-blue-600 sm:w-5 sm:h-5 sm:mb-2" />
                <span className="text-[10px] font-medium sm:text-xs">30-Day Returns</span>
                <span className="text-[8px] text-gray-500 sm:text-xs">Money back</span>
              </div>
              <div className="flex flex-col items-center p-2 text-center bg-gray-50 rounded-xl sm:p-3">
                <FiShare2 className="w-4 h-4 mb-1 text-blue-600 sm:w-5 sm:h-5 sm:mb-2" />
                <span className="text-[10px] font-medium sm:text-xs">24/7 Support</span>
                <span className="text-[8px] text-gray-500 sm:text-xs">Dedicated team</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Customer Reviews</h2>
          
          {/* Overall Rating Summary */}
          <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">
                  {averageRating}
                </div>
                <div className="flex mt-2">
                  {renderStars(parseFloat(averageRating), "w-6 h-6")}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
              
              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-sm">{star}</span>
                    <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ 
                          width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="w-12 text-sm text-gray-600">
                      {ratingDistribution[star]}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Write Review Button */}
              <div className="flex-1 text-center md:text-right">
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
                    className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Write a Review
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                      setUserRating(0);
                      setReviewText('');
                    }}
                    className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold">
                {editingReview ? 'Edit Your Review' : 'Write Your Review'}
              </h3>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Your Rating *
                </label>
                <RatingStars interactive={true} size="w-8 h-8" />
                {userRating === 0 && hoverRating === 0 && (
                  <p className="mt-1 text-xs text-gray-500">Click on the stars to rate</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Your Review *
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience with this product..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setUserRating(0);
                    setReviewText('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingReview ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
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
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id || review.id} className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <FiUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            <FiCalendar className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-1">
                        {renderStars(review.rating, "w-4 h-4")}
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
                            className="p-2 text-gray-500 transition-colors rounded-lg hover:text-blue-600 hover:bg-blue-50"
                            title="Edit review"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-gray-500 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
                            title="Delete review"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
                <FiStar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-700">No reviews yet</h3>
                <p className="mb-4 text-gray-500">Be the first to review this product!</p>
                {!showReviewForm && (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast.error('Please login to write a review');
                        navigate('/login');
                        return;
                      }
                      setShowReviewForm(true);
                    }}
                    className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {reviewPagination.pages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchReviews(reviewPagination.page - 1)}
                    disabled={reviewPagination.page === 1}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm">
                    Page {reviewPagination.page} of {reviewPagination.pages}
                  </span>
                  <button
                    onClick={() => fetchReviews(reviewPagination.page + 1)}
                    disabled={reviewPagination.page === reviewPagination.pages}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {relatedProducts.map((relatedProduct) => {
                const relatedImage = relatedProduct.images?.[0]?.url || 
                                    relatedProduct.image || 
                                    FALLBACK_IMAGE;
                
                return (
                  <div
                    key={relatedProduct._id || relatedProduct.id}
                    onClick={() => {
                      navigate(`/product/${relatedProduct._id || relatedProduct.id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="overflow-hidden transition-shadow bg-white border border-gray-200 shadow-sm cursor-pointer rounded-xl hover:shadow-md"
                  >
                    <div className="overflow-hidden bg-gray-100" style={{ height: '150px' }}>
                      <img
                        src={getFullImageUrl(relatedImage)}
                        alt={relatedProduct.name}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="mb-1 text-xs font-medium text-gray-900 line-clamp-2 sm:text-sm">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(relatedProduct.rating || 0, "w-3 h-3")}
                      </div>
                      <p className="text-sm font-bold text-blue-600 sm:text-base">
                        KSh {Math.round(relatedProduct.discountedPrice || relatedProduct.price).toLocaleString()}
                      </p>
                      {relatedProduct.discountedPrice && (
                        <p className="text-[10px] text-gray-400 line-through sm:text-xs">
                          KSh {Math.round(relatedProduct.price).toLocaleString()}
                        </p>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <div className="relative flex items-center justify-center w-full h-full">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute z-10 p-2 text-white transition-colors rounded-full bg-black/50 top-4 right-4 hover:bg-black/70"
            >
              <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {productImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(prev => 
                    prev > 0 ? prev - 1 : productImages.length - 1
                  )}
                  className="absolute z-10 p-2 text-white transition-colors rounded-full left-4 bg-black/50 hover:bg-black/70"
                >
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev => 
                    prev < productImages.length - 1 ? prev + 1 : 0
                  )}
                  className="absolute z-10 p-2 text-white transition-colors rounded-full right-4 bg-black/50 hover:bg-black/70"
                >
                  <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            <img
              src={productImages[selectedImageIndex]?.url}
              alt={product.name}
              className="object-contain max-w-full max-h-full p-4"
              onError={() => handleImageError(selectedImageIndex)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;