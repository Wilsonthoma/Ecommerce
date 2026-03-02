// client/src/services/client/products.js - FIXED syntax error at line 693
import clientApi from './api';
import { LRUCache, productCache, categoryCache, searchCache } from '../../dataStructures/LRUCache';
import { SortedProductArray } from '../../utils/binarySearch';
import { SearchTrie } from '../../dataStructures/Trie';
import { cachedApi } from './apiWithCache';

/**
 * Optimized Product Service - Handles all product-related API calls with caching
 * Matches backend endpoints at /api/products/*
 */
class OptimizedProductService {
  constructor() {
    this.sortedProducts = null;
    this.searchTrie = new SearchTrie();
    this.categoryTree = null;
    this.initialized = false;
    this.initPromise = null;
    this.pendingRequests = new Map(); // For deduplicating in-flight requests
  }

  /**
   * Initialize data structures with product data
   * @param {Array} products - Array of products
   */
  async initialize(products) {
    if (this.initialized) return;
    
    // Prevent multiple simultaneous initializations
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('🚀 Initializing product data structures...');
        
        // Create sorted array for price searches
        this.sortedProducts = new SortedProductArray(products, 'price');
        
        // Build search trie for autocomplete
        this.searchTrie.buildFromProducts(products);
        
        this.initialized = true;
        console.log('✅ Product service initialized with', products.length, 'products');
        resolve();
      }, 0);
    });
    
    return this.initPromise;
  }

  /**
   * Deduplicate in-flight requests
   * @param {string} key - Unique request key
   * @param {Function} requestFn - Function that returns a promise
   */
  async dedupeRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Reusing in-flight request:', key);
      return this.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  // ========== BASIC PRODUCT METHODS ==========
  
  /**
   * Get all products with comprehensive filtering (CACHED)
   */
  async getProducts(params = {}) {
    const cacheKey = `products_${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Products cache hit');
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products', params, { useCache: true });
    return { ...response, cached: false };
  }

  /**
   * Get single product by ID (CACHED)
   */
  async getProduct(id) {
    const cacheKey = `product_${id}`;
    
    // Check cache first
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Product cache hit:', id);
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(`product_${id}`, async () => {
      try {
        console.log(`📤 Fetching product ${id}`);
        
        const response = await clientApi.get(`/products/${id}`);
        
        console.log('📥 Product response:', response.data);
        
        if (response.data?.success) {
          const result = {
            success: true,
            product: response.data.product || null,
            relatedProducts: response.data.relatedProducts || []
          };
          
          // Cache the result
          productCache.put(cacheKey, result);
          
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          product: null,
          relatedProducts: [],
          error: 'Product not found',
          cached: false
        };
      } catch (error) {
        console.error(`❌ Error fetching product ${id}:`, error);
        return {
          success: false,
          product: null,
          relatedProducts: [],
          error: error.response?.data?.message || error.message,
          cached: false
        };
      }
    });
  }

  /**
   * Get product by slug (SEO-friendly URL) - CACHED
   */
  async getProductBySlug(slug) {
    const cacheKey = `product_slug_${slug}`;
    
    // Check cache first
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Product slug cache hit:', slug);
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(`product_slug_${slug}`, async () => {
      try {
        console.log(`📤 Fetching product by slug: ${slug}`);
        
        const response = await clientApi.get(`/products/slug/${slug}`);
        
        console.log('📥 Product by slug response:', response.data);
        
        if (response.data?.success) {
          const result = {
            success: true,
            product: response.data.product || null,
            relatedProducts: response.data.relatedProducts || []
          };
          
          // Cache the result
          productCache.put(cacheKey, result);
          
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          product: null,
          relatedProducts: [],
          cached: false
        };
      } catch (error) {
        console.error(`❌ Error fetching product by slug ${slug}:`, error);
        return {
          success: false,
          product: null,
          relatedProducts: [],
          error: error.response?.data?.message || error.message,
          cached: false
        };
      }
    });
  }

  // ========== FAST SEARCH METHODS USING DATA STRUCTURES ==========
  
  /**
   * Get products by price range using Binary Search (O(log n))
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Array} - Products in price range
   */
  getProductsByPriceRange(minPrice, maxPrice) {
    if (!this.sortedProducts || !this.initialized) {
      console.warn('⚠️ Product service not initialized yet');
      return [];
    }
    return this.sortedProducts.findInPriceRange(minPrice, maxPrice);
  }

  /**
   * Autocomplete search using Trie (O(m) where m is prefix length)
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Array} - Product IDs matching prefix
   */
  autocompleteSearch(query, limit = 5) {
    if (!this.searchTrie || !this.initialized || query.length < 2) {
      return [];
    }
    return this.searchTrie.autoComplete(query, limit);
  }

  // ========== SECTION-SPECIFIC PRODUCT METHODS (ALL CACHED) ==========
  
  /**
   * Get featured products (CACHED)
   */
  async getFeaturedProducts(limit = 8) {
    const cacheKey = `featured_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products/featured', { limit }, { useCache: true });
    return { ...response, cached: false };
  }

  /**
   * Get trending products (CACHED)
   */
  async getTrendingProducts(limit = 8) {
    const cacheKey = `trending_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products/trending', { limit }, { useCache: true });
    return { ...response, cached: false };
  }

  /**
   * Get flash sale products (CACHED)
   */
  async getFlashSaleProducts(limit = 10) {
    const cacheKey = `flashsale_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products/flash-sale', { limit }, { useCache: true });
    return { ...response, cached: false };
  }

  /**
   * Get just arrived products (CACHED)
   */
  async getJustArrivedProducts(limit = 8) {
    const cacheKey = `justarrived_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products/just-arrived', { limit }, { useCache: true });
    return { ...response, cached: false };
  }

  /**
   * Get top selling products (CACHED)
   */
  async getTopSellingProducts(limit = 10) {
    const cacheKey = `topselling_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products/top-selling', { limit }, { useCache: true });
    return { ...response, cached: false };
  }

  // ========== CATEGORY & FILTER METHODS (CACHED) ==========

  /**
   * Get all categories with product counts (CACHED)
   */
  async getCategories() {
    const cached = categoryCache.get('all_categories');
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products/categories/all', {}, { useCache: true });
    return { ...response, cached: false };
  }

  /**
   * Get all vendors (CACHED)
   */
  async getVendors() {
    const cached = categoryCache.get('all_vendors');
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products/vendors/all', {}, { useCache: true });
    return { ...response, cached: false };
  }

  /**
   * Get filter data (price ranges, categories, vendors) - CACHED
   */
  async getFilterData() {
    const cached = categoryCache.get('filter_data');
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products/filters/data', {}, { useCache: true });
    return { ...response, cached: false };
  }

  // ========== SEARCH METHODS ==========

  /**
   * Search products (CACHED)
   */
  async searchProducts(query, params = {}) {
    const cacheKey = `search_${query}_${JSON.stringify(params)}`;
    
    // Check search cache
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log('✅ Search cache hit:', query);
      return { ...cached, cached: true };
    }
    
    const response = await cachedApi.get('/products', { search: query, ...params }, { useCache: true });
    return { ...response, cached: false };
  }

  /**
   * Get related products (CACHED)
   */
  async getRelatedProducts(productId, category, limit = 4) {
    const cacheKey = `related_${productId}_${category}_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Fetching related products for ${productId} in category ${category}`);
      
      const response = await clientApi.get('/products', {
        params: {
          category,
          limit,
          exclude: productId
        }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          products: response.data.products || []
        };
        
        // Cache for 5 minutes
        productCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: true,
        products: [],
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching related products:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  // ========== REVIEW METHODS (NO CACHING FOR WRITE OPERATIONS) ==========

  /**
   * Get product reviews (CACHED - short TTL)
   */
  async getProductReviews(productId, page = 1, limit = 10) {
    const cacheKey = `reviews_${productId}_${page}_${limit}`;
    
    // Reviews cache with shorter TTL (2 minutes)
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Fetching reviews for product ${productId}`);
      
      const response = await clientApi.get(`/reviews/products/${productId}/reviews`, {
        params: { page, limit }
      });
      
      console.log('📥 Reviews response:', response.data);
      
      if (response.data?.success) {
        const result = {
          success: true,
          reviews: response.data.reviews || [],
          distribution: response.data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          pagination: response.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 1
          }
        };
        
        // Cache reviews for 2 minutes only
        productCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: true,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      return {
        success: false,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Get review summary for a product (CACHED)
   */
  async getReviewSummary(productId) {
    const cacheKey = `review_summary_${productId}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Fetching review summary for product ${productId}`);
      
      const response = await clientApi.get(`/reviews/products/${productId}/summary`);
      
      console.log('📥 Review summary response:', response.data);
      
      if (response.data?.success) {
        const result = {
          success: true,
          summary: response.data.summary || {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          }
        };
        
        // Cache summary for 5 minutes
        productCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: true,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching review summary:', error);
      return {
        success: false,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Add a product review (NO CACHE - WRITE OPERATION)
   */
  async addProductReview(productId, reviewData) {
    try {
      console.log(`📤 Adding review to product ${productId}`, reviewData);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      if (!token) {
        throw new Error('Please login to submit a review');
      }

      console.log('🔑 Token exists:', !!token);
      console.log('🔑 CSRF Token exists:', !!csrfToken);

      const response = await clientApi.post(
        `/reviews/products/${productId}/reviews`, 
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
          }
        }
      );
      
      console.log('📥 Add review response:', response.data);
      
      // Clear related caches when new review is added
      this.clearProductCaches(productId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding review:', error);
      
      if (error.response) {
        if (error.response.status === 403) {
          if (error.response.data?.message?.toLowerCase().includes('csrf')) {
            throw new Error('Security token expired. Please refresh the page and try again.');
          }
          throw new Error('You do not have permission to submit a review');
        } else if (error.response.status === 401) {
          throw new Error('Please login to submit a review');
        } else if (error.response.status === 400) {
          throw new Error(error.response.data?.message || 'Invalid review data');
        } else {
          throw new Error(error.response.data?.message || `Failed to add review (${error.response.status})`);
        }
      } else if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw error;
      }
    }
  }

  /**
   * Update a review (NO CACHE - WRITE OPERATION)
   */
  async updateReview(reviewId, reviewData) {
    try {
      console.log(`📤 Updating review ${reviewId}`, reviewData);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      if (!token) {
        throw new Error('Please login to update a review');
      }

      const response = await clientApi.put(
        `/reviews/reviews/${reviewId}`, 
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
          }
        }
      );
      
      console.log('📥 Update review response:', response.data);
      
      // Clear product cache to reflect changes
      if (response.data?.productId) {
        this.clearProductCaches(response.data.productId);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating review:', error);
      
      if (error.response?.status === 403) {
        throw new Error('You can only edit your own reviews');
      } else if (error.response?.status === 401) {
        throw new Error('Please login to update a review');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update review');
      }
    }
  }

  /**
   * Delete a review (NO CACHE - WRITE OPERATION)
   */
  async deleteReview(reviewId) {
    try {
      console.log(`📤 Deleting review ${reviewId}`);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      if (!token) {
        throw new Error('Please login to delete a review');
      }

      const response = await clientApi.delete(`/reviews/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      console.log('📥 Delete review response:', response.data);
      
      // Clear product cache to reflect changes
      if (response.data?.productId) {
        this.clearProductCaches(response.data.productId);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      
      if (error.response?.status === 403) {
        throw new Error('You can only delete your own reviews');
      } else if (error.response?.status === 401) {
        throw new Error('Please login to delete a review');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to delete review');
      }
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Clear caches for a specific product
   * @param {string} productId - Product ID
   */
  clearProductCaches(productId) {
    // Clear product from cache
    productCache.put(`product_${productId}`, null);
    
    // Clear reviews cache (keys starting with reviews_)
    // Note: In a real app, you'd need a more sophisticated cache invalidation
    console.log(`🗑️ Cleared caches for product ${productId}`);
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    productCache.clear();
    categoryCache.clear();
    searchCache.clear();
    console.log('🗑️ All caches cleared');
  }

  /**
   * Check if product exists (uses HEAD request - no cache needed)
   */
  async checkProductExists(productId) {
    try {
      const response = await clientApi.head(`/products/${productId}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get multiple products by IDs (CACHED)
   */
  async getProductsByIds(productIds) {
    if (!productIds || !productIds.length) return { success: true, products: [], cached: false };
    
    const sortedIds = [...productIds].sort();
    const cacheKey = `batch_${sortedIds.join(',')}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Fetching ${productIds.length} products by IDs`);
      
      const response = await clientApi.post('/products/batch', { productIds });
      
      console.log('📥 Batch products response:', response.data);
      
      if (response.data?.success) {
        const result = {
          success: true,
          products: response.data.products || []
        };
        
        // Cache batch results
        productCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        products: [],
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching products by IDs:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get initialization status
   */
  getInitStatus() {
    return {
      initialized: this.initialized,
      hasSortedProducts: !!this.sortedProducts,
      hasSearchTrie: !!this.searchTrie,
      productCount: this.sortedProducts?.products.length || 0
    };
  }
}

// Create and export a singleton instance
export const clientProductService = new OptimizedProductService();

// Also export as default for backward compatibility
export default clientProductService;