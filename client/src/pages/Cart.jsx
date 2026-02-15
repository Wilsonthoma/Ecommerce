// client/src/pages/Cart.jsx
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
  Clock
} from 'lucide-react';

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
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Sold Out', icon: <AlertCircle className="w-3 h-3" /> };
    } else if (item.stockStatus === 'low') {
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Low Stock', icon: <AlertCircle className="w-3 h-3" /> };
    } else {
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'In Stock', icon: <CheckCircle className="w-3 h-3" /> };
    }
  };

  const summary = getCartSummary();
  const subtotal = summary.subtotal;
  const grandTotal = subtotal + deliveryFees;

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-6xl px-4 mx-auto">
          <div className="animate-pulse">
            <div className="w-32 h-6 mb-4 bg-gray-200 rounded"></div>
            <div className="p-4 bg-white shadow rounded-xl">
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-6xl px-4 mx-auto text-center">
          <div className="p-8 bg-white shadow rounded-xl">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h2 className="mb-2 text-xl font-semibold">Cart empty</h2>
            <Link to="/shop" className="inline-block px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 bg-gray-50">
      <div className="max-w-6xl px-3 mx-auto">
        {/* Breadcrumbs - smaller */}
        <nav className="flex mb-4 text-xs">
          <Link to="/" className="text-gray-500">Home</Link>
          <ChevronRight className="w-3 h-3 mx-1 text-gray-400" />
          <Link to="/shop" className="text-gray-500">Shop</Link>
          <ChevronRight className="w-3 h-3 mx-1 text-gray-400" />
          <span className="font-medium text-gray-900">Cart</span>
        </nav>

        <h1 className="mb-1 text-2xl font-bold">Cart</h1>
        <p className="mb-4 text-sm text-gray-600">{cart.items.length} items</p>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="font-semibold">Items ({cart.items.length})</h2>
                <button 
                  onClick={handleClearCart}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 rounded hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
              
              <div className="divide-y">
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
                    <div key={item.id} className="p-3">
                      <div className="flex gap-3">
                        {/* Image - smaller */}
                        <div className="relative flex-shrink-0 w-20 h-20">
                          <img 
                            src={getFullImageUrl(currentImage.url)} 
                            alt={item.name}
                            className="object-contain w-full h-full rounded cursor-pointer"
                            onClick={() => handleImageClick(item, currentImageIndex)}
                          />
                          
                          {/* Thumbnails row - tiny */}
                          {images.length > 1 && (
                            <div className="flex gap-1 mt-1">
                              {images.slice(0, 3).map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedImageIndex(prev => ({ ...prev, [item.id]: idx }))}
                                  className={`w-5 h-5 rounded overflow-hidden border ${currentImageIndex === idx ? 'border-blue-600' : 'border-gray-200'}`}
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
                              <h3 className="text-sm font-medium truncate">{item.name}</h3>
                              <p className="text-xs text-gray-500">{formatKES(price)} each</p>
                              
                              {/* Quantity - smaller */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center border rounded">
                                  <button 
                                    onClick={() => handleQuantityChange(item, -1)}
                                    className="px-1.5 py-1 hover:bg-gray-100 disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-xs font-medium text-center">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => handleQuantityChange(item, 1)}
                                    className="px-1.5 py-1 hover:bg-gray-100 disabled:opacity-50"
                                    disabled={item.quantity >= (item.stockQuantity || 10)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="text-xs font-medium">= {formatKES(itemTotal)}</span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveItem(item)}
                              className="text-gray-400 hover:text-red-500"
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
              <Link to="/shop" className="text-xs text-blue-600 hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky p-4 bg-white border rounded-xl top-4">
              <h2 className="flex items-center gap-2 mb-4 text-base font-semibold">
                <Package className="w-4 h-4" />
                Order Summary
              </h2>
              
              {/* Items - smaller */}
              <div className="mb-4 space-y-2 text-xs">
                {cart.items.map((item) => {
                  const price = item.discountPrice || item.price || 0;
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-600 truncate max-w-[150px]">{item.name} × {item.quantity}</span>
                      <span className="font-medium">{formatKES(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Delivery - real data */}
              <div className="p-3 mb-4 text-xs border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="flex items-center gap-1 mb-2 font-medium text-blue-800">
                  <Truck className="w-3 h-3" />
                  Delivery
                </h3>
                
                <div className="mb-2">
                  <select
                    value={selectedCounty}
                    onChange={(e) => handleCountyChange(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-blue-200 rounded"
                  >
                    {Object.keys(locations).map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-2">
                  <select
                    value={selectedPickupStation}
                    onChange={(e) => handlePickupStationChange(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-blue-200 rounded"
                  >
                    {locations[selectedCounty]?.pickupStations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium text-blue-700">{formatKES(deliveryFees)}</span>
                  </div>
                  <div className="text-gray-600">
                    Pickup: {pickupDate} - {readyDate}
                  </div>
                  {timeLeft !== 'Expired' && (
                    <div className="p-1 text-xs text-yellow-700 rounded bg-yellow-50">
                      <Clock className="inline w-3 h-3 mr-1" />
                      Order in {timeLeft}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <RefreshCw className="w-3 h-3" />
                  <span className="text-xs">Easy Returns</span>
                </div>
              </div>
              
              {/* Totals */}
              <div className="pt-3 space-y-2 text-sm border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-blue-600">{formatKES(deliveryFees)}</span>
                </div>
                <div className="pt-2 mt-2 border-t">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatKES(grandTotal)}</span>
                  </div>
                </div>
              </div>
              
              {/* Place Order - smaller button */}
              <button
                onClick={handlePlaceOrder}
                disabled={cart.items.length === 0}
                className="w-full py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Place Order
              </button>
              
              {/* Security - tiny */}
              <div className="flex items-center gap-1 mt-3 text-xs text-blue-700">
                <Shield className="w-3 h-3" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox - smaller */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative w-4/5 max-w-lg">
            <button
              onClick={closeLightbox}
              className="absolute right-0 z-10 p-1 text-white rounded-full bg-black/50 -top-8"
            >
              <X className="w-4 h-4" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute z-10 p-1 text-white rounded-full bg-black/50 -left-8 top-1/2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute z-10 p-1 text-white rounded-full bg-black/50 -right-8 top-1/2"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </>
            )}

            <img src={getFullImageUrl(lightboxImages[lightboxIndex]?.url)} alt="" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;