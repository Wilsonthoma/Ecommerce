// client/src/services/client/cart.js
import api from './api.js';

// Cart Services
export const cartService = {
  // Get cart
  getCart: async () => {
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.get('/cart/');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.post('/cart/items', {
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
      // ✅ FIXED: Remove /api prefix
      const response = await api.put(`/cart/items/${productId}`, {
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
      // ✅ FIXED: Remove /api prefix
      const response = await api.delete(`/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      // ✅ FIXED: Remove /api prefix
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};