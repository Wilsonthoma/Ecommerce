import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Shield, 
  Truck, 
  Lock,
  ChevronRight,
  Tag,
  CreditCard,
  ShoppingCart,
  Package
} from 'lucide-react';

const Cart = () => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    calculateShipping,
    calculateTax,
    calculateTotal,
    addToCart
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [recentProducts, setRecentProducts] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Fetch recently viewed products
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        // Get recent products from localStorage or API
        const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        if (recentIds.length > 0) {
          const response = await axios.get(`http://localhost:4000/api/products?ids=${recentIds.join(',')}&limit=2`);
          setRecentProducts(response.data.products || []);
        }
      } catch (error) {
        console.error('Error fetching recent products:', error);
      }
    };

    fetchRecentProducts();
  }, []);

  // Handle quantity change
  const handleQuantityChange = async (item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity >= 1 && newQuantity <= item.maxStock) {
      try {
        // Check stock availability with server
        const stockResponse = await axios.get(`http://localhost:4000/api/products/${item.id}/stock`);
        const availableStock = stockResponse.data.stock;
        
        if (newQuantity > availableStock) {
          toast.error(`Only ${availableStock} items available in stock`);
          return;
        }
        
        updateQuantity(item.id, newQuantity, item.size, item.color);
        toast.success(`Quantity updated to ${newQuantity}`);
      } catch (error) {
        console.error('Error checking stock:', error);
        toast.error('Failed to update quantity. Please try again.');
      }
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (item) => {
    try {
      removeFromCart(item.id, item.size, item.color);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // Clear cart with confirmation
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared successfully');
    }
  };

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/promo/validate', {
        code: promoCode,
        cartTotal: cart.totalPrice
      });

      if (response.data.valid) {
        setDiscount(response.data.discount);
        setAppliedPromo({
          code: promoCode,
          discount: response.data.discount,
          description: response.data.description
        });
        toast.success('Promo code applied successfully!');
      } else {
        toast.error(response.data.message || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Promo code error:', error);
      toast.error(error.response?.data?.message || 'Failed to apply promo code');
    } finally {
      setLoading(false);
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setDiscount(0);
    setAppliedPromo(null);
    setPromoCode('');
    toast.info('Promo code removed');
  };

  // Calculate order summary with KES
  const formatKES = (amount) => {
    if (!amount) return "KSh 0";
    return `KSh ${Math.round(amount).toLocaleString()}`;
  };

  const convertToKES = (usd) => {
    return Math.round(usd * 120); // Approximate conversion
  };

  const shipping = calculateShipping();
  const tax = calculateTax();
  const subtotalKES = convertToKES(cart.totalPrice);
  const shippingKES = convertToKES(shipping);
  const taxKES = convertToKES(tax);
  const discountKES = convertToKES(discount);
  const totalKES = subtotalKES + shippingKES + taxKES - discountKES;

  // Checkout function
  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      // Create order on server
      const orderData = {
        items: cart.items,
        subtotal: cart.totalPrice,
        shipping,
        tax,
        discount: discount,
        total: cart.totalPrice + shipping + tax - discount,
        currency: 'KES'
      };

      const response = await axios.post('http://localhost:4000/api/orders/create', orderData, {
        withCredentials: true
      });

      if (response.data.success) {
        // Redirect to checkout page with order ID
        window.location.href = `/checkout/${response.data.orderId}`;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to proceed to checkout');
    } finally {
      setLoading(false);
    }
  };

  // Add recent product to cart
  const handleAddRecentToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

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
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link 
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
              {recentProducts.length > 0 && (
                <Link 
                  to="/shop?category=trending"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 font-medium text-blue-600 transition-colors border-2 border-blue-500 rounded-lg hover:bg-blue-50"
                >
                  <Package className="w-5 h-5" />
                  View Trending
                </Link>
              )}
            </div>
          </div>

          {/* Recently Viewed Products */}
          {recentProducts.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-6 text-xl font-bold text-gray-900">Recently Viewed Products</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {recentProducts.map((product) => (
                  <div key={product._id} className="p-4 transition-shadow bg-white shadow-sm rounded-xl hover:shadow-lg">
                    <img 
                      src={product.images?.[0]} 
                      alt={product.name}
                      className="object-cover w-full h-48 mb-4 rounded-lg"
                    />
                    <h4 className="mb-2 font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">{formatKES(product.discountPrice || product.price)}</span>
                      <button
                        onClick={() => handleAddRecentToCart(product)}
                        className="px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <Link to="/shop" className="text-gray-500 hover:text-gray-700">
                Shop
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li className="font-medium text-gray-900">
              Shopping Cart
            </li>
          </ol>
        </nav>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mb-8 text-gray-600">Review your items and proceed to checkout</p>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <ShoppingCart className="w-5 h-5" />
                  Items ({cart.totalQuantity})
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
                  const price = item.discountPrice || item.price;
                  const itemTotal = price * item.quantity;
                  const itemTotalKES = convertToKES(itemTotal);
                  
                  return (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex flex-col gap-6 p-6 transition-colors sm:flex-row hover:bg-gray-50/50">
                      {/* Product Image */}
                      <Link to={`/product/${item.slug || item.id}`} className="flex-shrink-0 w-full h-32 sm:w-32">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="object-cover w-full h-full transition-transform duration-300 rounded-lg hover:scale-105"
                        />
                      </Link>
                      
                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <Link to={`/product/${item.slug || item.id}`}>
                              <h3 className="text-lg font-medium text-gray-900 transition-colors hover:text-blue-600">
                                {item.name}
                              </h3>
                            </Link>
                            
                            {/* Variants */}
                            <div className="flex gap-4 mt-2">
                              {item.color && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Color:</span>
                                  <div 
                                    className="w-4 h-4 border border-gray-300 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                    title={item.color}
                                  />
                                  <span className="text-sm text-gray-900">{item.color}</span>
                                </div>
                              )}
                              {item.size && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Size:</span>
                                  <span className="text-sm font-medium text-gray-900">{item.size}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Stock Status */}
                            <div className="mt-2">
                              {item.quantity > item.maxStock ? (
                                <span className="inline-block px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded">
                                  Only {item.maxStock} available
                                </span>
                              ) : item.maxStock < 10 && (
                                <span className="inline-block px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded">
                                  Only {item.maxStock} left
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveItem(item)}
                            className="h-6 text-gray-400 transition-colors hover:text-red-500"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                            <button 
                              onClick={() => handleQuantityChange(item, -1)}
                              className="p-2 transition-colors rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 px-4 py-2 font-medium text-center bg-gray-50">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(item, 1)}
                              className="p-2 transition-colors rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity >= item.maxStock}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              {formatKES(itemTotalKES)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500">
                                {formatKES(convertToKES(price))} each
                              </p>
                            )}
                            {item.discountPrice && (
                              <p className="text-sm font-medium text-green-600">
                                Save {formatKES(convertToKES((item.price - item.discountPrice) * item.quantity))}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Continue Shopping & Security Badges */}
            <div className="flex flex-col justify-between gap-6 mt-6 sm:flex-row sm:items-center">
              <Link 
                to="/shop"
                className="flex items-center gap-2 px-4 py-2 font-medium text-blue-600 transition-colors rounded-lg hover:text-blue-800 hover:bg-blue-50"
              >
                ← Continue Shopping
              </Link>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <Shield className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <Truck className="w-4 h-4" />
                  <span>Free Shipping Over KSh 6,000</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 bg-white border border-gray-200 shadow-lg rounded-2xl top-8">
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-800">
                <CreditCard className="w-5 h-5" />
                Order Summary
              </h2>
              
              {/* Price Breakdown */}
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.totalQuantity} items)</span>
                  <span className="font-medium">{formatKES(subtotalKES)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'FREE' : formatKES(shippingKES)}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="font-medium">{formatKES(taxKES)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span className="font-medium">-{formatKES(discountKES)}</span>
                  </div>
                )}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatKES(totalKES)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    (Including tax and shipping)
                  </p>
                  {shipping === 0 && cart.totalPrice > 0 && (
                    <p className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      🎉 You've unlocked free shipping!
                    </p>
                  )}
                  {cart.totalPrice < 50 && shipping > 0 && (
                    <p className="mt-2 text-sm text-blue-600">
                      Add KSh {(6000 - subtotalKES).toLocaleString()} more for free shipping!
                    </p>
                  )}
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || cart.items.length === 0}
                className="flex items-center justify-center w-full gap-2 py-4 mt-8 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {/* Promo Code Section */}
              <div className="mt-6">
                <h3 className="flex items-center gap-2 mb-3 font-medium text-gray-900">
                  <Tag className="w-4 h-4" />
                  {appliedPromo ? 'Promo Code Applied' : 'Have a promo code?'}
                </h3>
                {appliedPromo ? (
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800">{appliedPromo.code}</span>
                      <button 
                        onClick={handleRemovePromo}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-green-700">{appliedPromo.description}</p>
                    <p className="mt-1 text-sm font-medium text-green-600">
                      Discount: {formatKES(discountKES)}
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={loading || !promoCode.trim()}
                      className="px-6 py-3 font-medium text-white transition-colors bg-gray-900 rounded-lg hover:bg-black whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Payment Methods */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <p className="mb-3 text-sm text-gray-600">We accept</p>
                <div className="flex flex-wrap gap-2">
                  {['VISA', 'MASTERCARD', 'AMEX', 'MPESA', 'AIRTEL MONEY', 'T-KASH'].map((method) => (
                    <div 
                      key={method}
                      className="px-3 py-1.5 bg-gray-100 rounded text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Security Notice */}
              <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Secure Shopping</p>
                    <p className="mt-1 text-xs text-blue-700">
                      Your payment information is encrypted and secure. We support M-PESA for secure mobile payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recently Viewed */}
            {recentProducts.length > 0 && (
              <div className="p-6 mt-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
                <h3 className="flex items-center gap-2 mb-4 font-medium text-gray-900">
                  <Package className="w-5 h-5" />
                  Recently Viewed
                </h3>
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <div key={product._id} className="flex items-center gap-3 p-2 transition-colors rounded-lg group hover:bg-gray-50">
                      <div className="flex-shrink-0 w-16 h-16">
                        <img 
                          src={product.images?.[0]}
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-300 rounded-lg group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {formatKES(convertToKES(product.discountPrice || product.price))}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddRecentToCart(product)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/shop?sort=newest"
                  className="inline-block w-full py-2 mt-4 text-sm font-medium text-center text-blue-600 transition-colors rounded-lg hover:text-blue-800 hover:bg-blue-50"
                >
                  View More Recently Viewed →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;