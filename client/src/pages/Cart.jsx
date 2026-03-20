// src/pages/Cart.jsx - Updated with LoadingSpinner
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { clientProductService } from '../services/client/products';
import { toast } from 'react-toastify';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart,
  Package,
  X,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { BsArrowRight } from 'react-icons/bs';
import LoadingSpinner, { CardSkeleton, ContentLoader } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import Price, { formatKES } from '../components/ui/Price';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';

// Cart header image
const cartHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
  return `${API_URL}/uploads/products/${imagePath}`;
};

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    loading: cartLoading,
    getCartSummary
  } = useCart();

  const [initialLoad, setInitialLoad] = useState(true);
  const [productDetails, setProductDetails] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 30,
      easing: 'ease-out-cubic',
    });
  }, []);

  // Fetch additional product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!cart.items.length) {
        setInitialLoad(false);
        return;
      }

      setLoadingProducts(true);
      try {
        const productIds = cart.items.map(item => item.id || item.productId);
        const response = await clientProductService.getProductsByIds?.(productIds);
        
        if (response?.success) {
          const detailsMap = {};
          response.products.forEach(product => {
            detailsMap[product.id] = product;
          });
          setProductDetails(detailsMap);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoadingProducts(false);
        setInitialLoad(false);
      }
    };

    fetchProductDetails();
  }, [cart.items]);

  const handleQuantityChange = async (item, change) => {
    const newQuantity = item.quantity + change;
    const maxStock = item.stockQuantity || 10;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      await updateQuantity(item.id || item.productId, newQuantity);
    }
  };

  const handleRemoveItem = async (item) => {
    await removeFromCart(item.id || item.productId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleImageClick = (item, index) => {
    setSelectedProduct(item);
    setLightboxImages(item.images || []);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction) => {
    if (direction === 'prev') {
      setLightboxIndex(prev => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
    } else {
      setLightboxIndex(prev => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setSelectedProduct(null);
  };

  const handleProceedToCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const getStockBadge = (item) => {
    const stockQty = item.stockQuantity || 10;
    if (stockQty <= 0) {
      return { bg: 'bg-gradient-to-r from-red-600 to-pink-600', label: 'Sold Out', icon: <AlertCircle className="w-3 h-3" /> };
    } else if (stockQty <= 5) {
      return { bg: 'bg-gradient-to-r from-yellow-600 to-orange-600', label: 'Low Stock', icon: <AlertCircle className="w-3 h-3" /> };
    } else {
      return { bg: 'bg-gradient-to-r from-green-600 to-emerald-600', label: 'In Stock', icon: <CheckCircle className="w-3 h-3" /> };
    }
  };

  const summary = getCartSummary();
  const subtotal = summary.subtotal;

  // Loading states
  if (cartLoading || (loadingProducts && initialLoad)) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="SHOPPING CART" 
          subtitle="Loading your cart..."
          image={cartHeaderImage}
        />
        <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
          <CardSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="SHOPPING CART" 
          subtitle="Your cart is empty"
          image={cartHeaderImage}
        />
        <div className="container px-4 py-10 mx-auto">
          <div className="max-w-md mx-auto text-center" data-aos="zoom-in">
            <div className="relative inline-block mb-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-50 blur-xl"></div>
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">Your Cart is Empty</h1>
            <p className="mb-6 text-sm text-gray-400">Add some products to your cart to continue shopping</p>
            <Link 
              to="/shop" 
              className="relative inline-flex items-center gap-2 px-5 py-2.5 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
              <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
              <span className="relative flex items-center gap-2">
                Continue Shopping
                <BsArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="SHOPPING CART" 
        subtitle={`${cart.items.length} ${cart.items.length === 1 ? 'item' : 'items'} in your cart`}
        image={cartHeaderImage}
      />

      <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 mb-4 text-xs">
          <Link to="/" className="text-gray-400 transition-colors hover:text-yellow-500">Home</Link>
          <ChevronRightIcon className="w-3 h-3 text-gray-600" />
          <Link to="/shop" className="text-gray-400 transition-colors hover:text-yellow-500">Shop</Link>
          <ChevronRightIcon className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Shopping Cart</span>
        </nav>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-white">Cart Items ({cart.items.length})</h2>
                <button 
                  onClick={handleClearCart}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-red-500 transition-colors rounded hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Cart
                </button>
              </div>
              
              <div className="divide-y divide-gray-800">
                {cart.items.map((item, index) => {
                  const price = item.discountPrice || item.price || 0;
                  const itemTotal = price * item.quantity;
                  const stockBadge = getStockBadge(item);
                  const images = item.images || [];
                  const enhancedDetails = productDetails[item.id] || {};
                  
                  if (selectedImageIndex[item.id] === undefined) {
                    setTimeout(() => {
                      setSelectedImageIndex(prev => ({ ...prev, [item.id]: 0 }));
                    }, 0);
                  }
                  
                  const currentImageIndex = selectedImageIndex[item.id] || 0;
                  const currentImage = images[currentImageIndex] || { url: FALLBACK_IMAGE };
                  
                  return (
                    <div key={item.id} className="p-3 transition-colors hover:bg-white/5 group">
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="relative flex-shrink-0">
                          <div className="relative w-20 h-20 group/image">
                            <img 
                              src={getFullImageUrl(currentImage.url)} 
                              alt={item.name}
                              className="relative object-contain w-full h-full rounded cursor-pointer"
                              onClick={() => handleImageClick(item, currentImageIndex)}
                            />
                          </div>
                          
                          {/* Thumbnails */}
                          {images.length > 1 && (
                            <div className="flex gap-1 mt-1">
                              {images.slice(0, 3).map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedImageIndex(prev => ({ ...prev, [item.id]: idx }))}
                                  className={`w-5 h-5 rounded overflow-hidden border transition-all ${
                                    currentImageIndex === idx 
                                      ? 'border-yellow-500 ring-1 ring-yellow-500/50' 
                                      : 'border-gray-700 hover:border-gray-600'
                                  }`}
                                >
                                  <img 
                                    src={getFullImageUrl(img.url)} 
                                    alt={`${item.name} ${idx + 1}`}
                                    className="object-cover w-full h-full"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                              <Price price={price} size="xs" className="text-xs text-gray-400" />
                              
                              {/* Stock Badge */}
                              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 text-xs font-medium text-white rounded-full ${stockBadge.bg}`}>
                                {stockBadge.icon}
                                {stockBadge.label}
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center overflow-hidden bg-gray-800 border border-gray-700 rounded-lg">
                                  <button 
                                    onClick={() => handleQuantityChange(item, -1)}
                                    className="px-1.5 py-1 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-xs font-medium text-center text-white">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => handleQuantityChange(item, 1)}
                                    className="px-1.5 py-1 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                                    disabled={item.quantity >= (item.stockQuantity || 10)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <Price price={itemTotal} size="sm" className="text-yellow-500" />
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveItem(item)}
                              className="p-1 text-gray-500 transition-colors rounded hover:text-red-500 hover:bg-red-500/10"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-3">
              <Link to="/shop" className="inline-flex items-center text-xs text-yellow-500 transition-colors hover:text-yellow-400">
                <ChevronLeft className="w-3 h-3 mr-1" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky p-4 bg-gray-900 border border-gray-800 rounded-xl top-4">
              <h2 className="flex items-center gap-1 mb-3 text-sm font-semibold text-white">
                <Package className="w-4 h-4 text-yellow-500" />
                Order Summary
              </h2>
              
              {/* Items List */}
              <div className="mb-3 space-y-1 overflow-y-auto text-xs max-h-40 custom-scrollbar">
                {cart.items.map((item) => {
                  const price = item.discountPrice || item.price || 0;
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-400 truncate max-w-[120px]">
                        {item.name} <span className="text-gray-500">×{item.quantity}</span>
                      </span>
                      <span className="font-medium text-white">{formatKES(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Totals */}
              <div className="pt-3 space-y-2 text-xs border-t border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(subtotal)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-800">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-yellow-500">{formatKES(subtotal)}</span>
                  </div>
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                disabled={cart.items.length === 0}
                className="relative w-full py-2.5 mt-4 overflow-hidden text-sm font-medium text-white transition-all rounded-full group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
                <span className="relative flex items-center justify-center gap-1">
                  Proceed to Checkout
                  <BsArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="relative w-4/5 max-w-4xl">
            <button
              onClick={closeLightbox}
              className="absolute p-2 transition-all bg-gray-900 border border-gray-700 rounded-full shadow-lg -right-2 -top-12 hover:border-yellow-500/50 group sm:-right-12"
            >
              <X className="relative w-5 h-5 text-gray-400 transition-colors group-hover:text-white" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-0 z-10 p-2 transition-all -translate-x-12 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-full shadow-lg top-1/2 hover:border-yellow-500/50 group"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400 transition-colors group-hover:text-yellow-500" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-0 z-10 p-2 transition-all translate-x-12 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-full shadow-lg top-1/2 hover:border-yellow-500/50 group"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 transition-colors group-hover:text-yellow-500" />
                </button>
              </>
            )}

            <div className="relative overflow-hidden bg-gray-900 border border-gray-700 rounded-xl">
              <img 
                src={getFullImageUrl(lightboxImages[lightboxIndex]?.url)} 
                alt={selectedProduct?.name || 'Product'} 
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              <div className="absolute px-3 py-1 text-xs font-medium text-white rounded-full bottom-4 right-4 bg-gradient-to-r from-yellow-600 to-orange-600">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Cart;