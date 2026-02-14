// client/src/services/client/wishlist.js
import clientApi from './api';

export const wishlistService = {
  // Get wishlist items
  getWishlist: async () => {
    try {
      const response = await clientApi.get('/wishlist');
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Add item to wishlist
  addToWishlist: async (productId) => {
    try {
      const response = await clientApi.post('/wishlist/add', { productId });
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId) => {
    try {
      const response = await clientApi.delete(`/wishlist/remove/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Check if product is in wishlist
  checkInWishlist: async (productId) => {
    try {
      const response = await clientApi.get(`/wishlist/check/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      throw error;
    }
  },

  // Get wishlist count
  getWishlistCount: async () => {
    try {
      const response = await clientApi.get('/wishlist/count');
      return response.data;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      throw error;
    }
  },

  // Clear wishlist
  clearWishlist: async () => {
    try {
      const response = await clientApi.delete('/wishlist/clear');
      return response.data;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  },

  // Move wishlist item to cart
  moveToCart: async (productId) => {
    try {
      const response = await clientApi.post('/wishlist/move-to-cart', { productId });
      return response.data;
    } catch (error) {
      console.error('Error moving item to cart:', error);
      throw error;
    }
  }
};

export default wishlistService;