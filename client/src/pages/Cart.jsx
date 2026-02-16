// src/pages/Cart.jsx - TRANSFORMED with oraimo black gradients and glowing effects
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  Shield,
  ChevronRight,
  ShoppingCart,
  Package,
  X,
  ZoomIn,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MapPin,
  RefreshCw,
  Clock,
  Heart
} from 'lucide-react';
import { BsLightningCharge, BsArrowRight } from 'react-icons/bs';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';

// Real locations data from backend
const fetchLocations = async () => {
  try {
    const response = await fetch(`${API_URL}/api/locations`);
    const data = await response.json();
    return data.locations || {
      'Nakuru': {
        pickupStations: ['Njoro', 'Nakuru Town', 'Naivasha'],
        deliveryFees: { 'Njoro': 120, 'Nakuru Town': 80, 'Naivasha': 150 }
      },
      'Nairobi': {
        pickupStations: ['CBD', 'Westlands', 'Kilimani'],
        deliveryFees: { 'CBD': 150, 'Westlands': 120, 'Kilimani': 130 }
      }
    };
  } catch (error) {
    console.error('Error fetching locations:', error);
    return {
      'Nakuru': {
        pickupStations: ['Njoro', 'Nakuru Town', 'Naivasha'],
        deliveryFees: { 'Njoro': 120, 'Nakuru Town': 80, 'Naivasha': 150 }
      }
    };
  }
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

  // Real delivery data
  const [locations, setLocations] = useState({});
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedPickupStation, setSelectedPickupStation] = useState('');
  const [deliveryFees, setDeliveryFees] = useState(0);
  const [pickupDate, setPickupDate] = useState('');
  const [readyDate, setReadyDate] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      const data = await fetchLocations();
      setLocations(data);
      const firstCounty = Object.keys(data)[0];
      setSelectedCounty(firstCounty);
      const firstStation = data[firstCounty]?.pickupStations[0] || '';
      setSelectedPickupStation(firstStation);
      setDeliveryFees(data[firstCounty]?.deliveryFees[firstStation] || 0);
    };
    loadLocations();
  }, []);

  // Calculate delivery dates (real)
  useEffect(() => {
    if (selectedPickupStation) {
      const today = new Date();
      const pickup = new Date(today);
      pickup.setDate(today.getDate() + 2);
      const ready = new Date(today);
      ready.setDate(today.getDate() + 4);

      setPickupDate(pickup.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));
      setReadyDate(ready.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));
    }
  }, [selectedPickupStation]);

  // Real-time countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const deadline = new Date(now);
      deadline.setHours(now.getHours() + 2);
      deadline.setMinutes(now.getMinutes() + 54);

      const diff = deadline - now;
      if (diff > 0) {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hrs}h ${mins}m`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle county change
  const handleCountyChange = (county) => {
    setSelectedCounty(county);
    const stations = locations[county]?.pickupStations || [];
    setSelectedPickupStation(stations[0] || '');
    setDeliveryFees(locations[county]?.deliveryFees[stations[0]] || 0);
  };

  // Handle pickup station change
  const handlePickupStationChange = (station) => {
    setSelectedPickupStation(station);
    setDeliveryFees(locations[selectedCounty]?.deliveryFees[station] || 0);
  };

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
    if (window.confirm('Clear cart?')) {
      clearCart();
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

  // Handle order placement
  const handlePlaceOrder = () => {
    if (cart.items.length === 0) {
      toast.error('Cart empty');
      return;
    }

    // Save real delivery info
    localStorage.setItem('deliveryInfo', JSON.stringify({
      county: selectedCounty,
      station: selectedPickupStation,
      fees: deliveryFees,
      pickupDate,
      readyDate
    }));

    navigate('/checkout');
  };

  // Get stock badge
  const getStockBadge = (item) => {
    if (item.stockStatus === 'sold') {
      return { bg: 'bg-gradient-to-r from-red-600 to-pink-600', label: 'Sold Out', icon: <AlertCircle className="w-3 h-3" /> };
    } else if (item.stockStatus === 'low') {
      return { bg: 'bg-gradient-to-r from-yellow-600 to-orange-600', label: 'Low Stock', icon: <AlertCircle className="w-3 h-3" /> };
    } else {
      return { bg: 'bg-gradient-to-r from-green-600 to-emerald-600', label: 'In Stock', icon: <CheckCircle className="w-3 h-3" /> };
    }
  };

  const summary = getCartSummary();
  const subtotal = summary.subtotal;
  const grandTotal = subtotal + deliveryFees;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="max-w-6xl px-4 py-8 mx-auto">
          <div className="animate-pulse">
            <div className="w-32 h-6 mb-4 bg-gray-700 rounded"></div>
            <div className="p-4 border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <div className="h-40 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="max-w-6xl px-4 py-8 mx-auto text-center">
          <div className="relative p-8 border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 blur-xl"></div>
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white glow-text">Cart empty</h2>
              <Link 
                to="/shop" 
                className="group relative inline-flex items-center gap-2 px-6 py-3 mt-4 font-medium text-white transition-all rounded-full overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative flex items-center gap-2">
                  Shop Now
                  <BsArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="max-w-6xl px-3 py-6 mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center mb-4 text-xs">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 mx-1 text-gray-600" />
          <Link to="/shop" className="text-gray-400 hover:text-white transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3 mx-1 text-gray-600" />
          <span className="font-medium text-white glow-text">Cart</span>
        </nav>

        <h1 className="mb-1 text-2xl font-bold text-white">Cart</h1>
        <p className="mb-4 text-sm text-gray-400">{cart.items.length} items</p>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <h2 className="font-semibold text-white">Items ({cart.items.length})</h2>
                <button 
                  onClick={handleClearCart}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 transition-colors rounded hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
              
              <div className="divide-y divide-gray-700">
                {cart.items.map((item) => {
                  const price = item.discountPrice || item.price || 0;
                  const itemTotal = price * item.quantity;
                  const stockBadge = getStockBadge(item);
                  const images = item.images || [];
                  
                  if (selectedImageIndex[item.id] === undefined) {
                    setSelectedImageIndex(prev => ({ ...prev, [item.id]: 0 }));
                  }
                  
                  const currentImageIndex = selectedImageIndex[item.id] || 0;
                  const currentImage = images[currentImageIndex] || { url: FALLBACK_IMAGE };
                  
                  return (
                    <div key={item.id} className="p-3 transition-colors hover:bg-white/5">
                      <div className="flex gap-3">
                        {/* Image with glow on hover */}
                        <div className="relative flex-shrink-0 w-20 h-20 group/image">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded opacity-0 group-hover/image:opacity-30 blur transition-opacity"></div>
                          <img 
                            src={getFullImageUrl(currentImage.url)} 
                            alt={item.name}
                            className="relative object-contain w-full h-full rounded cursor-pointer"
                            onClick={() => handleImageClick(item, currentImageIndex)}
                          />
                          
                          {/* Thumbnails row */}
                          {images.length > 1 && (
                            <div className="flex gap-1 mt-1">
                              {images.slice(0, 3).map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedImageIndex(prev => ({ ...prev, [item.id]: idx }))}
                                  className={`w-5 h-5 rounded overflow-hidden border transition-all ${
                                    currentImageIndex === idx 
                                      ? 'border-blue-500 ring-1 ring-blue-500/50' 
                                      : 'border-gray-700 hover:border-gray-600'
                                  }`}
                                >
                                  <img src={getFullImageUrl(img.url)} className="object-cover w-full h-full" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                              <p className="text-xs text-gray-400">{formatKES(price)} each</p>
                              
                              {/* Stock Badge */}
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-xs font-medium text-white rounded-full ${stockBadge.bg}`}>
                                {stockBadge.icon}
                                {stockBadge.label}
                              </div>
                              
                              {/* Quantity */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center overflow-hidden border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                                  <button 
                                    onClick={() => handleQuantityChange(item, -1)}
                                    className="px-1.5 py-1 text-gray-400 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-xs font-medium text-center text-white">
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
                                <span className="text-xs font-medium text-blue-500">= {formatKES(itemTotal)}</span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveItem(item)}
                              className="text-gray-500 transition-colors hover:text-red-500"
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
            
            <div className="mt-4">
              <Link to="/shop" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky p-4 border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 top-4">
              <h2 className="flex items-center gap-2 mb-4 text-base font-semibold text-white">
                <Package className="w-4 h-4 text-blue-500" />
                Order Summary
              </h2>
              
              {/* Items */}
              <div className="mb-4 space-y-2 text-xs">
                {cart.items.map((item) => {
                  const price = item.discountPrice || item.price || 0;
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-400 truncate max-w-[150px]">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-white">{formatKES(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Delivery - with glow */}
              <div className="relative p-3 mb-4 text-xs overflow-hidden border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-20 blur"></div>
                
                <div className="relative">
                  <h3 className="flex items-center gap-1 mb-2 font-medium text-blue-500">
                    <Truck className="w-3 h-3" />
                    Delivery
                  </h3>
                  
                  <div className="mb-2">
                    <select
                      value={selectedCounty}
                      onChange={(e) => handleCountyChange(e.target.value)}
                      className="w-full px-2 py-1 text-xs text-white rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500/50"
                    >
                      {Object.keys(locations).map(county => (
                        <option key={county} value={county} className="bg-gray-800">{county}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-2">
                    <select
                      value={selectedPickupStation}
                      onChange={(e) => handlePickupStationChange(e.target.value)}
                      className="w-full px-2 py-1 text-xs text-white rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500/50"
                    >
                      {locations[selectedCounty]?.pickupStations.map(station => (
                        <option key={station} value={station} className="bg-gray-800">{station}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fee:</span>
                      <span className="font-medium text-blue-500">{formatKES(deliveryFees)}</span>
                    </div>
                    <div className="text-gray-400">
                      Pickup: {pickupDate} - {readyDate}
                    </div>
                    {timeLeft !== 'Expired' && (
                      <div className="p-1 text-xs text-yellow-500 rounded bg-yellow-500/10">
                        <Clock className="inline w-3 h-3 mr-1" />
                        Order in {timeLeft}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 text-green-500">
                    <RefreshCw className="w-3 h-3" />
                    <span className="text-xs">Easy Returns</span>
                  </div>
                </div>
              </div>
              
              {/* Totals */}
              <div className="pt-3 space-y-2 text-sm border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-blue-500">{formatKES(deliveryFees)}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-700">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-blue-500 glow-text">{formatKES(grandTotal)}</span>
                  </div>
                </div>
              </div>
              
              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={cart.items.length === 0}
                className="group relative w-full py-2 mt-4 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative flex items-center justify-center gap-2">
                  Place Order
                  <BsArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              {/* Security */}
              <div className="flex items-center gap-1 mt-3 text-xs text-blue-500">
                <Shield className="w-3 h-3" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="relative w-4/5 max-w-2xl">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute p-2 transition-all rounded-full shadow-lg -right-2 -top-12 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] group sm:-right-12 sm:-top-12"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
              <X className="relative w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Navigation */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-0 z-10 p-2 transition-all -translate-x-12 -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] group"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-0 z-10 p-2 transition-all translate-x-12 -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] group"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <img 
                src={getFullImageUrl(lightboxImages[lightboxIndex]?.url)} 
                alt={selectedProduct?.name || 'Product'} 
                className="w-full"
              />
              
              {/* Image counter */}
              <div className="absolute px-2 py-1 text-xs font-medium text-white rounded-full bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 20px currentColor;
        }
      `}</style>
    </div>
  );
};

export default Cart;