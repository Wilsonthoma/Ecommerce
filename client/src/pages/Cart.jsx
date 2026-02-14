// client/src/pages/Cart.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Lock,
  ChevronRight,
  Tag,
  ShoppingCart,
  Package,
  Shield,
  CreditCard,
  Smartphone,
  Wallet,
  X,
  ZoomIn,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Box,
  Globe,
  Clock
} from 'lucide-react';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    loading,
    getCartSummary,
    calculateItemShipping,
    calculateTotalShipping
  } = useCart();

  // State for image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('mpesa');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Payment methods
  const paymentMethods = [
    { 
      id: 'mpesa', 
      name: 'M-Pesa', 
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Pay via M-Pesa (Safaricom)',
      processing: 'Instant confirmation'
    },
    { 
      id: 'delivery', 
      name: 'Pay on Delivery', 
      icon: <Wallet className="w-5 h-5" />,
      description: 'Cash or card on delivery',
      processing: 'Pay when you receive'
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Secure PayPal payment',
      processing: 'Instant confirmation'
    }
  ];

  // Shipping methods with costs
  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping', days: '5-7 business days', cost: 0 },
    { id: 'express', name: 'Express Shipping', days: '2-3 business days', cost: 500 },
    { id: 'overnight', name: 'Overnight Shipping', days: 'Next business day', cost: 1500 }
  ];

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
    } else if (newQuantity > maxStock) {
      toast.warning(`Only ${maxStock} units available`);
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
    }
  };

  // Handle image click - open lightbox with all images
  const handleImageClick = (item, index) => {
    setSelectedProduct(item);
    setLightboxImages(item.images || []);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Navigate lightbox images
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

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      const summary = getCartSummary(selectedShippingMethod);
      
      localStorage.setItem('selectedPayment', selectedPayment);
      localStorage.setItem('selectedShipping', selectedShippingMethod);
      localStorage.setItem('cartSubtotal', summary.subtotal);
      localStorage.setItem('cartShipping', summary.shipping);
      localStorage.setItem('cartTotal', summary.total);
      
      navigate('/checkout');
    } catch (error) {
      toast.error('Failed to proceed to checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Get stock status badge
  const getStockBadge = (item) => {
    if (item.stockStatus === 'sold') {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        label: 'Sold Out',
        icon: <AlertCircle className="w-3 h-3" />
      };
    } else if (item.stockStatus === 'low') {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        label: 'Low Stock',
        icon: <AlertCircle className="w-3 h-3" />
      };
    } else if (item.stockStatus === 'backorder') {
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
        label: 'Available (Backorder)',
        icon: <CheckCircle className="w-3 h-3" />
      };
    } else {
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        label: 'Available',
        icon: <CheckCircle className="w-3 h-3" />
      };
    }
  };

  // Format zone name
  const formatZoneName = (zone) => {
    const zoneNames = {
      'na': 'North America',
      'eu': 'Europe',
      'asia': 'Asia',
      'africa': 'Africa',
      'sa': 'South America',
      'oceania': 'Oceania'
    };
    return zoneNames[zone] || zone;
  };

  // Get cart summary with current shipping method
  const summary = getCartSummary(selectedShippingMethod);
  
  // Calculate totals
  const subtotal = summary.subtotal;
  const totalShipping = summary.shipping;
  const grandTotal = summary.total;

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="max-w-6xl px-4 mx-auto">
          <div className="animate-pulse">
            <div className="w-48 h-8 mb-8 bg-gray-200 rounded"></div>
            <div className="p-6 bg-white shadow-lg rounded-2xl">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="max-w-6xl px-4 mx-auto">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
          <p className="mb-8 text-gray-600">Items you add to your cart will appear here</p>
          
          <div className="p-12 text-center bg-white shadow-lg rounded-2xl">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100">
              <ShoppingCart className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-800">Your cart is empty</h2>
            <p className="max-w-md mx-auto mb-8 text-gray-600">
              Looks like you haven't added any items to your cart yet. Start shopping to find amazing products!
            </p>
            <Link 
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li><ChevronRight className="w-4 h-4 text-gray-400" /></li>
            <li>
              <Link to="/shop" className="text-gray-500 hover:text-gray-700">Shop</Link>
            </li>
            <li><ChevronRight className="w-4 h-4 text-gray-400" /></li>
            <li className="font-medium text-gray-900">Shopping Cart</li>
          </ol>
        </nav>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mb-8 text-gray-600">{cart.items.length} item(s) in your cart</p>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <ShoppingCart className="w-5 h-5" />
                  Cart Items ({cart.items.length})
                </h2>
                <button 
                  onClick={handleClearCart}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>
              
              {/* Cart Items List */}
              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => {
                  const price = item.discountPrice || item.price || 0;
                  const itemTotal = price * item.quantity;
                  const stockBadge = getStockBadge(item);
                  const images = item.images || [];
                  const itemShipping = calculateItemShipping(item, selectedShippingMethod);
                  
                  // Initialize selected image index for this item if not set
                  if (selectedImageIndex[item.id] === undefined) {
                    setSelectedImageIndex(prev => ({
                      ...prev,
                      [item.id]: 0
                    }));
                  }
                  
                  const currentImageIndex = selectedImageIndex[item.id] || 0;
                  const currentImage = images[currentImageIndex] || { url: FALLBACK_IMAGE };
                  
                  return (
                    <div key={item.id || item.productId} className="p-4 transition-colors hover:bg-gray-50/50 sm:p-6">
                      <div className="flex flex-col gap-4">
                        {/* Image Gallery Section */}
                        <div className="flex flex-col gap-2">
                          {/* Main Image */}
                          <div className="relative w-full h-48 cursor-pointer group"
                            onClick={() => handleImageClick(item, currentImageIndex)}
                          >
                            <img 
                              src={getFullImageUrl(currentImage.url)} 
                              alt={currentImage.altText || item.name}
                              className="object-contain w-full h-full transition-all duration-300 rounded-lg group-hover:opacity-75"
                              onError={(e) => e.target.src = FALLBACK_IMAGE}
                            />
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-lg opacity-0 bg-black/50 group-hover:opacity-100">
                              <ZoomIn className="w-8 h-8 text-white" />
                            </div>
                            
                            {/* Stock Status Badge */}
                            <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-lg ${stockBadge.bg} ${stockBadge.text} ${stockBadge.border} flex items-center gap-1`}>
                              {stockBadge.icon}
                              {stockBadge.label}
                            </div>
                          </div>
                          
                          {/* Thumbnail Gallery */}
                          {images.length > 1 && (
                            <div className="flex gap-2 pb-2 overflow-x-auto">
                              {images.map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedImageIndex(prev => ({
                                    ...prev,
                                    [item.id]: idx
                                  }))}
                                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    currentImageIndex === idx 
                                      ? 'border-blue-600 ring-2 ring-blue-200' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <img 
                                    src={getFullImageUrl(img.url)} 
                                    alt={img.altText || `${item.name} - view ${idx + 1}`}
                                    className="object-cover w-full h-full"
                                    onError={(e) => e.target.src = FALLBACK_IMAGE}
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-base font-medium text-gray-900 sm:text-lg">
                                {item.name}
                              </h3>
                              
                              {/* Product Description */}
                              {item.description && (
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              
                              {/* SKU / Product ID */}
                              {item.sku && (
                                <p className="mt-1 text-xs text-gray-400">
                                  SKU: {item.sku}
                                </p>
                              )}
                              
                              {/* Stock Quantity Info */}
                              {item.trackQuantity && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {item.stockQuantity} units available
                                </p>
                              )}
                              
                              {/* Price per unit */}
                              <p className="mt-2 text-sm text-gray-600">
                                {formatKES(price)} per unit
                              </p>
                              
                              {/* Quantity and Amount */}
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                                  <button 
                                    onClick={() => handleQuantityChange(item, -1)}
                                    className="p-2 transition-colors rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-12 px-2 py-2 font-medium text-center bg-gray-50">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => handleQuantityChange(item, 1)}
                                    className="p-2 transition-colors rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                                    disabled={item.quantity >= (item.stockQuantity || 10) || item.stockStatus === 'sold'}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <span className="font-medium text-gray-700">
                                  × {formatKES(price)} = 
                                </span>
                                
                                <span className="text-lg font-bold text-blue-600">
                                  {formatKES(itemTotal)}
                                </span>
                              </div>

                              {/* ✅ SHIPPING INFO WITH ACTUAL VALUES FROM DATABASE */}
                              {item.requiresShipping !== false && (
                                <div className="mt-3 space-y-2">
                                  {/* Shipping Badge */}
                                  <div className="flex items-center pt-2 text-xs text-gray-500 border-t border-gray-100">
                                    <Truck className="w-3 h-3 mr-1 text-gray-400" />
                                    {item.freeShipping ? (
                                      <span className="font-medium text-green-600">Free Shipping</span>
                                    ) : (
                                      <span className="flex flex-wrap items-center gap-2">
                                        {item.weight > 0 && (
                                          <span className="flex items-center">
                                            <Box className="w-3 h-3 mr-1" />
                                            {item.weight}{item.weightUnit}
                                          </span>
                                        )}
                                        {item.flatShippingRate > 0 ? (
                                          <span className="font-medium text-blue-600">
                                            Flat Rate: {formatKES(item.flatShippingRate * item.quantity)}
                                          </span>
                                        ) : (
                                          <span className="font-medium text-blue-600">
                                            Shipping: {formatKES(itemShipping)}
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </div>

                                  {/* Shipping Details Grid */}
                                  <div className="grid grid-cols-2 gap-2 p-2 text-xs rounded-lg bg-gray-50">
                                    {/* Shipping Class */}
                                    {item.shippingClass && item.shippingClass !== 'standard' && (
                                      <div className="text-gray-600">
                                        <span className="font-medium">Class:</span>{' '}
                                        <span className="capitalize">{item.shippingClass}</span>
                                      </div>
                                    )}
                                    
                                    {/* Estimated Delivery */}
                                    {item.estimatedDeliveryMin && item.estimatedDeliveryMax && (
                                      <div className="text-gray-600">
                                        <Clock className="inline w-3 h-3 mr-1" />
                                        <span>Est: {item.estimatedDeliveryMin}-{item.estimatedDeliveryMax} days</span>
                                      </div>
                                    )}
                                    
                                    {/* International Shipping */}
                                    {item.internationalShipping && (
                                      <div className="text-blue-600">
                                        <Globe className="inline w-3 h-3 mr-1" />
                                        International shipping available
                                      </div>
                                    )}
                                    
                                    {/* Dimensions */}
                                    {item.dimensions && (item.dimensions.length > 0 || item.dimensions.width > 0 || item.dimensions.height > 0) && (
                                      <div className="col-span-2 text-gray-600">
                                        <span className="font-medium">Dimensions:</span>{' '}
                                        {item.dimensions.length || 0}×{item.dimensions.width || 0}×{item.dimensions.height || 0}{item.dimensions.unit || 'cm'}
                                      </div>
                                    )}
                                    
                                    {/* Shipping Zones Restriction */}
                                    {item.shippingZones && item.shippingZones.length > 0 && (
                                      <div className="col-span-2 text-amber-600" title={`Restricted to: ${item.shippingZones.map(formatZoneName).join(', ')}`}>
                                        <AlertCircle className="inline w-3 h-3 mr-1" />
                                        Shipping restricted to specific zones
                                      </div>
                                    )}
                                  </div>

                                  {/* Item total with shipping */}
                                  <div className="text-xs font-medium text-blue-600">
                                    Item + Shipping: {formatKES(itemTotal + itemShipping)}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveItem(item)}
                              className="h-6 text-gray-400 transition-colors hover:text-red-500"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Continue Shopping */}
            <div className="flex justify-between mt-6">
              <Link 
                to="/shop"
                className="inline-flex items-center gap-2 px-4 py-2 font-medium text-blue-600 transition-colors rounded-lg hover:text-blue-800 hover:bg-blue-50"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 bg-white border border-gray-200 shadow-lg rounded-2xl top-8">
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
                <Package className="w-5 h-5" />
                Order Summary
              </h2>
              
              {/* Shipping Method Selection */}
              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-3 font-medium text-gray-700">
                  <Truck className="w-4 h-4" />
                  Shipping Method
                </h3>
                <div className="space-y-2">
                  {shippingMethods.map((method) => {
                    // Calculate shipping for this method
                    const methodShipping = cart.items.reduce((total, item) => {
                      if (item.requiresShipping === false) return total;
                      if (item.freeShipping) return total;
                      if (item.flatShippingRate > 0) return total + (item.flatShippingRate * item.quantity);
                      
                      switch (method.id) {
                        case 'express':
                          return total + (500 * item.quantity);
                        case 'overnight':
                          return total + (1500 * item.quantity);
                        default:
                          return total;
                      }
                    }, 0);
                    
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedShippingMethod === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.id}
                            checked={selectedShippingMethod === method.id}
                            onChange={() => setSelectedShippingMethod(method.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-xs text-gray-500">{method.days}</div>
                          </div>
                        </div>
                        <span className="font-medium">
                          {methodShipping === 0 ? 'Free' : formatKES(methodShipping)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {/* Items Breakdown */}
              <div className="mb-6 space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Items</h3>
                {summary.items.map((item) => (
                  <div key={item.id || item.productId} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="text-gray-600">{item.name}</span>
                      <div className="text-xs text-gray-400">
                        {item.quantity} × {formatKES(item.discountPrice || item.price)}
                      </div>
                      {item.itemShipping > 0 && (
                        <div className="text-xs text-blue-600">
                          + Shipping: {formatKES(item.itemShipping)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{formatKES(item.itemTotal)}</span>
                      {item.itemShipping > 0 && (
                        <div className="text-xs text-blue-600">
                          {formatKES(item.itemTotal + item.itemShipping)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown - Products + Shipping only */}
              <div className="pt-3 space-y-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (Products)</span>
                  <span className="font-medium">{formatKES(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-blue-600">{formatKES(totalShipping)}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-{formatKES(appliedPromo.discountAmount)}</span>
                  </div>
                )}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatKES(grandTotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Products + Shipping (No tax included)
                  </p>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div className="mt-6">
                <h3 className="flex items-center gap-2 mb-3 font-medium text-gray-900">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          <span className={`${selectedPayment === method.id ? 'text-blue-600' : 'text-gray-600'}`}>
                            {method.icon}
                          </span>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-xs text-gray-500">{method.description}</div>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{method.processing}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.items.length === 0 || checkoutLoading}
                className="flex items-center justify-center w-full gap-2 py-4 mt-6 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {/* Security Notice */}
              <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Secure Shopping</p>
                    <p className="mt-1 text-xs text-blue-700">
                      Your payment information is encrypted and secure. 
                      Total amount: {formatKES(grandTotal)} (Products + Shipping)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute z-10 p-2 text-white transition-colors rounded-full bg-black/50 top-4 right-4 hover:bg-black/70"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute z-10 p-2 text-white transition-colors rounded-full left-4 bg-black/50 hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute z-10 p-2 text-white transition-colors rounded-full right-4 bg-black/50 hover:bg-black/70"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute z-10 px-3 py-1 text-sm text-white rounded-full bg-black/50 top-4 left-4">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>

            {/* Product info overlay */}
            {selectedProduct && (
              <div className="absolute z-10 px-4 py-2 text-white rounded-lg bg-black/50 bottom-4 left-4">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm opacity-75">
                  {formatKES(selectedProduct.discountPrice || selectedProduct.price || 0)}
                </p>
              </div>
            )}

            {/* Main image */}
            <img
              src={getFullImageUrl(lightboxImages[lightboxIndex]?.url)}
              alt={lightboxImages[lightboxIndex]?.altText || selectedProduct?.name || "Product image"}
              className="object-contain max-w-full max-h-full p-4"
              onError={(e) => e.target.src = FALLBACK_IMAGE}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;