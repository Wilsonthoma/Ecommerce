// src/pages/Product.jsx - Refactored with reusable components
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { clientProductService } from '../services/client/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import LoadingSpinner, { ProductSkeleton } from '../components/ui/LoadingSpinner';
import ProductImageGallery from '../components/layout/ProductImageGallery';
import ProductInfoCard from '../components/ui/ProductInfoCard';
import ProductReviews from '../components/layout/ProductReviews';
import RelatedProducts from '../components/layout/RelatedProducts';
import SectionHeader from '../components/ui/SectionHeader';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Constants
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg';
const productHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg";

// Styles
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
  
  .text-gradient-yellow-orange {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .badge-discount {
    background: linear-gradient(135deg, #EF4444, #F59E0B);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .badge-primary, .badge-featured, .badge-trending, .badge-flash, .badge-new {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    font-weight: 600;
    text-transform: uppercase;
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
    border-color: #F59E0B;
    transform: translateY(-1px);
  }
  
  .testimonial-card {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.5) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 0.75rem;
    transition: all 0.3s ease;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

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
`;

const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, refreshCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewPagination, setReviewPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Performance tracking (internal)
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);

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

  // Add styles
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

  // Fetch product data
  useEffect(() => {
    fetchProductData();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      
      const response = await clientProductService.getProduct(id);
      
      const endTime = performance.now();
      const loadTimeMs = (endTime - startTime).toFixed(0);
      setLoadTime(loadTimeMs);
      setFromCache(response?.cached || false);
      
      if (response.success) {
        const productData = response.product || response.data;
        setProduct(productData);
        setRelatedProducts(response.relatedProducts || []);
        
        console.log(`⚡ Product loaded in ${loadTimeMs}ms ${response?.cached ? '(from LRU Cache)' : '(from API)'}`);
        
        setTimeout(() => AOS.refresh(), 500);
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

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return FALLBACK_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_URL}/${imagePath}`;
    return `${API_URL}/uploads/products/${imagePath}`;
  };

  const getProductImages = () => {
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

  const getStockValue = () => {
    return product?.quantity || product?.stock || 0;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    const success = await addToCart(product, quantity);
    if (success) await refreshCart();
    setIsAddingToCart(false);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    try {
      const directCheckoutItem = {
        id: product._id || product.id,
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images?.[0]?.url || product.image,
        images: product.images || [],
        description: product.description || '',
        category: product.category || '',
        stockQuantity: product.stockQuantity || product.stock || product.quantity || 10,
        requiresShipping: product.requiresShipping !== false,
        freeShipping: product.freeShipping || false,
        weight: product.weight || 0,
        estimatedDeliveryMin: product.estimatedDeliveryMin || null,
        estimatedDeliveryMax: product.estimatedDeliveryMax || null
      };

      sessionStorage.setItem('directCheckout', JSON.stringify({
        items: [directCheckoutItem],
        totalQuantity: quantity,
        totalPrice: product.price * quantity
      }));

      navigate('/checkout', { 
        state: { 
          directCheckout: true,
          items: [directCheckoutItem],
          totalAmount: product.price * quantity
        } 
      });

      toast.info('Proceeding to checkout...');
    } catch (error) {
      console.error('Error preparing checkout:', error);
      toast.error('Failed to proceed to checkout');
    }
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
      console.error('Error submitting review:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already reviewed')) {
        toast.error('You have already reviewed this product');
        await fetchReviews();
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit review');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setUserRating(review.rating);
    setReviewText(review.comment || review.review || '');
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

  const userHasReviewed = reviews.some(review => 
    review.userName === currentUser?.name || 
    (review.userId && review.userId === currentUser?.id)
  );

  const totalReviews = reviews.length || product?.reviewsCount || 0;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : (product?.rating || 0);
  const flashSaleActive = product?.isFlashSale && (!product.flashSaleEndDate || new Date() < new Date(product.flashSaleEndDate));
  const stockValue = getStockValue();
  const inWishlist = isInWishlist(product?._id || product?.id);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      {/* Header Image */}
      <div className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64">
        <div className="absolute inset-0">
          <img 
            src={productHeaderImage}
            alt="Product Details"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <SectionHeader 
                title="PRODUCT DETAILS"
                showImage={false}
              />
              <p className="mt-2 text-sm text-gray-300 sm:text-base">{product.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative px-4 py-6 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-4 text-xs">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-yellow-500">Home</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <button onClick={() => navigate('/shop')} className="text-gray-400 hover:text-yellow-500">Shop</button>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="max-w-[150px] font-medium text-white truncate sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Image Gallery */}
          <div className="flex-shrink-0 lg:w-72">
            <ProductImageGallery
              images={getProductImages()}
              productName={product.name}
              hasDiscount={product.comparePrice && product.comparePrice > product.price}
              discountPercentage={product.comparePrice && product.comparePrice > product.price 
                ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                : 0}
              flashSaleActive={flashSaleActive}
              isTrending={product.isTrending}
              isNew={product.isJustArrived}
            />
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <ProductInfoCard
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onWishlistToggle={handleWishlistToggle}
              inWishlist={inWishlist}
              isAddingToCart={isAddingToCart}
              stockValue={stockValue}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews
          reviews={reviews}
          totalReviews={totalReviews}
          averageRating={averageRating}
          ratingDistribution={ratingDistribution}
          userHasReviewed={userHasReviewed}
          isLoggedIn={isLoggedIn}
          showReviewForm={showReviewForm}
          setShowReviewForm={setShowReviewForm}
          userRating={userRating}
          setUserRating={setUserRating}
          reviewText={reviewText}
          setReviewText={setReviewText}
          submittingReview={submittingReview}
          onSubmitReview={handleSubmitReview}
          onEditReview={handleEditReview}
          onDeleteReview={handleDeleteReview}
          formatDate={formatDate}
        />

        {/* Related Products */}
        <RelatedProducts
          products={relatedProducts}
          onProductClick={(productId) => navigate(`/product/${productId}`)}
        />
      </div>
    </div>
  );
};

export default Product;