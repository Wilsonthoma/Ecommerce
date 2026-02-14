// client/src/services/client/cart.js
import clientApi from './api';

export const cartService = {
  // Get cart
  getCart: async () => {
    try {
      console.log('🛒 Fetching cart...');
      const response = await clientApi.get('/cart/');
      console.log('🛒 Cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        items: [] 
      };
    }
  },

  // Add to cart - with detailed logging
  addToCart: async (productId, quantity = 1) => {
    try {
      console.log('🛒 Adding to cart - Product ID:', productId, 'Quantity:', quantity);
      
      // Validate productId
      if (!productId) {
        console.error('❌ Invalid product ID:', productId);
        return { 
          success: false, 
          error: 'Invalid product ID' 
        };
      }

      const payload = {
        productId,
        quantity
      };
      
      console.log('🛒 Sending payload:', payload);
      
      const response = await clientApi.post('/cart/items', payload);
      console.log('🛒 Add to cart response:', response.data);
      
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

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    try {
      console.log('🛒 Updating cart item:', productId, 'to quantity:', quantity);
      const response = await clientApi.put(`/cart/items/${productId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    try {
      console.log('🛒 Removing from cart:', productId);
      const response = await clientApi.delete(`/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      console.log('🛒 Clearing cart');
      const response = await clientApi.delete('/cart/clear');
      return response.data;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get cart count
  getCartCount: async () => {
    try {
      const response = await clientApi.get('/cart/count');
      return response.data;
    } catch (error) {
      console.error('❌ Error getting cart count:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        count: 0 
      };
    }
  }
};