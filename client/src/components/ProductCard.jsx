// src/components/ProductCard.jsx - RESTYLED with hover-only icons, tiny badges, and thin gradient border
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiHeart, FiCreditCard } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

// Font styles matching homepage EXACTLY
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  .product-card {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    background: #111827; /* gray-900 */
    border: 1px solid #1F2937; /* gray-800 */
    border-radius: 0.75rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  /* Thin yellow-orange gradient border on hover */
  .product-card::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1.5px; /* Thin border */
    background: linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    border-radius: 0.75rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }
  
  .product-card:hover::before {
    opacity: 1;
  }
  
  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.2);
  }
  
  .product-card-title {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    color: #FFFFFF;
    line-height: 1.4;
    margin-bottom: 0.2rem;
    letter-spacing: -0.01em;
    transition: color 0.2s ease;
  }
  
  .product-card-title:hover {
    color: #60A5FA;
  }
  
  .product-card-price {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }
  
  .product-card-price-discounted {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    background: linear-gradient(135deg, #60A5FA, #C084FC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .product-card-old-price {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.75rem;
    color: #9CA3AF;
    text-decoration: line-through;
    margin-left: 0.2rem;
  }
  
  .product-card-category {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9CA3AF;
  }
  
  /* EXTRA TINY BADGES - 50% smaller */
  .badge-card {
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    line-height: 1.2;
  }
  
  .badge-discount-card {
    background: linear-gradient(135deg, #EF4444, #F59E0B);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3);
  }
  
  .badge-featured-card {
    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    box-shadow: 0 2px 5px rgba(59, 130, 246, 0.3);
    display: inline-flex;
    align-items: center;
    gap: 0.1rem;
  }
  
  .badge-trending-card {
    background: linear-gradient(135deg, #8B5CF6, #EC4899);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    box-shadow: 0 2px 5px rgba(139, 92, 246, 0.3);
  }
  
  .badge-flash-card {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);
  }
  
  .badge-new-card {
    background: linear-gradient(135deg, #10B981, #3B82F6);
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
  }
  
  .stock-badge-card {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.5rem;
    padding: 0.1rem 0.4rem;
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
    font-size: 0.55rem;
    color: #6B7280;
  }
  
  .product-save-text {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.55rem;
    color: #10B981;
    margin-top: 0.1rem;
  }

  /* Action buttons - hidden by default, show on hover */
  .action-buttons {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .product-card:hover .action-buttons {
    opacity: 1;
  }
  
  .action-button {
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    transition: all 0.2s ease;
    border: 1px solid rgba(75, 85, 99, 0.5);
    background: rgba(17, 24, 39, 0.9);
    backdrop-filter: blur(4px);
  }
  
  .action-button:hover {
    transform: scale(1.1);
  }
  
  .action-button svg {
    width: 14px;
    height: 14px;
  }
  
  .btn-buy-now {
    background: linear-gradient(135deg, #10B981, #059669);
    border: none;
  }
  
  .btn-buy-now:hover {
    background: linear-gradient(135deg, #059669, #047857);
  }
  
  .btn-cart {
    background: #3B82F6;
    border: none;
  }
  
  .btn-cart:hover {
    background: #2563EB;
  }
  
  .btn-wishlist:hover {
    border-color: #EF4444;
    background: rgba(239, 68, 68, 0.2);
  }
  
  .btn-view:hover {
    border-color: #3B82F6;
    background: rgba(59, 130, 246, 0.2);
  }
  
  /* Bottom gradient - completely blended with background */
  .image-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, #111827, transparent);
    pointer-events: none;
    z-index: 1;
  }
  
  /* Remove loading spinner */
  .loading-spinner {
    display: none;
  }
  
  /* Tiny star icons */
  .star-icon {
    width: 12px;
    height: 12px;
  }
`;

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600';

const ProductCard = ({ product, hideBuyNow = false }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Safety check
  if (!product) {
    console.error('❌ ProductCard received null product');
    return null;
  }

  // Extract product data with fallbacks for all fields
  const productId = product._id || product.id;
  const productName = product.name || 'Product Name';
  const productPrice = product.price || 0;
  const productComparePrice = product.comparePrice || null;
  const productCategory = product.category || '';
  const productRating = product.rating || 0;
  const productReviews = product.reviewsCount || product.reviews || 0;
  
  // Get stock from either quantity or stock field
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

  // Determine stock status
  const isInStock = productStock > 0;
  const stockStatus = productStock > 10 ? 'in-stock' : 
                      productStock > 0 ? 'low-stock' : 
                      'out-of-stock';

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
        stars.push(<AiFillStar key={i} className="star-icon text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <AiFillStar className="star-icon text-gray-600" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <AiFillStar className="star-icon text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<AiFillStar key={i} className="star-icon text-gray-600" />);
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
    
    if (!isInStock) {
      toast.error('Product is out of stock');
      return;
    }
    
    const token = localStorage.getItem('token');
    
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
      
      await addToCart(completeProduct, 1);
      
      toast.success(`${productName} added to cart!`, {
        icon: '🛒',
        duration: 2000
      });
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInStock) {
      toast.error('Product is out of stock');
      return;
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    
    setIsBuying(true);
    
    try {
      // Create direct checkout item
      const directCheckoutItem = {
        id: productId,
        productId: productId,
        name: productName,
        price: productPrice,
        discountPrice: productComparePrice && productComparePrice > productPrice ? productComparePrice : null,
        quantity: 1,
        image: getImageUrl(),
        images: product.images || [],
        category: productCategory,
        stockQuantity: productStock,
        requiresShipping: true,
        freeShipping: false,
        flatShippingRate: 0
      };

      // Store in sessionStorage as backup
      sessionStorage.setItem('directCheckout', JSON.stringify({
        items: [directCheckoutItem],
        totalQuantity: 1,
        totalPrice: productPrice
      }));

      // Navigate to checkout
      navigate('/checkout', { 
        state: { 
          directCheckout: true,
          items: [directCheckoutItem],
          totalAmount: productPrice
        } 
      });

      toast.info('Proceeding to checkout...');
      
    } catch (error) {
      console.error('Error preparing checkout:', error);
      toast.error('Failed to proceed to checkout');
    } finally {
      setIsBuying(false);
    }
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <style>{fontStyles}</style>
      <div className="product-card group">
        {/* Thin yellow-orange gradient border appears on hover */}
        
        <div className="relative flex flex-col h-full">
          {/* Image Container */}
          <div className="relative w-full overflow-hidden bg-gray-800 aspect-square">
            {/* No loading spinner - removed */}
            
            {/* Product Image */}
            <img
              src={getImageUrl()}
              alt={productName}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 cursor-pointer ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-100 scale-105'
              } group-hover:scale-110`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={handleViewDetails}
              loading="lazy"
            />
            
            {/* Gradient Overlay - completely blended with background */}
            <div className="image-gradient"></div>
            
            {/* Top Badges - EXTRA TINY */}
            <div className="absolute z-10 flex flex-wrap gap-1 top-2 left-2">
              {hasDiscount && (
                <span className="badge-discount-card">
                  -{discountPercentage}%
                </span>
              )}
              {productFeatured && (
                <span className="badge-featured-card">
                  <FiEye className="w-2.5 h-2.5" />
                </span>
              )}
              {productIsTrending && (
                <span className="badge-trending-card">
                  🔥
                </span>
              )}
              {productIsFlashSale && (
                <span className="badge-flash-card">
                  ⚡
                </span>
              )}
              {productIsJustArrived && (
                <span className="badge-new-card">
                  NEW
                </span>
              )}
            </div>
            
            {/* Stock Status - EXTRA TINY */}
            <div className="absolute z-10 bottom-2 left-2">
              <span className={`stock-badge-card ${stockStatus}`}>
                {productStock > 10 ? 'In Stock' : 
                 productStock > 0 ? `${productStock} left` : 
                 'Sold Out'}
              </span>
            </div>
            
            {/* Action Buttons - Hidden by default, show on hover */}
            <div className="action-buttons absolute z-30 flex gap-1.5 bottom-2 right-2">
              {/* Wishlist Button */}
              {isLoggedIn && (
                <button
                  onClick={handleWishlistToggle}
                  className="action-button btn-wishlist"
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart
                    className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-300'}
                  />
                </button>
              )}
              
              {/* View Details Button */}
              <button
                onClick={handleViewDetails}
                className="action-button btn-view"
                title="View Details"
              >
                <FiEye className="text-white" />
              </button>
              
              {/* Buy Now Button */}
              {!hideBuyNow && isInStock && (
                <button
                  onClick={handleBuyNow}
                  disabled={isBuying}
                  className="action-button btn-buy-now"
                  title="Buy Now"
                >
                  {isBuying ? (
                    <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  ) : (
                    <FiCreditCard className="text-white" />
                  )}
                </button>
              )}
              
              {/* Add to Cart Button */}
              {isInStock && (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="action-button btn-cart"
                  title="Add to Cart"
                >
                  {isAdding ? (
                    <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  ) : (
                    <FiShoppingCart className="text-white" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Product Info - Clickable to product page */}
          <div className="flex-1 p-2 bg-gray-900 cursor-pointer" onClick={handleViewDetails}>
            {/* Category */}
            {productCategory && (
              <div className="mb-0.5">
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
            <div className="flex items-center gap-1 mt-0.5 mb-1">
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