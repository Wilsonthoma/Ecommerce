import clientApi from './api';
import { LRUCache, productCache, categoryCache, searchCache } from '../../dataStructures/LRUCache';
import { SortedProductArray } from '../../utils/binarySearch';
import { SearchTrie } from '../../dataStructures/Trie';

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
    this.pendingRequests = new Map();
  }

  async initialize(products) {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('🚀 Initializing product data structures...');
        this.sortedProducts = new SortedProductArray(products, 'price');
        this.searchTrie.buildFromProducts(products);
        this.initialized = true;
        console.log('✅ Product service initialized with', products.length, 'products');
        resolve();
      }, 0);
    });
    
    return this.initPromise;
  }

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

  async getProducts(params = {}) {
    const cacheKey = `products_${JSON.stringify(params)}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Products cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching products with filters:', params);
      
      const response = await clientApi.get('/products', { params });
      
      console.log('📥 Products response:', response.data);
      
      if (response.data?.success) {
        const result = {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.currentPage || 1,
          pagination: {
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.totalPages || 0,
            total: response.data.total || 0,
            hasNextPage: response.data.currentPage < response.data.totalPages,
            hasPrevPage: response.data.currentPage > 1
          }
        };
        
        productCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        products: [],
        error: response.data?.message || 'Failed to fetch products',
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  async getProduct(id) {
    if (!id || typeof id !== 'string' || id.length === 0) {
      return {
        success: false,
        product: null,
        relatedProducts: [],
        error: 'Invalid product ID',
        cached: false
      };
    }

    const cacheKey = `product_${id}`;
    
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
          
          productCache.put(cacheKey, result);
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          product: null,
          relatedProducts: [],
          error: response.data?.message || 'Product not found',
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

  async getProductBySlug(slug) {
    if (!slug || typeof slug !== 'string' || slug.length === 0) {
      return {
        success: false,
        product: null,
        relatedProducts: [],
        error: 'Invalid product slug',
        cached: false
      };
    }

    const cacheKey = `product_slug_${slug}`;
    
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
          
          productCache.put(cacheKey, result);
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          product: null,
          relatedProducts: [],
          error: response.data?.message || 'Product not found',
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

  async getProductsByIds(productIds) {
    if (!productIds || !productIds.length) {
      return { success: true, products: [], failedIds: [] };
    }

    const validIds = productIds.filter(id => id && typeof id === 'string' && id.length > 0);
    
    if (validIds.length === 0) {
      return { success: true, products: [], failedIds: productIds };
    }

    const cacheKey = `products_ids_${[...validIds].sort().join(',')}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Products by IDs cache hit');
      return { ...cached, cached: true };
    }

    try {
      console.log(`📤 Fetching ${validIds.length} products by IDs`);
      
      const products = [];
      const failedIds = [];
      
      for (const id of validIds) {
        try {
          const response = await this.getProduct(id);
          if (response.success && response.product) {
            products.push(response.product);
          } else {
            console.warn(`Product ${id} not found, skipping`);
            failedIds.push(id);
          }
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
          failedIds.push(id);
        }
      }
      
      const result = {
        success: true,
        products: products,
        failedIds: failedIds
      };
      
      if (products.length > 0) {
        productCache.put(cacheKey, result);
      }
      
      return { ...result, cached: false };
    } catch (error) {
      console.error('❌ Error fetching products by IDs:', error);
      return {
        success: false,
        products: [],
        failedIds: validIds,
        error: error.message,
        cached: false
      };
    }
  }

  // ========== REVIEW METHODS ==========

  /**
   * Get product reviews with pagination
   * @param {string} productId - Product ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Reviews data
   */
  async getProductReviews(productId, page = 1, limit = 10) {
    if (!productId) {
      return {
        success: false,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        error: 'Product ID is required',
        cached: false
      };
    }

    const cacheKey = `reviews_${productId}_${page}_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Reviews cache hit for product:', productId);
      return { ...cached, cached: true };
    }

    try {
      console.log(`📤 Fetching reviews for product ${productId} (page ${page})`);
      
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
            page: page,
            limit: limit,
            total: 0,
            pages: 1
          }
        };
        
        // Cache reviews for 2 minutes
        productCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        error: response.data?.message || 'Failed to fetch reviews',
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
   * Get review summary for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Review summary
   */
  async getReviewSummary(productId) {
    if (!productId) {
      return {
        success: false,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        cached: false
      };
    }

    const cacheKey = `review_summary_${productId}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Review summary cache hit for product:', productId);
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
        success: false,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        error: response.data?.message || 'Failed to fetch review summary',
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
   * Add a product review
   * @param {string} productId - Product ID
   * @param {Object} reviewData - Review data { rating, title, comment }
   * @returns {Promise<Object>} Created review
   */
  async addProductReview(productId, reviewData) {
    try {
      console.log(`📤 Adding review to product ${productId}`, reviewData);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      if (!token) {
        throw new Error('Please login to submit a review');
      }

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
      
      // Clear related caches
      this.clearProductCaches(productId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding review:', error);
      
      if (error.response?.status === 403) {
        throw new Error('You can only review products you have purchased');
      } else if (error.response?.status === 401) {
        throw new Error('Please login to submit a review');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid review data');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to submit review');
      }
    }
  }

  /**
   * Update a review
   * @param {string} reviewId - Review ID
   * @param {Object} reviewData - Review data { rating, title, comment }
   * @returns {Promise<Object>} Updated review
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
      
      // Clear related caches
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
   * Delete a review
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} Deletion result
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
      
      // Clear related caches
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

  // ========== PRODUCT LISTING METHODS ==========

  getProductsByPriceRange(minPrice, maxPrice) {
    if (!this.sortedProducts || !this.initialized) {
      console.warn('⚠️ Product service not initialized yet');
      return [];
    }
    return this.sortedProducts.findInPriceRange(minPrice, maxPrice);
  }

  autocompleteSearch(query, limit = 5) {
    if (!this.searchTrie || !this.initialized || query.length < 2) {
      return [];
    }
    return this.searchTrie.autoComplete(query, limit);
  }

  async getFeaturedProducts(limit = 8) {
    const cacheKey = `featured_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await clientApi.get('/products/featured', { params: { limit } });
      
      if (response.data?.success) {
        const result = {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
        
        productCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        products: [],
        error: response.data?.message || 'Failed to fetch featured products',
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  async getTrendingProducts(limit = 8) {
    const cacheKey = `trending_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await clientApi.get('/products/trending', { params: { limit } });
      
      if (response.data?.success) {
        const result = {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
        
        productCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        products: [],
        error: response.data?.message || 'Failed to fetch trending products',
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching trending products:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  async getFlashSaleProducts(limit = 10) {
    const cacheKey = `flashsale_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await clientApi.get('/products/flash-sale', { params: { limit } });
      
      if (response.data?.success) {
        const result = {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
        
        productCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        products: [],
        error: response.data?.message || 'Failed to fetch flash sale products',
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching flash sale products:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  async getJustArrivedProducts(limit = 8) {
    const cacheKey = `justarrived_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await clientApi.get('/products/just-arrived', { params: { limit } });
      
      if (response.data?.success) {
        const result = {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
        
        productCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        products: [],
        error: response.data?.message || 'Failed to fetch just arrived products',
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching just arrived products:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  async getCategories() {
    const cached = categoryCache.get('all_categories');
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await clientApi.get('/products/categories/all');
      
      if (response.data?.success) {
        const result = {
          success: true,
          categories: response.data.categories || []
        };
        
        categoryCache.put('all_categories', result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        categories: [],
        error: response.data?.message || 'Failed to fetch categories',
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return {
        success: false,
        categories: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  async searchProducts(query, params = {}) {
    if (!query || query.trim().length === 0) {
      return { success: true, products: [], count: 0, total: 0 };
    }

    const cacheKey = `search_${query}_${JSON.stringify(params)}`;
    
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log('✅ Search cache hit:', query);
      return { ...cached, cached: true };
    }
    
    try {
      const response = await clientApi.get('/products', { 
        params: { search: query.trim(), ...params }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0,
          total: response.data.total || 0
        };
        
        searchCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        products: [],
        error: response.data?.message || 'Search failed',
        cached: false
      };
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  async getRelatedProducts(productId, category, limit = 4) {
    const cacheKey = `related_${productId}_${category}_${limit}`;
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
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

  clearProductCaches(productId) {
    if (productId) {
      productCache.put(`product_${productId}`, null);
      productCache.put(`review_summary_${productId}`, null);
      // Clear all reviews cache for this product (keys starting with reviews_)
      // In a real app, you'd need more sophisticated cache invalidation
    }
    console.log(`🗑️ Cleared caches for product ${productId || 'all'}`);
  }

  clearAllCaches() {
    productCache.clear();
    categoryCache.clear();
    searchCache.clear();
    console.log('🗑️ All caches cleared');
  }

  async checkProductExists(productId) {
    try {
      const response = await clientApi.head(`/products/${productId}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  getInitStatus() {
    return {
      initialized: this.initialized,
      hasSortedProducts: !!this.sortedProducts,
      hasSearchTrie: !!this.searchTrie,
      productCount: this.sortedProducts?.products.length || 0
    };
  }
}

export const clientProductService = new OptimizedProductService();
export default clientProductService;