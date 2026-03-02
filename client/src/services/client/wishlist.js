// client/src/services/client/wishlist.js - UPDATED with LRU Cache
import clientApi from './api';
import { LRUCache } from '../../dataStructures/LRUCache';

// Create dedicated cache for wishlist
const wishlistCache = new LRUCache(20); // Cache up to 20 wishlist states

export const wishlistService = {
  /**
   * Get wishlist items (CACHED)
   */
  getWishlist: async () => {
    const cacheKey = 'user_wishlist';
    
    // Check cache first
    const cached = wishlistCache.get(cacheKey);
    if (cached) {
      console.log('✅ Wishlist cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching wishlist...');
      const response = await clientApi.get('/wishlist');
      console.log('📥 Wishlist response:', response.data);
      
      // Cache the result
      wishlistCache.put(cacheKey, response.data);
      
      return { ...response.data, cached: false };
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      if (error.response?.status === 401) {
        // Return empty wishlist for unauthenticated users
        return { success: true, items: [], count: 0 };
      }
      throw error;
    }
  },

  /**
   * Add item to wishlist (NO CACHE - WRITE OPERATION)
   */
  addToWishlist: async (productId) => {
    try {
      console.log(`📤 Adding product ${productId} to wishlist`);
      
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
      
      // Clear wishlist cache after modification
      wishlistCache.put('user_wishlist', null);
      wishlistCache.put('wishlist_count', null);
      
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

  /**
   * Remove item from wishlist (NO CACHE - WRITE OPERATION)
   */
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
      
      // Clear wishlist cache after modification
      wishlistCache.put('user_wishlist', null);
      wishlistCache.put('wishlist_count', null);
      
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

  /**
   * Check if product is in wishlist (CACHED)
   */
  checkInWishlist: async (productId) => {
    const cacheKey = `wishlist_check_${productId}`;
    
    const cached = wishlistCache.get(cacheKey);
    if (cached) {
      console.log('✅ Wishlist check cache hit:', productId);
      return { ...cached, cached: true };
    }
    
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
      
      // Cache check result for 5 minutes
      wishlistCache.put(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error checking wishlist:', error);
      return { success: false, inWishlist: false, error: error.message };
    }
  },

  /**
   * Get wishlist count (CACHED)
   */
  getWishlistCount: async () => {
    const cacheKey = 'wishlist_count';
    
    const cached = wishlistCache.get(cacheKey);
    if (cached) {
      console.log('✅ Wishlist count cache hit');
      return { ...cached, cached: true };
    }
    
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
      
      // Cache count for 2 minutes
      wishlistCache.put(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting wishlist count:', error);
      return { success: false, count: 0, error: error.message };
    }
  },

  /**
   * Clear wishlist (NO CACHE - WRITE OPERATION)
   */
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
      
      // Clear all wishlist caches after clearing
      wishlistCache.clear();
      
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

  /**
   * Move wishlist item to cart (NO CACHE - WRITE OPERATION)
   */
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
      
      // Clear wishlist cache after moving
      wishlistCache.put('user_wishlist', null);
      wishlistCache.put('wishlist_count', null);
      
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

  /**
   * Batch add multiple items to wishlist (NO CACHE - WRITE OPERATION)
   */
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
      
      // Clear wishlist cache after batch operation
      wishlistCache.put('user_wishlist', null);
      wishlistCache.put('wishlist_count', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error batch adding to wishlist:', error);
      throw error;
    }
  },

  /**
   * Batch remove multiple items from wishlist (NO CACHE - WRITE OPERATION)
   */
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
      
      // Clear wishlist cache after batch operation
      wishlistCache.put('user_wishlist', null);
      wishlistCache.put('wishlist_count', null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error batch removing from wishlist:', error);
      throw error;
    }
  },

  /**
   * Get wishlist with full product details (CACHED)
   */
  getWishlistWithDetails: async () => {
    const cacheKey = 'wishlist_details';
    
    const cached = wishlistCache.get(cacheKey);
    if (cached) {
      console.log('✅ Wishlist details cache hit');
      return { ...cached, cached: true };
    }
    
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
      
      // Cache details for 5 minutes
      wishlistCache.put(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching wishlist details:', error);
      return { success: false, items: [], count: 0, error: error.message };
    }
  },

  /**
   * Check if multiple products are in wishlist (CACHED)
   */
  checkMultipleInWishlist: async (productIds) => {
    const cacheKey = `wishlist_multicheck_${productIds.sort().join('_')}`;
    
    const cached = wishlistCache.get(cacheKey);
    if (cached) {
      console.log('✅ Multiple wishlist check cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Checking ${productIds.length} products in wishlist`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        return { 
          success: true, 
          results: productIds.map(id => ({ productId: id, inWishlist: false })) 
        };
      }

      const response = await clientApi.post('/wishlist/check-multiple', { productIds }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Multiple check response:', response.data);
      
      // Cache results for 5 minutes
      wishlistCache.put(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error checking multiple wishlist items:', error);
      return { success: false, results: [], error: error.message };
    }
  },

  /**
   * Clear all wishlist caches
   */
  clearAllCaches: () => {
    wishlistCache.clear();
    console.log('🗑️ All wishlist caches cleared');
  }
};

export default wishlistService;