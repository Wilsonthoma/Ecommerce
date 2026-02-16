// src/pages/Product.jsx - REDUCED IMAGE SIZES
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
  FiTrash2,
  FiAward,
  FiZap,
  FiArrowRight,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { BsLightningCharge, BsArrowRight, BsShieldCheck } from 'react-icons/bs';
import { IoFlashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { clientProductService } from '../services/client/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, refreshCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  
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

  // Handle mouse move for zoom
  const handleMouseMove = (e) => {
    if (!isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  // Toggle zoom
  const toggleZoom = () => {
    if (!isZooming) {
      setZoomLevel(2);
      setIsZooming(true);
    } else {
      setZoomLevel(1);
      setIsZooming(false);
      setZoomPosition({ x: 50, y: 50 });
    }
  };

  // Render stars for display
  const renderStars = (rating, size = "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5") => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating % 1) >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<AiFillStar key={i} className={`${size} text-yellow-400`} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <AiFillStar className={`${size} text-gray-600`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <AiFillStar className={`${size} text-yellow-400`} />
            </div>
          </div>
        );
      } else {
        stars.push(<AiFillStar key={i} className={`${size} text-gray-600`} />);
      }
    }
    return stars;
  };

  // Rating Stars Component for interactive rating
  const RatingStars = ({ interactive = false, size = "w-4 h-4 sm:w-5 sm:h-5" }) => {
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
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none transition-transform hover:scale-110`}
        >
          <AiFillStar
            className={`${size} ${
              i <= currentRating
                ? 'text-yellow-400'
                : 'text-gray-600'
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="container px-3 py-3 mx-auto sm:px-4 md:px-6 md:py-4">
          <div className="animate-pulse">
            <div className="w-16 h-2 mb-3 bg-gray-700 rounded sm:w-20 md:h-3 md:w-24"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <div className="bg-gray-800 rounded-lg aspect-square max-w-md mx-auto w-full md:max-w-sm"></div>
              <div className="space-y-3">
                <div className="w-3/4 h-4 bg-gray-700 rounded sm:h-5"></div>
                <div className="w-1/2 h-3 bg-gray-700 rounded sm:h-4"></div>
                <div className="w-1/3 h-5 bg-gray-700 rounded sm:h-6"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-700 rounded"></div>
                  <div className="h-2 bg-gray-700 rounded"></div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative container px-3 py-3 mx-auto sm:px-4 md:px-6 md:py-4 lg:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-3 text-xs text-gray-400 sm:text-sm md:gap-2 md:mb-4">
          <button onClick={() => navigate('/')} className="hover:text-white hover:glow-text transition-all whitespace-nowrap">Home</button>
          <FiChevronRight className="w-2.5 h-2.5 text-gray-600 sm:w-3 sm:h-3" />
          <button onClick={() => navigate('/shop')} className="hover:text-white hover:glow-text transition-all whitespace-nowrap">Shop</button>
          <FiChevronRight className="w-2.5 h-2.5 text-gray-600 sm:w-3 sm:h-3" />
          <span className="font-medium text-white truncate glow-text max-w-[120px] sm:max-w-[180px] md:max-w-[250px]">
            {product.name}
          </span>
        </nav>

        {/* Product Main Section - Reduced image size */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Left Column - Images - REDUCED SIZE */}
          <div className="space-y-2 max-w-md mx-auto w-full lg:max-w-sm">
            {/* Main Image */}
            <div 
              className="group relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 aspect-square cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZooming(false)}
            >
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500"></div>
              
              {/* Image with Zoom */}
              <div className="relative w-full h-full overflow-hidden">
                {productImages.length > 0 && !imageErrors[selectedImageIndex] ? (
                  <img
                    src={productImages[selectedImageIndex]?.url}
                    alt={productImages[selectedImageIndex]?.altText || product.name}
                    className={`w-full h-full transition-transform duration-300 ${
                      isZooming ? 'scale-150' : 'scale-100'
                    }`}
                    style={{
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    }}
                    onError={() => handleImageError(selectedImageIndex)}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-800">
                    <img
                      src={FALLBACK_IMAGE}
                      alt="Fallback"
                      className="object-contain w-2/3 opacity-50 h-2/3"
                    />
                  </div>
                )}
              </div>
              
              {/* Zoom Controls - Smaller */}
              <div className="absolute bottom-2 right-2 flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoom();
                  }}
                  className="p-1.5 transition-all rounded-full shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] group"
                  title={isZooming ? 'Zoom out' : 'Zoom in'}
                >
                  {isZooming ? (
                    <FiMinimize2 className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  ) : (
                    <FiMaximize2 className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="p-1.5 transition-all rounded-full shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] group"
                  title="Fullscreen view"
                >
                  <FiMaximize2 className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>

              {/* Wishlist Button - Smaller */}
              {isLoggedIn && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle();
                  }}
                  className="absolute p-1.5 transition-all rounded-full shadow-lg top-2 right-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] group"
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart
                    className={`w-3.5 h-3.5 ${
                      inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-500'
                    } transition-colors`}
                  />
                </button>
              )}

              {/* Badges - Smaller */}
              <div className="absolute flex flex-wrap gap-1 top-2 left-2">
                {hasDiscount && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full bg-gradient-to-r from-red-600 to-orange-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    {discountPercentage}% OFF
                  </span>
                )}
                {product.featured && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-yellow-500 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                    <FiStar className="inline w-2 h-2 mr-0.5" /> Featured
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery - Smaller */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-1.5">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`group relative overflow-hidden rounded-md transition-all aspect-square ${
                      selectedImageIndex === index 
                        ? 'ring-1 ring-blue-500 ring-offset-1 ring-offset-gray-900' 
                        : ''
                    }`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md opacity-0 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className={`relative w-full h-full rounded-md overflow-hidden border ${
                      selectedImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-gray-700 group-hover:border-gray-600'
                    }`}>
                      <img
                        src={image.url}
                        alt={`${product.name} - view ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => e.target.src = FALLBACK_IMAGE}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Details - Compact */}
          <div className="space-y-3 max-w-lg mx-auto w-full lg:max-w-md">
            {/* Category and Title */}
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="px-1.5 py-0.5 text-[10px] font-medium text-blue-500 rounded-full sm:text-xs bg-blue-500/10 border border-blue-500/30">
                  {product.category || 'Uncategorized'}
                </span>
                {product.featured && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium text-yellow-500 rounded-full sm:text-xs bg-yellow-500/10 border border-yellow-500/30">
                    <FiStar className="inline w-2 h-2 mr-0.5" /> Featured
                  </span>
                )}
              </div>
              <h1 className="text-base font-bold text-white sm:text-lg md:text-xl lg:text-2xl glow-text">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {renderStars(parseFloat(averageRating))}
              </div>
              <span className="text-[10px] text-gray-400 sm:text-xs">
                {averageRating} ({totalReviews})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                {formatKES(totalPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-[10px] text-gray-500 line-through sm:text-xs">
                    {formatKES(originalPrice * quantity)}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium text-red-500 rounded-full sm:text-xs bg-red-500/10 border border-red-500/30">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-1.5">
              {stockValue > 0 ? (
                <>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-500 sm:text-sm">In Stock</span>
                  <span className="text-[10px] text-gray-400 sm:text-xs">({stockValue} units)</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium text-red-500 sm:text-sm">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description - Compact */}
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs leading-relaxed text-gray-400 sm:text-sm line-clamp-2">
                {product.description || 'No description available.'}
              </p>
            </div>

            {/* Quantity and Actions - Compact */}
            {stockValue > 0 && (
              <div className="pt-2 space-y-2 border-t border-gray-800">
                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Qty:</span>
                  <div className="flex items-center overflow-hidden border rounded-md bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="px-1.5 py-1 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      <FiMinus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-6 text-xs font-medium text-center text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(stockValue, prev + 1))}
                      disabled={quantity >= stockValue}
                      className="px-1.5 py-1 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      <FiPlus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons - Compact */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={stockValue === 0 || isAddingToCart}
                    className="group relative flex-1 py-1.5 text-xs font-medium text-white transition-all rounded-full overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="relative flex items-center justify-center gap-1">
                      {isAddingToCart ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                          <span className="text-[10px]">Adding...</span>
                        </>
                      ) : (
                        <>
                          <FiShoppingCart className="w-3 h-3" />
                          <span className="text-[10px]">Add</span>
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/checkout')}
                    disabled={stockValue === 0}
                    className="group relative flex-1 py-1.5 text-xs font-medium text-white transition-all rounded-full overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="relative flex items-center justify-center gap-1">
                      <span className="text-[10px]">Buy</span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Shipping Info - Compact */}
            {product.requiresShipping !== false && (
              <div className="p-2 border rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                <h3 className="flex items-center gap-1 mb-1.5 text-xs font-semibold text-white">
                  <FiTruck className="w-3 h-3 text-blue-500" />
                  Shipping
                </h3>
                
                <div className="space-y-1 text-[10px]">
                  {product.freeShipping && (
                    <div className="flex items-center text-green-500">
                      <FiCheck className="w-2 h-2 mr-1" />
                      <span>Free Shipping</span>
                    </div>
                  )}
                  
                  {product.weight > 0 && (
                    <div className="flex items-center text-gray-300">
                      <FiBox className="w-2 h-2 mr-1 text-gray-500" />
                      <span>{product.weight}{product.weightUnit}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info Icons - Compact Grid */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              <div className="flex flex-col items-center p-1 text-center rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                <FiTruck className="w-3 h-3 mb-0.5 text-blue-500" />
                <span className="text-[8px] text-white">Free</span>
              </div>
              <div className="flex flex-col items-center p-1 text-center rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                <FiShield className="w-3 h-3 mb-0.5 text-green-500" />
                <span className="text-[8px] text-white">2Y</span>
              </div>
              <div className="flex flex-col items-center p-1 text-center rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                <FiRefreshCw className="w-3 h-3 mb-0.5 text-purple-500" />
                <span className="text-[8px] text-white">30D</span>
              </div>
              <div className="flex flex-col items-center p-1 text-center rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                <FiShare2 className="w-3 h-3 mb-0.5 text-orange-500" />
                <span className="text-[8px] text-white">24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Compact */}
        <div className="mt-6 md:mt-8">
          <h2 className="mb-3 text-base font-bold text-white sm:text-lg md:text-xl glow-text">Reviews</h2>
          
          {/* Rating Summary - Compact */}
          <div className="p-3 mb-3 border rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="text-center sm:text-left sm:w-1/4">
                <div className="text-xl font-bold text-white sm:text-2xl">{averageRating}</div>
                <div className="flex justify-center mt-0.5 sm:justify-start">
                  {renderStars(parseFloat(averageRating), "w-3 h-3")}
                </div>
                <p className="text-[10px] text-gray-400">{totalReviews} reviews</p>
              </div>
              
              {/* Rating Distribution - Compact */}
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-300">{star}</span>
                    <FiStar className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-1 overflow-hidden bg-gray-700 rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                        style={{ width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-5 text-[10px] text-gray-400">{ratingDistribution[star]}</span>
                  </div>
                ))}
              </div>
              
              {/* Write Review Button - Compact */}
              <div className="text-center sm:text-right sm:w-1/5">
                {!showReviewForm ? (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast.error('Please login');
                        navigate('/login');
                        return;
                      }
                      setShowReviewForm(true);
                    }}
                    className="group relative w-full px-3 py-1 text-[10px] font-medium text-white transition-all rounded-full overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                    <span className="relative flex items-center justify-center gap-1">
                      Write
                      <BsArrowRight className="w-2 h-2 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="w-full px-3 py-1 text-[10px] font-medium text-gray-300 bg-gray-800 rounded-full hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews List - Compact */}
          <div className="space-y-2">
            {reviews.length > 0 ? (
              reviews.slice(0, 3).map((review) => (
                <div key={review._id || review.id} className="p-2 border rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <FiUser className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-white">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-2 h-2 text-gray-500" />
                          <p className="text-[8px] text-gray-400">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {review.verified && (
                        <span className="px-1 py-0.5 text-[8px] font-medium text-green-500 rounded-full bg-green-500/10 border border-green-500/30">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {renderStars(review.rating, "w-2 h-2")}
                  </div>
                  <p className="mt-1 text-[10px] text-gray-300 line-clamp-2">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="py-4 text-center border rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                <FiStar className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                <p className="text-[10px] text-gray-400">No reviews yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products - Compact */}
        {relatedProducts.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-base font-bold text-white sm:text-lg">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {relatedProducts.slice(0, 4).map((relatedProduct) => {
                const relatedImage = relatedProduct.images?.[0]?.url || relatedProduct.image || FALLBACK_IMAGE;
                
                return (
                  <div
                    key={relatedProduct._id || relatedProduct.id}
                    onClick={() => {
                      navigate(`/product/${relatedProduct._id || relatedProduct.id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="group relative cursor-pointer"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={getFullImageUrl(relatedImage)}
                          alt={relatedProduct.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => e.target.src = FALLBACK_IMAGE}
                        />
                      </div>
                      <div className="p-1.5">
                        <h3 className="text-[10px] font-medium text-white line-clamp-1">{relatedProduct.name}</h3>
                        <p className="mt-0.5 text-xs font-bold text-blue-500">
                          {formatKES(relatedProduct.discountedPrice || relatedProduct.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL - Fullscreen with better styling */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-xl"
          onClick={() => setLightboxOpen(false)}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center p-2 md:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
            
            {/* Main Content Container */}
            <div className="relative w-full max-w-5xl mx-auto">
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                {/* Image Counter */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] font-medium text-white">
                    {selectedImageIndex + 1} / {productImages.length}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  {/* Zoom Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleZoom();
                    }}
                    className="p-1.5 transition-all rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] group"
                  >
                    {isZooming ? (
                      <FiMinimize2 className="w-3.5 h-3.5 text-white group-hover:text-blue-500" />
                    ) : (
                      <FiMaximize2 className="w-3.5 h-3.5 text-white group-hover:text-blue-500" />
                    )}
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => setLightboxOpen(false)}
                    className="p-1.5 transition-all rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] group"
                  >
                    <FiX className="w-3.5 h-3.5 text-white group-hover:text-red-500" />
                  </button>
                </div>
              </div>

              {/* Main Image Container */}
              <div className="relative flex items-center justify-center w-full h-full min-h-[50vh]">
                {/* Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(prev => prev > 0 ? prev - 1 : productImages.length - 1);
                        setZoomLevel(1);
                        setIsZooming(false);
                      }}
                      className="absolute left-2 z-20 p-2 transition-all rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] group"
                    >
                      <FiChevronLeft className="w-4 h-4 text-white group-hover:text-blue-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(prev => prev < productImages.length - 1 ? prev + 1 : 0);
                        setZoomLevel(1);
                        setIsZooming(false);
                      }}
                      className="absolute right-2 z-20 p-2 transition-all rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] group"
                    >
                      <FiChevronRight className="w-4 h-4 text-white group-hover:text-blue-500" />
                    </button>
                  </>
                )}

                {/* Image with Zoom */}
                <div 
                  className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setIsZooming(false)}
                >
                  <img
                    src={productImages[selectedImageIndex]?.url}
                    alt={productImages[selectedImageIndex]?.altText || product.name}
                    className={`max-w-full max-h-[70vh] object-contain transition-transform duration-300 ${
                      isZooming ? 'scale-150' : 'scale-100'
                    }`}
                    style={{
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    }}
                    onError={() => handleImageError(selectedImageIndex)}
                  />
                </div>
              </div>

              {/* Bottom Info Bar - Compact */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="flex items-center justify-between">
                  {/* Product Info */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 overflow-hidden rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10">
                      <img
                        src={productImages[selectedImageIndex]?.url}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-white truncate max-w-[150px]">{product.name}</h3>
                      <p className="text-[10px] text-blue-500">{formatKES(product.discountedPrice || product.price)}</p>
                    </div>
                  </div>

                  {/* Thumbnail Strip - Hidden on mobile */}
                  {productImages.length > 1 && (
                    <div className="hidden md:flex items-center gap-1">
                      {productImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(idx);
                          }}
                          className={`relative w-8 h-8 overflow-hidden rounded border-2 transition-all ${
                            selectedImageIndex === idx
                              ? 'border-blue-500 ring-1 ring-blue-500/50'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`Thumbnail ${idx + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 15px currentColor;
        }
        
        @media (max-width: 640px) {
          .glow-text {
            text-shadow: 0 0 8px currentColor;
          }
        }
      `}</style>
    </div>
  );
};

export default Product;