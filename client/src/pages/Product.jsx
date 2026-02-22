// src/pages/Product.jsx - WITH UNIFORM GRADIENT (no boundary)
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
  FiStar,
  FiClock,
  FiPackage,
  FiDollarSign,
  FiBox,
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
import { BsArrowRight } from 'react-icons/bs';
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
    font-size: clamp(1.5rem, 4vw, 2rem);
    line-height: 1.2;
    letter-spacing: -0.03em;
    background: linear-gradient(to right, #fff, #e5e5e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .section-header {
    font-weight: 700;
    font-size: clamp(1.2rem, 3vw, 1.4rem);
    letter-spacing: -0.02em;
    background: linear-gradient(to right, #fff, #e5e5e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .price-large {
    font-weight: 800;
    font-size: clamp(1.4rem, 4vw, 1.6rem);
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .price-small {
    font-weight: 500;
    font-size: clamp(0.7rem, 2vw, 0.8rem);
    color: #9CA3AF;
  }
  
  /* TINY BUTTONS - 1/4 of original size */
  .btn-primary {
    background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
    color: white;
    font-weight: 500;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 2px 5px rgba(59, 130, 246, 0.3);
    font-size: 0.65rem;
    letter-spacing: 0.02em;
  }
  
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
  }
  
  .btn-secondary {
    background: transparent;
    color: white;
    font-weight: 500;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.65rem;
  }
  
  .btn-secondary:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .btn-wishlist {
    background: transparent;
    color: white;
    font-weight: 500;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: 1px solid rgba(239, 68, 68, 0.3);
    font-size: 0.65rem;
  }
  
  .btn-wishlist:hover {
    border-color: rgba(239, 68, 68, 0.8);
    background: rgba(239, 68, 68, 0.1);
  }
  
  .btn-wishlist.active {
    background: linear-gradient(135deg, #EF4444, #EC4899);
    border: none;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }
  
  .info-icon {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5), rgba(17, 24, 39, 0.5));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    transition: all 0.3s ease;
    padding: 0.3rem;
    border-radius: 0.5rem;
  }
  
  .info-icon:hover {
    border-color: #3B82F6;
    transform: translateY(-1px);
  }
  
  .testimonial-card {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 0.75rem;
    transition: all 0.3s ease;
  }
  
  .badge-primary {
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    color: white;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 5px rgba(59, 130, 246, 0.3);
  }
  
  .badge-discount {
    background: linear-gradient(135deg, #EF4444, #F59E0B);
    color: white;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3);
  }
  
  .badge-flash {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);
  }
  
  .badge-trending {
    background: linear-gradient(135deg, #8B5CF6, #EC4899);
    color: white;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 5px rgba(139, 92, 246, 0.3);
  }
  
  .badge-new {
    background: linear-gradient(135deg, #10B981, #3B82F6);
    color: white;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
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
  
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  .glow-text {
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
`;

// Beautiful gradient combinations - UNIFORM gradient for entire page
const pageGradient = "from-blue-600/20 via-purple-600/20 to-pink-600/20";

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=800';

// Product header image
const productHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getStockValue = (product) => {
    return product?.quantity || product?.stock || 0;
  };

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return FALLBACK_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
    return `${API_URL}/uploads/products/${imagePath}`;
  };

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
    
    if (images.length === 0 && product.primaryImage) {
      images = [{
        url: getFullImageUrl(product.primaryImage),
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

  const handleMouseMove = (e) => {
    if (!isZooming) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

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

  const renderStars = (rating, size = "w-3 h-3") => {
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

  const calculateTotalPrice = () => {
    if (!product) return 0;
    return product.price * quantity;
  };

  const calculateSavings = () => {
    if (!product || !product.comparePrice || product.comparePrice <= product.price) return 0;
    return (product.comparePrice - product.price) * quantity;
  };

  const calculateDiscountPercentage = () => {
    if (!product || !product.comparePrice || product.comparePrice <= product.price) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    const success = await addToCart(product, quantity);
    if (success) await refreshCart();
    setIsAddingToCart(false);
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to use wishlist');
      navigate('/login');
      return;
    }
    await toggleWishlist(product);
  };

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
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      const reviewData = { rating: userRating, comment: reviewText.trim() };

      let response;
      if (editingReview) {
        response = await clientProductService.updateReview(editingReview._id, reviewData);
      } else {
        response = await clientProductService.addProductReview(id, reviewData);
      }

      if (response && response.success) {
        toast.success(editingReview ? 'Review updated successfully!' : 'Review added successfully!');
        setUserRating(0);
        setReviewText('');
        setShowReviewForm(false);
        setEditingReview(null);
        await fetchReviews();
        await fetchProductData();
      } else {
        toast.error(response?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to submit a review');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setUserRating(review.rating);
    setReviewText(review.comment);
    setShowReviewForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isFlashSaleActive = () => {
    if (!product || !product.isFlashSale) return false;
    if (!product.flashSaleEndDate) return true;
    return new Date() < new Date(product.flashSaleEndDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {/* UNIFORM gradient overlay */}
        <div className={`fixed inset-0 pointer-events-none bg-gradient-to-r ${pageGradient} animate-gradient`}></div>
        <TopBar />
        <div className="container px-4 py-4 mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="w-16 h-4 mb-4 bg-gray-800 rounded"></div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="w-48 h-48 mx-auto bg-gray-800 rounded-2xl lg:mx-0"></div>
              <div className="flex-1 space-y-2">
                <div className="w-2/3 h-5 bg-gray-800 rounded"></div>
                <div className="w-1/3 h-4 bg-gray-800 rounded"></div>
                <div className="w-1/4 h-5 bg-gray-800 rounded"></div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-800 rounded"></div>
                  <div className="h-2 bg-gray-800 rounded"></div>
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
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount ? calculateDiscountPercentage() : 0;
  const totalPrice = calculateTotalPrice();
  const totalSavings = calculateSavings();
  const totalReviews = reviews.length || product.reviewsCount || 0;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : (product.rating || 0).toFixed(1);
  const inWishlist = isInWishlist(product._id || product.id);
  const flashSaleActive = isFlashSaleActive();

  return (
    <div className="min-h-screen bg-black">
      {/* UNIFORM gradient overlay for entire page - NO BOUNDARY between header and content */}
      <div className={`fixed inset-0 pointer-events-none bg-gradient-to-r ${pageGradient} animate-gradient`}></div>
      
      <TopBar />

      {/* Product Header Image - with uniform gradient */}
      <div 
        className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64"
        data-aos="fade-in"
        data-aos-duration="1500"
        data-aos-delay="200"
        data-aos-once="false"
      >
        <div className="absolute inset-0">
          <img 
            src={productHeaderImage}
            alt="Product Details"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          {/* Single uniform gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${pageGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
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
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl glow-text">
                PRODUCT DETAILS
              </h1>
              <p className="mt-1 text-sm text-gray-300 sm:text-base">
                {product.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - continues with same gradient background */}
      <div className="container relative px-4 py-6 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-4 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/shop')} className="text-gray-400 hover:text-white">Shop</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="max-w-[150px] font-medium text-white truncate sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Product Main Section - FLEXBOX with balanced gaps */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left Column - Images */}
          <div className="flex-shrink-0 lg:w-72">
            <div className="space-y-3">
              {/* Main Image */}
              <div className="relative w-56 h-56 mx-auto overflow-hidden border border-gray-700 lg:mx-0 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 sm:w-64 sm:h-64 lg:w-72 lg:h-72">
                <div 
                  className="relative w-full h-full cursor-zoom-in group"
                  onClick={() => setLightboxOpen(true)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setIsZooming(false)}
                >
                  {productImages.length > 0 && !imageErrors[selectedImageIndex] ? (
                    <img
                      src={productImages[selectedImageIndex]?.url}
                      alt={productImages[selectedImageIndex]?.altText || product.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isZooming ? 'scale-150' : 'scale-100'
                      }`}
                      style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
                      onError={() => handleImageError(selectedImageIndex)}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-800">
                      <img src={FALLBACK_IMAGE} alt="Fallback" className="object-cover w-full h-full opacity-70" />
                    </div>
                  )}
                </div>
                
                {/* Badges */}
                <div className="absolute z-10 flex flex-wrap gap-1 top-2 left-2">
                  {hasDiscount && <span className="badge-discount">-{discountPercentage}%</span>}
                  {product.featured && <span className="badge-primary">Featured</span>}
                  {product.isTrending && <span className="badge-trending">Trending</span>}
                  {flashSaleActive && <span className="badge-flash">Flash</span>}
                  {product.isJustArrived && <span className="badge-new">New</span>}
                </div>

                {/* Zoom Controls */}
                <div className="absolute z-10 bottom-2 right-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
                    className="p-1.5 transition-all border rounded-full bg-black/50 backdrop-blur-md border-white/10 hover:border-blue-500/50"
                  >
                    {isZooming ? (
                      <FiMinimize2 className="w-3 h-3 text-white" />
                    ) : (
                      <FiMaximize2 className="w-3 h-3 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex w-56 gap-2 mx-auto lg:w-72 lg:mx-0">
                  {productImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border ${
                        selectedImageIndex === index ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-700'
                      }`}
                    >
                      <img src={image.url} alt="" className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="flex-1 space-y-3">
            {/* Category */}
            <div className="flex gap-1">
              <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-500 border rounded-full bg-blue-500/10 border-blue-500/30">
                {product.category || 'Uncategorized'}
              </span>
              {product.subcategory && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium text-purple-500 border rounded-full bg-purple-500/10 border-purple-500/30">
                  {product.subcategory}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="product-title">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(parseFloat(averageRating), "w-3.5 h-3.5")}
              </div>
              <span className="text-xs text-gray-400">
                {averageRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="price-large">{formatKES(totalPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-sm line-through price-small">
                    {formatKES(product.comparePrice * quantity)}
                  </span>
                  <span className="badge-discount">Save {formatKES(totalSavings)}</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {stockValue > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-500">In Stock</span>
                  <span className="text-xs text-gray-400">({stockValue} units)</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium text-red-500">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-400">
              {product.description || 'No description available.'}
            </p>

            {/* Quantity & Actions */}
            {stockValue > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Quantity */}
                <div className="flex items-center border border-gray-700 rounded-full bg-gradient-to-br from-gray-800 to-gray-900">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="px-2 py-1.5 text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    <FiMinus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-xs font-medium text-center text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(stockValue, prev + 1))}
                    disabled={quantity >= stockValue}
                    className="px-2 py-1.5 text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    <FiPlus className="w-3 h-3" />
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex items-center gap-1 btn-primary"
                >
                  {isAddingToCart ? (
                    <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  ) : (
                    <FiShoppingCart className="w-3 h-3" />
                  )}
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => navigate('/checkout', { state: { product, quantity } })}
                  className="btn-secondary"
                >
                  Buy Now
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className={`btn-wishlist flex items-center gap-1 ${inWishlist ? 'active' : ''}`}
                >
                  <FiHeart className={`w-3 h-3 ${inWishlist ? 'fill-white' : ''}`} />
                  <span>{inWishlist ? 'Remove' : 'Save'}</span>
                </button>
              </div>
            )}

            {/* Shipping Info */}
            {product.requiresShipping !== false && (
              <div className="flex items-center gap-3 pt-1 text-xs text-gray-400">
                {product.freeShipping && <span className="text-green-500">Free Shipping</span>}
                {product.weight > 0 && <span>{product.weight}{product.weightUnit}</span>}
                {product.estimatedDeliveryMin && product.estimatedDeliveryMax && (
                  <span>{product.estimatedDeliveryMin}-{product.estimatedDeliveryMax} days</span>
                )}
              </div>
            )}

            {/* Info Icons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="flex flex-col items-center p-2 info-icon">
                <FiTruck className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-white">Free</span>
                <span className="text-[8px] text-gray-400">Shipping</span>
              </div>
              <div className="flex flex-col items-center p-2 info-icon">
                <FiShield className="w-4 h-4 text-green-500" />
                <span className="text-xs text-white">2Y</span>
                <span className="text-[8px] text-gray-400">Warranty</span>
              </div>
              <div className="flex flex-col items-center p-2 info-icon">
                <FiRefreshCw className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-white">30D</span>
                <span className="text-[8px] text-gray-400">Returns</span>
              </div>
              <div className="flex flex-col items-center p-2 info-icon">
                <FiShare2 className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-white">24/7</span>
                <span className="text-[8px] text-gray-400">Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="mb-3 text-base section-header">REVIEWS</h2>
          
          {/* Rating Summary */}
          <div className="p-3 mb-3 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center gap-4">
              <div className="w-16 text-center">
                <div className="text-2xl font-bold text-white">{averageRating}</div>
                <div className="flex justify-center">{renderStars(parseFloat(averageRating), "w-3 h-3")}</div>
                <p className="text-xs text-gray-400">{totalReviews}</p>
              </div>
              
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-2 text-xs text-gray-300">{star}</span>
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        style={{ width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-4 text-xs text-gray-400">{ratingDistribution[star]}</span>
                  </div>
                ))}
              </div>
              
              <div className="w-20">
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
                    className="w-full btn-primary text-xs py-1.5"
                  >
                    Write Review
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="w-full btn-secondary text-xs py-1.5"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="p-3 mb-3 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <RatingStars interactive={true} size="w-4 h-4" />
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 mt-2 text-sm text-white border border-gray-700 rounded bg-gradient-to-br from-gray-800 to-gray-900"
                placeholder="Share your experience..."
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowReviewForm(false)} className="px-3 py-1 text-xs btn-secondary">Cancel</button>
                <button onClick={handleSubmitReview} disabled={submittingReview} className="px-3 py-1 text-xs btn-primary">
                  {submittingReview ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-2">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id || review.id} className="p-3 testimonial-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <FiUser className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{review.userName || 'Anonymous'}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <FiCalendar className="w-2.5 h-2.5" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {isLoggedIn && currentUser && currentUser.name === review.userName && (
                      <div className="flex gap-1">
                        <button onClick={() => handleEditReview(review)} className="p-1 text-gray-400 hover:text-blue-500">
                          <FiEdit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteReview(review._id)} className="p-1 text-gray-400 hover:text-red-500">
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {renderStars(review.rating, "w-2.5 h-2.5")}
                  </div>
                  <p className="mt-1 text-xs text-gray-300">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center testimonial-card">
                <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-base section-header">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {relatedProducts.slice(0, 4).map((relatedProduct) => {
                const relatedImage = relatedProduct.primaryImage || 
                  relatedProduct.images?.[0]?.url || 
                  relatedProduct.image || 
                  FALLBACK_IMAGE;
                
                return (
                  <div
                    key={relatedProduct._id || relatedProduct.id}
                    onClick={() => {
                      navigate(`/product/${relatedProduct._id || relatedProduct.id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="cursor-pointer group"
                  >
                    <div className="relative mb-1 overflow-hidden border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 aspect-square">
                      <img src={getFullImageUrl(relatedImage)} alt={relatedProduct.name} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-xs font-medium text-white truncate group-hover:text-blue-500">{relatedProduct.name}</h3>
                    <p className="text-xs font-bold text-blue-500">{formatKES(relatedProduct.price)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/95 backdrop-blur-xl" onClick={() => setLightboxOpen(false)}>
          <div className="relative flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
            <div className="relative w-full max-w-4xl">
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3">
                <div className="px-3 py-1 border rounded-full bg-black/50 border-white/10">
                  <span className="text-sm text-white">{selectedImageIndex + 1} / {productImages.length}</span>
                </div>
                <button onClick={() => setLightboxOpen(false)} className="p-2 transition-all border rounded-full bg-black/50 border-white/10 hover:border-red-500/50">
                  <FiX className="w-5 h-5 text-white" />
                </button>
              </div>
              {productImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : productImages.length - 1)} className="absolute p-2 transition-all -translate-y-1/2 border rounded-full left-4 top-1/2 bg-black/50 border-white/10 hover:border-blue-500/50">
                    <FiChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={() => setSelectedImageIndex(prev => prev < productImages.length - 1 ? prev + 1 : 0)} className="absolute p-2 transition-all -translate-y-1/2 border rounded-full right-4 top-1/2 bg-black/50 border-white/10 hover:border-blue-500/50">
                    <FiChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
              <div className="flex items-center justify-center min-h-[70vh]">
                <img src={productImages[selectedImageIndex]?.url} alt={product.name} className="max-w-full max-h-[70vh] object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;