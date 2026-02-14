// client/src/services/client/cart.js
import clientApi from './api';

export const cartService = {
  // Get cart
  getCart: async () => {
    try {
      const response = await clientApi.get('/cart/');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await clientApi.post('/cart/items', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await clientApi.put(`/cart/items/${productId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    try {
      const response = await clientApi.delete(`/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await clientApi.delete('/cart/clear');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Get cart count
  getCartCount: async () => {
    try {
      const response = await clientApi.get('/cart/count');
      return response.data;
    } catch (error) {
      console.error('Error getting cart count:', error);
      throw error;
    }
  },

  // Apply coupon
  applyCoupon: async (couponCode) => {
    try {
      const response = await clientApi.post('/cart/apply-coupon', { couponCode });
      return response.data;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  },

  // Remove coupon
  removeCoupon: async () => {
    try {
      const response = await clientApi.delete('/cart/remove-coupon');
      return response.data;
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw error;
    }
  }
};

export default cartService;