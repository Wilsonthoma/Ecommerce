// client/src/context/CartContext.jsx - UPDATED with performance tracking and caching
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartService } from '../services/client/cart';
import { LRUCache } from '../dataStructures/LRUCache';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Create local cache for cart calculations
const calculationCache = new LRUCache(50); // Cache up to 50 calculations

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalQuantity: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  
  const addToCartInProgress = useRef(false);
  const pendingRequests = useRef(new Map());

  // Fetch cart on mount
  useEffect(() => {
    const startTime = performance.now();
    fetchCart().then(() => {
      const endTime = performance.now();
      setLoadTime((endTime - startTime).toFixed(0));
      console.log(`⚡ Cart loaded in ${(endTime - startTime).toFixed(0)}ms ${fromCache ? '(from cache)' : '(from API)'}`);
    });
  }, []);

  // Deduplicate in-flight requests
  const dedupeRequest = useCallback(async (key, requestFn) => {
    if (pendingRequests.current.has(key)) {
      console.log('🔄 Reusing in-flight cart request:', key);
      return pendingRequests.current.get(key);
    }
    
    const promise = requestFn().finally(() => {
      pendingRequests.current.delete(key);
    });
    
    pendingRequests.current.set(key, promise);
    return promise;
  }, []);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📤 Fetching cart...');
      
      const response = await dedupeRequest('fetchCart', () => cartService.getCart());
      
      console.log('📥 Cart response:', response);
      
      // Track if response came from cache
      setFromCache(response?.cached || false);
      
      if (response.success) {
        const cartData = response.cart || response.data || response;
        
        // Ensure items array exists and normalize data with ALL shipping fields
        const items = Array.isArray(cartData.items) ? cartData.items.map(item => {
          console.log('🛒 Processing cart item:', {
            name: item.name,
            requiresShipping: item.requiresShipping,
            freeShipping: item.freeShipping,
            flatShippingRate: item.flatShippingRate,
            weight: item.weight
          });
          
          return {
            id: item._id || item.id || item.productId,
            productId: item.productId || item._id || item.id,
            name: item.name || 'Unknown Product',
            price: item.price || 0,
            discountPrice: item.discountPrice || null,
            quantity: item.quantity || 1,
            image: item.image || item.images?.[0]?.url || null,
            images: item.images || [],
            description: item.description || '',
            category: item.category || '',
            brand: item.brand || '',
            
            // ✅ STOCK FIELDS
            stockQuantity: item.stockQuantity || item.stock || item.quantity || 0,
            trackQuantity: item.trackQuantity !== false,
            allowOutOfStock: item.allowOutOfStock || false,
            stockStatus: item.stockStatus || 'available',
            sku: item.sku || '',
            
            // ✅ SHIPPING FIELDS - ALL OF THEM!
            requiresShipping: item.requiresShipping !== false,
            freeShipping: item.freeShipping || false,
            flatShippingRate: item.flatShippingRate || 0,
            weight: item.weight || 0,
            weightUnit: item.weightUnit || 'kg',
            dimensions: item.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
            shippingClass: item.shippingClass || 'standard',
            internationalShipping: item.internationalShipping || false,
            shippingZones: item.shippingZones || [],
            estimatedDeliveryMin: item.estimatedDeliveryMin || null,
            estimatedDeliveryMax: item.estimatedDeliveryMax || null,
            
            // Cache flag
            _cached: item._cached || false,
            
            // Metadata
            rating: item.rating || 0,
            reviews: item.reviews || 0
          };
        }) : [];
        
        // Calculate totals
        const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalPrice = items.reduce((sum, item) => {
          const price = item.discountPrice || item.price || 0;
          return sum + (price * (item.quantity || 0));
        }, 0);
        
        const newCart = {
          items,
          totalQuantity,
          totalPrice
        };
        
        console.log('✅ Cart loaded:', newCart);
        console.log('📦 Shipping fields summary:', items.map(i => ({
          name: i.name,
          requiresShipping: i.requiresShipping,
          freeShipping: i.freeShipping,
          flatShippingRate: i.flatShippingRate,
          weight: i.weight
        })));
        
        setCart(newCart);
        
        // Clear calculation cache when cart changes
        calculationCache.clear();
      } else {
        console.warn('Cart fetch unsuccessful, using empty cart');
        setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  }, [dedupeRequest]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    // Prevent duplicate calls
    if (addToCartInProgress.current) {
      console.log('⏳ Add to cart already in progress, skipping duplicate');
      return false;
    }
    
    addToCartInProgress.current = true;
    const startTime = performance.now();
    
    try {
      setLoading(true);
      const productId = product._id || product.id;
      
      console.log('🔍 PRODUCT BEING ADDED:', {
        productId,
        productName: product.name,
        shipping: {
          requiresShipping: product.requiresShipping,
          freeShipping: product.freeShipping,
          flatShippingRate: product.flatShippingRate,
          weight: product.weight,
          shippingClass: product.shippingClass
        }
      });
      
      // Validate product has required fields
      if (!productId) {
        console.error('❌ Invalid product - no ID:', product);
        toast.error('Invalid product');
        return false;
      }

      if (!product.name) {
        console.error('❌ Invalid product - no name:', product);
        toast.error('Product has no name');
        return false;
      }

      // Send to backend
      const response = await cartService.addToCart(productId, quantity);
      console.log('📥 Add to cart response:', response);
      
      const endTime = performance.now();
      console.log(`⚡ Add to cart completed in ${(endTime - startTime).toFixed(0)}ms`);
      
      if (response.success) {
        // Refresh cart to get updated data
        await fetchCart();
        // Show success toast with product name
        toast.success(`${product.name} added to cart!`);
        return true;
      } else {
        console.error('❌ Add to cart failed:', response.error);
        toast.error(response.error || 'Failed to add to cart');
        return false;
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      toast.error('Failed to add to cart');
      return false;
    } finally {
      setLoading(false);
      // Reset after a short delay to prevent rapid double-clicks
      setTimeout(() => {
        addToCartInProgress.current = false;
      }, 1000);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      console.log('📤 Updating quantity:', { productId, quantity });
      
      const response = await cartService.updateCartItem(productId, quantity);
      
      const endTime = performance.now();
      console.log(`⚡ Quantity update completed in ${(endTime - startTime).toFixed(0)}ms`);
      
      if (response.success) {
        await fetchCart();
        toast.success('Cart updated');
        return true;
      } else {
        toast.error(response.error || 'Failed to update cart');
        return false;
      }
    } catch (error) {
      console.error('❌ Update quantity error:', error);
      toast.error('Failed to update cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      console.log('📤 Removing from cart:', productId);
      
      const response = await cartService.removeFromCart(productId);
      
      const endTime = performance.now();
      console.log(`⚡ Remove from cart completed in ${(endTime - startTime).toFixed(0)}ms`);
      
      if (response.success) {
        await fetchCart();
        toast.success('Item removed from cart');
        return true;
      } else {
        toast.error(response.error || 'Failed to remove item');
        return false;
      }
    } catch (error) {
      console.error('❌ Remove from cart error:', error);
      toast.error('Failed to remove item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      console.log('📤 Clearing cart');
      
      const response = await cartService.clearCart();
      
      const endTime = performance.now();
      console.log(`⚡ Clear cart completed in ${(endTime - startTime).toFixed(0)}ms`);
      
      if (response.success) {
        setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
        toast.success('Cart cleared');
        return true;
      } else {
        toast.error(response.error || 'Failed to clear cart');
        return false;
      }
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      toast.error('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = fetchCart;

  // ✅ UPDATED: Cart calculations with caching
  const calculateItemShipping = useCallback((item, shippingMethod = 'standard') => {
    const cacheKey = `shipping_${item.id}_${shippingMethod}_${item.quantity}`;
    
    const cached = calculationCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    let result = 0;
    
    // If item doesn't require shipping, shipping cost is 0
    if (item.requiresShipping === false) {
      result = 0;
    }
    // If item has free shipping, cost is 0
    else if (item.freeShipping) {
      result = 0;
    }
    // If item has a flat shipping rate, use that
    else if (item.flatShippingRate > 0) {
      result = item.flatShippingRate * (item.quantity || 1);
    }
    // Default rates based on shipping method
    else {
      switch (shippingMethod) {
        case 'express':
          result = 500 * (item.quantity || 1);
          break;
        case 'overnight':
          result = 1500 * (item.quantity || 1);
          break;
        default:
          result = 0; // Standard shipping free
      }
    }
    
    calculationCache.put(cacheKey, result);
    return result;
  }, []);

  const calculateTotalShipping = useCallback((shippingMethod = 'standard') => {
    const cacheKey = `total_shipping_${shippingMethod}_${cart.items.map(i => i.id + i.quantity).join('_')}`;
    
    const cached = calculationCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    const total = cart.items.reduce((total, item) => {
      return total + calculateItemShipping(item, shippingMethod);
    }, 0);
    
    calculationCache.put(cacheKey, total);
    return total;
  }, [cart.items, calculateItemShipping]);

  const calculateSubtotal = useCallback(() => {
    const cacheKey = `subtotal_${cart.items.map(i => i.id + i.quantity).join('_')}`;
    
    const cached = calculationCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0;
      return sum + (price * (item.quantity || 0));
    }, 0);
    
    calculationCache.put(cacheKey, subtotal);
    return subtotal;
  }, [cart.items]);

  const calculateTotal = useCallback((shippingMethod = 'standard') => {
    const cacheKey = `total_${shippingMethod}_${cart.items.map(i => i.id + i.quantity).join('_')}_${appliedPromo?.code || ''}`;
    
    const cached = calculationCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    const subtotal = calculateSubtotal();
    const shipping = calculateTotalShipping(shippingMethod);
    const discount = appliedPromo?.discountAmount || 0;
    const total = subtotal + shipping - discount;
    
    calculationCache.put(cacheKey, total);
    return total;
  }, [calculateSubtotal, calculateTotalShipping, appliedPromo, cart.items]);

  const getCartSummary = useCallback((shippingMethod = 'standard') => {
    const cacheKey = `summary_${shippingMethod}_${cart.items.map(i => i.id + i.quantity).join('_')}_${appliedPromo?.code || ''}`;
    
    const cached = calculationCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const subtotal = calculateSubtotal();
    const shipping = calculateTotalShipping(shippingMethod);
    const discount = appliedPromo?.discountAmount || 0;
    const total = subtotal + shipping - discount;

    // Calculate item-level shipping details
    const itemsWithShipping = cart.items.map(item => ({
      ...item,
      itemShipping: calculateItemShipping(item, shippingMethod),
      itemTotal: (item.discountPrice || item.price || 0) * (item.quantity || 0)
    }));

    const summary = {
      items: itemsWithShipping,
      subtotal,
      shipping,
      discount,
      total,
      itemCount: cart.items.length,
      totalQuantity: cart.totalQuantity,
      hasShippingItems: cart.items.some(item => item.requiresShipping !== false),
      hasFreeShipping: cart.items.some(item => item.freeShipping)
    };
    
    calculationCache.put(cacheKey, summary);
    return summary;
  }, [cart.items, cart.totalQuantity, calculateSubtotal, calculateTotalShipping, calculateItemShipping, appliedPromo]);

  const value = {
    cart,
    loading,
    appliedPromo,
    loadTime,
    fromCache,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    calculateSubtotal,
    calculateTotalShipping,
    calculateTotal,
    calculateItemShipping,
    getCartSummary,
    setAppliedPromo
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};