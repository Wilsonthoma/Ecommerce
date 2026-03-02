// client/src/services/client/cart.js - UPDATED with LRU Cache
import clientApi from './api';
import { LRUCache } from '../../dataStructures/LRUCache';

// Create dedicated cache for cart
const cartCache = new LRUCache(10); // Cache up to 10 cart states

export const cartService = {
  /**
   * Get cart (CACHED)
   */
  getCart: async () => {
    const cacheKey = 'user_cart';
    
    // Check cache first
    const cached = cartCache.get(cacheKey);
    if (cached) {
      console.log('✅ Cart cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('🛒 Fetching cart...');
      const response = await clientApi.get('/cart/');
      console.log('🛒 Cart response:', response.data);
      
      // Cache the result
      cartCache.put(cacheKey, response.data);
      
      return { ...response.data, cached: false };
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        items: [] 
      };
    }
  },

  /**
   * Add to cart (NO CACHE - WRITE OPERATION)
   */
  addToCart: async (productId, quantity = 1) => {
    try {
      console.log('🛒 Adding to cart - Product ID:', productId, 'Quantity:', quantity);
      
      if (!productId) {
        console.error('❌ Invalid product ID:', productId);
        return { 
          success: false, 
          error: 'Invalid product ID' 
        };
      }

      const payload = { productId, quantity };
      console.log('🛒 Sending payload:', payload);
      
      const response = await clientApi.post('/cart/items', payload);
      console.log('🛒 Add to cart response:', response.data);
      
      // Clear cart cache after modification
      cartCache.put('user_cart', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      console.error('❌ Error details:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Update cart item (NO CACHE - WRITE OPERATION)
   */
  updateCartItem: async (productId, quantity) => {
    try {
      console.log('🛒 Updating cart item:', productId, 'to quantity:', quantity);
      const response = await clientApi.put(`/cart/items/${productId}`, { quantity });
      
      // Clear cart cache after modification
      cartCache.put('user_cart', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Remove from cart (NO CACHE - WRITE OPERATION)
   */
  removeFromCart: async (productId) => {
    try {
      console.log('🛒 Removing from cart:', productId);
      const response = await clientApi.delete(`/cart/items/${productId}`);
      
      // Clear cart cache after modification
      cartCache.put('user_cart', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Clear cart (NO CACHE - WRITE OPERATION)
   */
  clearCart: async () => {
    try {
      console.log('🛒 Clearing cart');
      const response = await clientApi.delete('/cart/clear');
      
      // Clear cart cache after clearing
      cartCache.put('user_cart', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Get cart count (CACHED)
   */
  getCartCount: async () => {
    const cacheKey = 'cart_count';
    
    const cached = cartCache.get(cacheKey);
    if (cached) {
      console.log('✅ Cart count cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      const response = await clientApi.get('/cart/count');
      
      // Cache count for 1 minute
      cartCache.put(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting cart count:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        count: 0 
      };
    }
  },

  /**
   * Clear all cart caches
   */
  clearAllCaches: () => {
    cartCache.clear();
    console.log('🗑️ All cart caches cleared');
  }
};

export default cartService;