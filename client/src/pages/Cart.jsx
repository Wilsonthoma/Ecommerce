// src/pages/Cart.jsx - COMPACT with Yellow-Orange Theme
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  Shield,
  ChevronRight,
  ShoppingCart,
  Package,
  X,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { BsArrowRight } from 'react-icons/bs';
import { FiMapPin } from 'react-icons/fi';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Font styles - UPDATED with yellow-orange theme
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .section-title {
    font-weight: 800;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin-bottom: 0;
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  /* COMPACT TEXT SIZES */
  .text-2xl {
    font-size: 1.2rem;
  }
  
  .text-lg {
    font-size: 0.95rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .text-xs {
    font-size: 0.65rem;
  }
`;

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
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
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d-content {
    transform: translateZ(15px);
  }
`;

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';

// Cart header image
const cartHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for header - UPDATED to yellow-orange
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

// Top Bar Component - UPDATED colors
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-2 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          <FiMapPin className="w-3 h-3" />
          FIND STORE
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    loading,
    getCartSummary
  } = useCart();

  // State for image gallery
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

  // Inject styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = fontStyles + animationStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Format KES
  const formatKES = (amount) => {
    if (!amount && amount !== 0) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
  };

  // Get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return FALLBACK_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    return `${API_URL}/uploads/products/${imagePath}`;
  };

  // Handle quantity change
  const handleQuantityChange = async (item, change) => {
    const newQuantity = item.quantity + change;
    const maxStock = item.stockQuantity || 10;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      await updateQuantity(item.id || item.productId, newQuantity);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (item) => {
    await removeFromCart(item.id || item.productId);
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  // Handle image click
  const handleImageClick = (item, index) => {
    setSelectedProduct(item);
    setLightboxImages(item.images || []);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Navigate lightbox
  const navigateLightbox = (direction) => {
    if (direction === 'prev') {
      setLightboxIndex(prev => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
    } else {
      setLightboxIndex(prev => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
    }
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImages([]);
    setSelectedProduct(null);
  };

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  // Get stock badge - UPDATED colors
  const getStockBadge = (item) => {
    if ((item.stockQuantity || 10) <= 0) {
      return { bg: 'bg-gradient-to-r from-red-600 to-pink-600', label: 'Sold Out', icon: <AlertCircle className="w-3 h-3" /> };
    } else if ((item.stockQuantity || 10) <= 5) {
      return { bg: 'bg-gradient-to-r from-yellow-600 to-orange-600', label: 'Low Stock', icon: <AlertCircle className="w-3 h-3" /> };
    } else {
      return { bg: 'bg-gradient-to-r from-green-600 to-emerald-600', label: 'In Stock', icon: <CheckCircle className="w-3 h-3" /> };
    }
  };

  const summary = getCartSummary();
  const subtotal = summary.subtotal;

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="w-36 h-6 mb-6 bg-gray-800 rounded"></div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="h-32 bg-gray-800 rounded"></div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="h-48 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <div className="container px-4 py-10 mx-auto">
          <div 
            className="max-w-md mx-auto text-center"
            data-aos="zoom-in"
            data-aos-duration="1200"
          >
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

      {/* Cart Header Image - COMPACT */}
      <div 
        className="relative w-full h-36 overflow-hidden sm:h-44 md:h-48"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={cartHeaderImage}
            alt="Shopping Cart"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
            >
              <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                SHOPPING CART
              </h1>
              <p className="text-xs text-gray-300 sm:text-sm">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumbs - COMPACT */}
        <nav 
          className="flex items-center gap-1 mb-4 text-xs"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <Link to="/" className="text-gray-400 transition-colors hover:text-yellow-500">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <Link to="/shop" className="text-gray-400 transition-colors hover:text-yellow-500">Shop</Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Shopping Cart</span>
        </nav>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Cart Items */}
          <div 
            className="lg:col-span-2"
            data-aos="fade-right"
            data-aos-duration="1000"
          >
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
                  
                  if (selectedImageIndex[item.id] === undefined) {
                    setTimeout(() => {
                      setSelectedImageIndex(prev => ({ ...prev, [item.id]: 0 }));
                    }, 0);
                  }
                  
                  const currentImageIndex = selectedImageIndex[item.id] || 0;
                  const currentImage = images[currentImageIndex] || { url: FALLBACK_IMAGE };
                  
                  return (
                    <div 
                      key={item.id} 
                      className="p-3 transition-colors hover:bg-white/5 group card-3d"
                      data-aos="flip-up"
                      data-aos-duration="1000"
                      data-aos-delay={500 + (index * 100)}
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                      <div className="relative card-3d-content">
                        <div className="flex gap-3">
                          {/* Image - COMPACT */}
                          <div className="relative flex-shrink-0">
                            <div className="relative w-20 h-20 group/image">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded opacity-0 group-hover/image:opacity-30 blur transition-opacity"></div>
                              <img 
                                src={getFullImageUrl(currentImage.url)} 
                                alt={item.name}
                                className="relative object-contain w-full h-full rounded cursor-pointer"
                                onClick={() => handleImageClick(item, currentImageIndex)}
                              />
                            </div>
                            
                            {/* Thumbnails - COMPACT */}
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
                          
                          {/* Item Details - COMPACT */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                                <p className="text-xs text-gray-400">{formatKES(price)} each</p>
                                
                                {/* Stock Badge - COMPACT */}
                                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 text-xs font-medium text-white rounded-full ${stockBadge.bg}`}>
                                  {stockBadge.icon}
                                  {stockBadge.label}
                                </div>
                                
                                {/* Quantity Controls - COMPACT */}
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
                                  <span className="text-sm font-medium text-yellow-500">= {formatKES(itemTotal)}</span>
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
          
          {/* Order Summary - COMPACT */}
          <div 
            className="lg:col-span-1"
            data-aos="fade-left"
            data-aos-duration="1000"
          >
            <div className="sticky p-4 bg-gray-900 border border-gray-800 rounded-xl top-4">
              <h2 className="flex items-center gap-1 mb-3 text-sm font-semibold text-white">
                <Package className="w-4 h-4 text-yellow-500" />
                Order Summary
              </h2>
              
              {/* Items List - COMPACT */}
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
              
              {/* Totals - COMPACT */}
              <div className="pt-3 space-y-2 text-xs border-t border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(subtotal)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-800">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-yellow-500 glow-text">{formatKES(subtotal)}</span>
                  </div>
                </div>
              </div>
              
              {/* Checkout Button - COMPACT */}
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
              
              {/* Security Note - COMPACT */}
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-yellow-500">
                <Shield className="w-3 h-3" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal - UPDATED colors */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="relative w-4/5 max-w-4xl">
            <button
              onClick={closeLightbox}
              className="absolute p-2 transition-all rounded-full shadow-lg -right-2 -top-12 bg-gray-900 border border-gray-700 hover:border-yellow-500/50 group sm:-right-12 sm:-top-12"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
              <X className="relative w-5 h-5 text-gray-400 transition-colors group-hover:text-white" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-0 z-10 p-2 transition-all -translate-x-12 -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-gray-900 border border-gray-700 hover:border-yellow-500/50 group"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400 transition-colors group-hover:text-yellow-500" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-0 z-10 p-2 transition-all translate-x-12 -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-gray-900 border border-gray-700 hover:border-yellow-500/50 group"
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
      
      {/* Custom Scrollbar Styles - UPDATED colors */}
      <style jsx>{`
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