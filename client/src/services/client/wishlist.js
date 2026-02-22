// client/src/services/client/wishlist.js - COMPLETE FIXED VERSION
import clientApi from './api';

export const wishlistService = {
  // Get wishlist items
  getWishlist: async () => {
    try {
      console.log('📤 Fetching wishlist...');
      const response = await clientApi.get('/wishlist');
      console.log('📥 Wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      if (error.response?.status === 401) {
        // Return empty wishlist for unauthenticated users
        return { success: true, items: [], count: 0 };
      }
      throw error;
    }
  },

  // Add item to wishlist
  addToWishlist: async (productId) => {
    try {
      console.log(`📤 Adding product ${productId} to wishlist`);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        throw new Error('Please login to add items to wishlist');
      }

      const response = await clientApi.post('/wishlist/add', { productId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Add to wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to add items to wishlist');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Product already in wishlist');
      } else {
        throw error;
      }
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId) => {
    try {
      console.log(`📤 Removing product ${productId} from wishlist`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to manage wishlist');
      }

      const response = await clientApi.delete(`/wishlist/remove/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Remove from wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to manage wishlist');
      } else {
        throw error;
      }
    }
  },

  // Check if product is in wishlist
  checkInWishlist: async (productId) => {
    try {
      console.log(`📤 Checking if product ${productId} is in wishlist`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: true, inWishlist: false };
      }

      const response = await clientApi.get(`/wishlist/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Check wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking wishlist:', error);
      return { success: false, inWishlist: false, error: error.message };
    }
  },

  // Get wishlist count
  getWishlistCount: async () => {
    try {
      console.log('📤 Fetching wishlist count');
      
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: true, count: 0 };
      }

      const response = await clientApi.get('/wishlist/count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Wishlist count response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting wishlist count:', error);
      return { success: false, count: 0, error: error.message };
    }
  },

  // Clear wishlist
  clearWishlist: async () => {
    try {
      console.log('📤 Clearing wishlist');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to manage wishlist');
      }

      const response = await clientApi.delete('/wishlist/clear', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Clear wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to manage wishlist');
      } else {
        throw error;
      }
    }
  },

  // Move wishlist item to cart
  moveToCart: async (productId, quantity = 1) => {
    try {
      console.log(`📤 Moving product ${productId} from wishlist to cart`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to manage wishlist');
      }

      const response = await clientApi.post('/wishlist/move-to-cart', { 
        productId, 
        quantity 
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Move to cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error moving item to cart:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to manage wishlist');
      } else {
        throw error;
      }
    }
  },

  // Batch add multiple items to wishlist
  batchAddToWishlist: async (productIds) => {
    try {
      console.log(`📤 Batch adding ${productIds.length} products to wishlist`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to manage wishlist');
      }

      const response = await clientApi.post('/wishlist/batch-add', { productIds }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Batch add response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error batch adding to wishlist:', error);
      throw error;
    }
  },

  // Batch remove multiple items from wishlist
  batchRemoveFromWishlist: async (productIds) => {
    try {
      console.log(`📤 Batch removing ${productIds.length} products from wishlist`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to manage wishlist');
      }

      const response = await clientApi.post('/wishlist/batch-remove', { productIds }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Batch remove response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error batch removing from wishlist:', error);
      throw error;
    }
  },

  // Get wishlist with full product details
  getWishlistWithDetails: async () => {
    try {
      console.log('📤 Fetching wishlist with product details');
      
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: true, items: [], count: 0 };
      }

      const response = await clientApi.get('/wishlist/details', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Wishlist details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching wishlist details:', error);
      return { success: false, items: [], count: 0, error: error.message };
    }
  },

  // Check if multiple products are in wishlist
  checkMultipleInWishlist: async (productIds) => {
    try {
      console.log(`📤 Checking ${productIds.length} products in wishlist`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: true, results: productIds.map(id => ({ productId: id, inWishlist: false })) };
      }

      const response = await clientApi.post('/wishlist/check-multiple', { productIds }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Multiple check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking multiple wishlist items:', error);
      return { success: false, results: [], error: error.message };
    }
  }
};

export default wishlistService;