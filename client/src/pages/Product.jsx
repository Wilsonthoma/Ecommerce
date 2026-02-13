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
  FiZoomIn
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { clientProductService } from '../services/client/products';
import { cartService } from '../services/client/cart';
import { useCart } from '../context/CartContext';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

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

  useEffect(() => {
    fetchProductData();
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

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
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
  const discountedPrice = product.discountPrice || product.price;
  const originalPrice = product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) 
    : 0;

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

        {/* Product Main Section - REDUCED IMAGE SIZE */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Product Images - SMALLER SIZE */}
          <div className="space-y-3">
            {/* Main Image - REDUCED HEIGHT */}
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
            </div>

            {/* Thumbnail Gallery - SMALLER THUMBNAILS */}
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

          {/* Product Info - COMPACT */}
          <div className="space-y-4">
            {/* Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full sm:px-3 sm:py-1">
                  {product.category || 'Uncategorized'}
                </span>
              </div>
              <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  KSh {Math.round(discountedPrice).toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through sm:text-lg">
                      KSh {Math.round(originalPrice).toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded sm:px-2 sm:py-1">
                      -{discountPercentage}%
                    </span>
                  </>
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
                    ({stockValue} units)
                  </span>
                </>
              ) : (
                <>
                  <FiMinus className="w-4 h-4 text-red-600 sm:w-5 sm:h-5" />
                  <span className="font-medium text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description - COMPACT */}
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
                    Max: {stockValue}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons - COMPACT */}
            <div className="pt-3 space-y-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      setIsAddingToCart(true);
                      await cartService.addToCart(product._id || product.id, quantity);
                      toast.success(`Added ${quantity} × ${product.name} to cart`);
                      await refreshCart();
                    } catch (error) {
                      toast.error('Failed to add item to cart');
                    } finally {
                      setIsAddingToCart(false);
                    }
                  }}
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

            {/* Shipping Info - COMPACT GRID */}
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

        {/* Related Products - SMALLER CARDS */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                      <p className="text-sm font-bold text-blue-600 sm:text-base">
                        KSh {Math.round(relatedProduct.discountPrice || relatedProduct.price).toLocaleString()}
                      </p>
                      {relatedProduct.discountPrice && (
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

      {/* Lightbox Modal - Keep full size for zoom */}
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