// client/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartService } from '../services/client/cart';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalQuantity: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const addToCartInProgress = useRef(false);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📤 Fetching cart...');
      const response = await cartService.getCart();
      console.log('📥 Cart response:', response);
      
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
            requiresShipping: item.requiresShipping !== false, // Default to true
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
  }, []);

  const addToCart = useCallback(async (product, quantity = 1) => {
    // Prevent duplicate calls
    if (addToCartInProgress.current) {
      console.log('⏳ Add to cart already in progress, skipping duplicate');
      return false;
    }
    
    addToCartInProgress.current = true;
    
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
    try {
      setLoading(true);
      console.log('📤 Updating quantity:', { productId, quantity });
      
      const response = await cartService.updateCartItem(productId, quantity);
      
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
    try {
      setLoading(true);
      console.log('📤 Removing from cart:', productId);
      
      const response = await cartService.removeFromCart(productId);
      
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
    try {
      setLoading(true);
      console.log('📤 Clearing cart');
      
      const response = await cartService.clearCart();
      
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

  // ✅ UPDATED: Cart calculations with shipping fields
  const calculateItemShipping = useCallback((item, shippingMethod = 'standard') => {
    // If item doesn't require shipping, shipping cost is 0
    if (item.requiresShipping === false) {
      return 0;
    }

    // If item has free shipping, cost is 0
    if (item.freeShipping) {
      return 0;
    }

    // If item has a flat shipping rate, use that
    if (item.flatShippingRate > 0) {
      return item.flatShippingRate * (item.quantity || 1);
    }

    // Default rates based on shipping method
    switch (shippingMethod) {
      case 'express':
        return 500 * (item.quantity || 1);
      case 'overnight':
        return 1500 * (item.quantity || 1);
      default:
        return 0; // Standard shipping free
    }
  }, []);

  const calculateTotalShipping = useCallback((shippingMethod = 'standard') => {
    return cart.items.reduce((total, item) => {
      return total + calculateItemShipping(item, shippingMethod);
    }, 0);
  }, [cart.items, calculateItemShipping]);

  const calculateSubtotal = useCallback(() => {
    return cart.items.reduce((sum, item) => {
      const price = item.discountPrice || item.price || 0;
      return sum + (price * (item.quantity || 0));
    }, 0);
  }, [cart.items]);

  const calculateTotal = useCallback((shippingMethod = 'standard') => {
    const subtotal = calculateSubtotal();
    const shipping = calculateTotalShipping(shippingMethod);
    const discount = appliedPromo?.discountAmount || 0;
    return subtotal + shipping - discount;
  }, [calculateSubtotal, calculateTotalShipping, appliedPromo]);

  const getCartSummary = useCallback((shippingMethod = 'standard') => {
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

    return {
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
  }, [cart.items, cart.totalQuantity, calculateSubtotal, calculateTotalShipping, calculateItemShipping, appliedPromo]);

  const value = {
    cart,
    loading,
    appliedPromo,
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