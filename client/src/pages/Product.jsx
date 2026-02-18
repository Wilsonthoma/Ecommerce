// src/pages/Product.jsx - FIXED with homepage styling
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
  FiMinimize2,
  FiMapPin
} from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { BsLightningCharge, BsArrowRight, BsShieldCheck } from 'react-icons/bs';
import { IoFlashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { clientProductService } from '../services/client/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

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
  
  .product-title {
    font-weight: 800;
    font-size: 2.5rem;
    line-height: 1.2;
    letter-spacing: -0.03em;
    background: linear-gradient(to right, #fff, #e5e5e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .section-header {
    font-weight: 700;
    font-size: 1.8rem;
    letter-spacing: -0.02em;
    background: linear-gradient(to right, #fff, #e5e5e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .price-large {
    font-weight: 800;
    font-size: 2.2rem;
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .price-small {
    font-weight: 500;
    color: #9CA3AF;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
    color: white;
    font-weight: 600;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }
  
  .btn-secondary {
    background: transparent;
    color: white;
    font-weight: 600;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  .btn-secondary:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .btn-wishlist {
    background: transparent;
    color: white;
    font-weight: 600;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: 2px solid rgba(239, 68, 68, 0.3);
  }
  
  .btn-wishlist:hover {
    border-color: rgba(239, 68, 68, 0.8);
    background: rgba(239, 68, 68, 0.1);
  }
  
  .btn-wishlist.active {
    background: linear-gradient(135deg, #EF4444, #EC4899);
    border: none;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  }
  
  .info-icon {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5), rgba(17, 24, 39, 0.5));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    transition: all 0.3s ease;
  }
  
  .info-icon:hover {
    border-color: #3B82F6;
    transform: translateY(-2px);
  }
  
  .testimonial-card {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 1.5rem;
    transition: all 0.3s ease;
  }
  
  .testimonial-card:hover {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%);
    border-color: rgba(59, 130, 246, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5);
  }
  
  .badge-primary {
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
  }
  
  .badge-discount {
    background: linear-gradient(135deg, #EF4444, #F59E0B);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
  }
  
  .glow-text {
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
`;

// Animation styles
const animationStyles = `
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
  
  .glow-text {
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
`;

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=800';

// Top Bar Component (matching homepage)
const TopBar = () => (
  <div className="py-3 border-b border-gray-800 bg-black/90">
    <div className="flex items-center justify-end px-6 mx-auto space-x-6 max-w-7xl">
      <button className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white">
        <FiMapPin className="w-4 h-4" />
        FIND STORE
      </button>
      <span className="text-gray-700">|</span>
      <button className="text-sm text-gray-400 transition-colors hover:text-white">
        SHOP ONLINE
      </button>
    </div>
  </div>
);

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
    // Inject font styles
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    // Check login status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }

    return () => {
      document.head.removeChild(style);
    };
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
  const renderStars = (rating, size = "w-3 h-3 sm:w-4 sm:h-4") => {
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
  const RatingStars = ({ interactive = false, size = "w-5 h-5" }) => {
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
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="container px-6 py-8 mx-auto">
          <div className="animate-pulse">
            <div className="w-24 h-4 mb-6 bg-gray-800 rounded"></div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="bg-gray-800 rounded-2xl aspect-square"></div>
              <div className="space-y-4">
                <div className="w-3/4 h-8 bg-gray-800 rounded"></div>
                <div className="w-1/2 h-6 bg-gray-800 rounded"></div>
                <div className="w-1/3 h-12 bg-gray-800 rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded"></div>
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
    <div className="min-h-screen bg-black">
      {/* Top Bar */}
      <TopBar />

      <div className="container px-6 py-8 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <button onClick={() => navigate('/')} className="text-gray-400 transition-colors hover:text-white">Home</button>
          <FiChevronRight className="w-4 h-4 text-gray-600" />
          <button onClick={() => navigate('/shop')} className="text-gray-400 transition-colors hover:text-white">Shop</button>
          <FiChevronRight className="w-4 h-4 text-gray-600" />
          <span className="max-w-xs font-medium text-white truncate">{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative overflow-hidden border border-gray-700 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 aspect-square cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZooming(false)}
            >
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
              
              {/* Image */}
              <div className="relative w-full h-full overflow-hidden rounded-2xl">
                {productImages.length > 0 && !imageErrors[selectedImageIndex] ? (
                  <img
                    src={productImages[selectedImageIndex]?.url}
                    alt={productImages[selectedImageIndex]?.altText || product.name}
                    className={`w-full h-full object-contain transition-transform duration-300 ${
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
                      className="object-contain w-2/3 opacity-50"
                    />
                  </div>
                )}
              </div>
              
              {/* Badges */}
              <div className="absolute flex gap-2 top-4 left-4">
                {hasDiscount && (
                  <span className="badge-discount">
                    -{discountPercentage}%
                  </span>
                )}
                {product.featured && (
                  <span className="badge-primary">
                    <FiStar className="inline w-3 h-3 mr-1" /> Featured
                  </span>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="absolute flex gap-2 bottom-4 right-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoom();
                  }}
                  className="p-2 transition-all border rounded-full bg-black/50 backdrop-blur-md border-white/10 hover:border-blue-500/50 group/btn"
                >
                  {isZooming ? (
                    <FiMinimize2 className="w-4 h-4 text-white group-hover/btn:text-blue-500" />
                  ) : (
                    <FiMaximize2 className="w-4 h-4 text-white group-hover/btn:text-blue-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden rounded-lg transition-all aspect-square ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black' 
                        : ''
                    }`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className={`relative w-full h-full rounded-lg overflow-hidden border ${
                      selectedImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-gray-700 hover:border-gray-600'
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

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <span className="inline-block px-3 py-1 text-xs font-medium text-blue-500 border rounded-full bg-blue-500/10 border-blue-500/30">
                {product.category || 'Uncategorized'}
              </span>
            </div>

            {/* Title */}
            <h1 className="product-title">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(parseFloat(averageRating), "w-5 h-5")}
              </div>
              <span className="text-sm text-gray-400">
                {averageRating} ({totalReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="price-large">{formatKES(totalPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg line-through price-small">
                    {formatKES(originalPrice * quantity)}
                  </span>
                  <span className="badge-discount">
                    Save {formatKES(totalSavings)}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {stockValue > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-500">In Stock</span>
                  <span className="text-sm text-gray-400">({stockValue} units)</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-500">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-gray-800">
              <p className="leading-relaxed text-gray-400">
                {product.description || 'No description available.'}
              </p>
            </div>

            {/* Quantity and Actions */}
            {stockValue > 0 && (
              <div className="pt-4 space-y-4 border-t border-gray-800">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-300">Quantity:</span>
                  <div className="flex items-center overflow-hidden border border-gray-700 rounded-full bg-gradient-to-br from-gray-800 to-gray-900">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-12 font-medium text-center text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(stockValue, prev + 1))}
                      disabled={quantity >= stockValue}
                      className="px-3 py-2 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleAddToCart}
                    disabled={stockValue === 0 || isAddingToCart}
                    className="flex items-center justify-center flex-1 gap-2 btn-primary"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <FiShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/checkout')}
                    disabled={stockValue === 0}
                    className="flex-1 btn-secondary"
                  >
                    Buy Now
                  </button>
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`w-full ${inWishlist ? 'btn-wishlist active' : 'btn-wishlist'}`}
                >
                  <FiHeart className={`w-5 h-5 inline mr-2 ${inWishlist ? 'fill-white' : ''}`} />
                  {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            )}

            {/* Shipping Info */}
            {product.requiresShipping !== false && (
              <div className="p-4 border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
                  <FiTruck className="w-4 h-4 text-blue-500" />
                  Shipping Information
                </h3>
                
                <div className="space-y-2 text-sm">
                  {product.freeShipping && (
                    <div className="flex items-center text-green-500">
                      <FiCheck className="w-4 h-4 mr-2" />
                      <span>Free Shipping</span>
                    </div>
                  )}
                  
                  {product.flatShippingRate > 0 && !product.freeShipping && (
                    <div className="flex items-center text-gray-300">
                      <FiDollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Flat Rate: {formatKES(product.flatShippingRate)}</span>
                    </div>
                  )}
                  
                  {product.weight > 0 && (
                    <div className="flex items-center text-gray-300">
                      <FiBox className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{product.weight}{product.weightUnit}</span>
                    </div>
                  )}
                  
                  {product.estimatedDeliveryMin && product.estimatedDeliveryMax && (
                    <div className="flex items-center text-gray-300">
                      <FiClock className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{product.estimatedDeliveryMin}-{product.estimatedDeliveryMax} days</span>
                    </div>
                  )}
                </div>

                {/* Shipping Method Selector */}
                {!product.freeShipping && !product.flatShippingRate && (
                  <div className="pt-3 mt-3 border-t border-gray-700">
                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-white border border-gray-700 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="standard">Standard Shipping (5-7 days) - Free</option>
                      <option value="express">Express Shipping (2-3 days) - KSh 500</option>
                      <option value="overnight">Overnight Shipping (Next day) - KSh 1,500</option>
                    </select>

                    {/* Total with shipping */}
                    <div className="p-3 mt-3 border rounded-lg bg-blue-600/10 border-blue-600/20">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal:</span>
                        <span className="font-medium text-white">{formatKES(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-400">Shipping:</span>
                        <span className="font-medium text-blue-500">
                          {shippingCost === 0 ? 'Free' : formatKES(shippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 mt-2 font-bold border-t border-blue-600/20">
                        <span className="text-white">Total:</span>
                        <span className="text-lg price-large">{formatKES(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info Icons */}
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col items-center p-3 info-icon rounded-xl">
                <FiTruck className="w-5 h-5 mb-2 text-blue-500" />
                <span className="text-xs font-medium text-white">Free Shipping</span>
                <span className="text-[10px] text-gray-400">Over 6K</span>
              </div>
              <div className="flex flex-col items-center p-3 info-icon rounded-xl">
                <FiShield className="w-5 h-5 mb-2 text-green-500" />
                <span className="text-xs font-medium text-white">2 Year</span>
                <span className="text-[10px] text-gray-400">Warranty</span>
              </div>
              <div className="flex flex-col items-center p-3 info-icon rounded-xl">
                <FiRefreshCw className="w-5 h-5 mb-2 text-purple-500" />
                <span className="text-xs font-medium text-white">30-Day</span>
                <span className="text-[10px] text-gray-400">Returns</span>
              </div>
              <div className="flex flex-col items-center p-3 info-icon rounded-xl">
                <FiShare2 className="w-5 h-5 mb-2 text-orange-500" />
                <span className="text-xs font-medium text-white">24/7</span>
                <span className="text-[10px] text-gray-400">Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="mb-8 section-header">— HEAR WHAT PEOPLE SAY —</h2>
          
          {/* Rating Summary */}
          <div className="p-6 mb-6 border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Average Rating */}
              <div className="text-center lg:w-1/4">
                <div className="text-5xl font-bold text-white">{averageRating}</div>
                <div className="flex justify-center mt-2">
                  {renderStars(parseFloat(averageRating), "w-6 h-6")}
                </div>
                <p className="mt-2 text-sm text-gray-400">{totalReviews} reviews</p>
              </div>
              
              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-2 text-sm text-gray-300">{star}</span>
                    <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 overflow-hidden bg-gray-700 rounded-full">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        style={{ width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-400">{ratingDistribution[star]}</span>
                  </div>
                ))}
              </div>
              
              {/* Write Review Button */}
              <div className="lg:w-1/5">
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
                    className="w-full btn-primary"
                  >
                    Write Review
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="w-full btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="p-6 mb-6 border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <h3 className="mb-4 text-xl font-bold text-white">
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </h3>
              
              <div className="mb-4">
                <RatingStars interactive={true} size="w-8 h-8" />
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 mb-4 text-white border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Share your experience with this product..."
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setUserRating(0);
                    setReviewText('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="btn-primary"
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
                <div key={review._id || review.id} className="p-6 testimonial-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <FiUser className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{review.userName}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <FiCalendar className="w-3 h-3" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.verified && (
                        <span className="text-xs badge-primary">
                          Verified Purchase
                        </span>
                      )}
                      {isLoggedIn && currentUser && currentUser.name === review.userName && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-blue-500 hover:bg-blue-500/10"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-red-500 hover:bg-red-500/10"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(review.rating, "w-4 h-4")}
                  </div>
                  <p className="leading-relaxed text-gray-300">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center testimonial-card">
                <FiStar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <h3 className="mb-2 text-xl font-bold text-white">No reviews yet</h3>
                <p className="text-gray-400">Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 section-header">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {relatedProducts.slice(0, 4).map((relatedProduct) => {
                const relatedImage = relatedProduct.images?.[0]?.url || relatedProduct.image || FALLBACK_IMAGE;
                
                return (
                  <div
                    key={relatedProduct._id || relatedProduct.id}
                    onClick={() => {
                      navigate(`/product/${relatedProduct._id || relatedProduct.id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="cursor-pointer group"
                  >
                    <div className="relative mb-3 overflow-hidden border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                      <div className="relative overflow-hidden aspect-square">
                        <img
                          src={getFullImageUrl(relatedImage)}
                          alt={relatedProduct.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => e.target.src = FALLBACK_IMAGE}
                        />
                      </div>
                    </div>
                    <h3 className="font-medium text-white transition-colors group-hover:text-blue-500 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(relatedProduct.rating || 0, "w-3 h-3")}
                    </div>
                    <p className="mt-1 text-lg font-bold text-blue-500">
                      {formatKES(relatedProduct.discountedPrice || relatedProduct.price)}
                    </p>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={() => setLightboxOpen(false)}
        >
          <div 
            className="relative flex items-center justify-center w-full h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
            
            <div className="relative w-full max-w-6xl">
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                <div className="px-3 py-1 border rounded-full bg-black/50 backdrop-blur-md border-white/10">
                  <span className="text-sm text-white">
                    {selectedImageIndex + 1} / {productImages.length}
                  </span>
                </div>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="p-2 transition-all border rounded-full bg-black/50 backdrop-blur-md border-white/10 hover:border-red-500/50 group"
                >
                  <FiX className="w-5 h-5 text-white group-hover:text-red-500" />
                </button>
              </div>

              {/* Navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => prev > 0 ? prev - 1 : productImages.length - 1);
                      setZoomLevel(1);
                      setIsZooming(false);
                    }}
                    className="absolute z-20 p-3 transition-all -translate-y-1/2 border rounded-full left-4 top-1/2 bg-black/50 backdrop-blur-md border-white/10 hover:border-blue-500/50 group"
                  >
                    <FiChevronLeft className="w-6 h-6 text-white group-hover:text-blue-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => prev < productImages.length - 1 ? prev + 1 : 0);
                      setZoomLevel(1);
                      setIsZooming(false);
                    }}
                    className="absolute z-20 p-3 transition-all -translate-y-1/2 border rounded-full right-4 top-1/2 bg-black/50 backdrop-blur-md border-white/10 hover:border-blue-500/50 group"
                  >
                    <FiChevronRight className="w-6 h-6 text-white group-hover:text-blue-500" />
                  </button>
                </>
              )}

              {/* Image */}
              <div className="flex items-center justify-center min-h-[80vh]">
                <img
                  src={productImages[selectedImageIndex]?.url}
                  alt={product.name}
                  className="max-w-full max-h-[80vh] object-contain"
                  onError={() => handleImageError(selectedImageIndex)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;