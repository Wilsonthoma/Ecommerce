// client/src/services/client/products.js - COMPLETE REWRITTEN VERSION
import clientApi from './api';

/**
 * Product Service - Handles all product-related API calls
 * Matches backend endpoints at /api/products/*
 */
export const clientProductService = {
  // ========== BASIC PRODUCT METHODS ==========
  
  /**
   * Get all products with comprehensive filtering
   * @param {Object} params - Query parameters (category, minPrice, maxPrice, search, sort, page, limit)
   * @returns {Promise<Object>} - { success, products, total, pages, currentPage, count }
   */
  getProducts: async (params = {}) => {
    try {
      console.log('📤 Fetching products with params:', params);
      
      const response = await clientApi.get('/products', { params });
      
      console.log('📥 Products response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          products: response.data.products || [],
          total: response.data.total || 0,
          pages: response.data.totalPages || 1,
          currentPage: response.data.currentPage || 1,
          count: response.data.count || 0
        };
      }
      
      return {
        success: false,
        products: [],
        total: 0,
        pages: 1,
        currentPage: 1,
        count: 0
      };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        products: [],
        total: 0,
        pages: 1,
        currentPage: 1,
        count: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get single product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} - { success, product, relatedProducts }
   */
  getProduct: async (id) => {
    try {
      console.log(`📤 Fetching product ${id}`);
      
      const response = await clientApi.get(`/products/${id}`);
      
      console.log('📥 Product response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          product: response.data.product || null,
          relatedProducts: response.data.relatedProducts || []
        };
      }
      
      return {
        success: false,
        product: null,
        relatedProducts: [],
        error: 'Product not found'
      };
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      return {
        success: false,
        product: null,
        relatedProducts: [],
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get product by slug (SEO-friendly URL)
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} - { success, product, relatedProducts }
   */
  getProductBySlug: async (slug) => {
    try {
      console.log(`📤 Fetching product by slug: ${slug}`);
      
      const response = await clientApi.get(`/products/slug/${slug}`);
      
      console.log('📥 Product by slug response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          product: response.data.product || null,
          relatedProducts: response.data.relatedProducts || []
        };
      }
      
      return {
        success: false,
        product: null,
        relatedProducts: []
      };
    } catch (error) {
      console.error(`❌ Error fetching product by slug ${slug}:`, error);
      return {
        success: false,
        product: null,
        relatedProducts: [],
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== SECTION-SPECIFIC PRODUCT METHODS ==========
  
  /**
   * Get featured products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Object>} - { success, products, count }
   */
  getFeaturedProducts: async (limit = 8) => {
    try {
      console.log('📤 Fetching featured products with limit:', limit);
      
      const response = await clientApi.get('/products/featured', {
        params: { limit }
      });
      
      console.log('📥 Featured products response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
      }
      
      return {
        success: true,
        products: [],
        count: 0
      };
    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      return {
        success: false,
        products: [],
        count: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get trending products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Object>} - { success, products, count }
   */
  getTrendingProducts: async (limit = 8) => {
    try {
      console.log('📤 Fetching trending products with limit:', limit);
      
      const response = await clientApi.get('/products/trending', {
        params: { limit }
      });
      
      console.log('📥 Trending products response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
      }
      
      return {
        success: true,
        products: [],
        count: 0
      };
    } catch (error) {
      console.error('❌ Error fetching trending products:', error);
      return {
        success: false,
        products: [],
        count: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get flash sale products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Object>} - { success, products, count }
   */
  getFlashSaleProducts: async (limit = 10) => {
    try {
      console.log('📤 Fetching flash sale products with limit:', limit);
      
      const response = await clientApi.get('/products/flash-sale', {
        params: { limit }
      });
      
      console.log('📥 Flash sale products response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
      }
      
      return {
        success: true,
        products: [],
        count: 0
      };
    } catch (error) {
      console.error('❌ Error fetching flash sale products:', error);
      return {
        success: false,
        products: [],
        count: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get just arrived products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Object>} - { success, products, count }
   */
  getJustArrivedProducts: async (limit = 8) => {
    try {
      console.log('📤 Fetching just arrived products with limit:', limit);
      
      const response = await clientApi.get('/products/just-arrived', {
        params: { limit }
      });
      
      console.log('📥 Just arrived products response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
      }
      
      return {
        success: true,
        products: [],
        count: 0
      };
    } catch (error) {
      console.error('❌ Error fetching just arrived products:', error);
      return {
        success: false,
        products: [],
        count: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get top selling products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Object>} - { success, products, count }
   */
  getTopSellingProducts: async (limit = 10) => {
    try {
      console.log('📤 Fetching top selling products with limit:', limit);
      
      const response = await clientApi.get('/products/top-selling', {
        params: { limit }
      });
      
      console.log('📥 Top selling products response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          products: response.data.products || [],
          count: response.data.count || 0
        };
      }
      
      return {
        success: true,
        products: [],
        count: 0
      };
    } catch (error) {
      console.error('❌ Error fetching top selling products:', error);
      return {
        success: false,
        products: [],
        count: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== CATEGORY & FILTER METHODS ==========

  /**
   * Get all categories with product counts
   * @returns {Promise<Object>} - { success, categories }
   */
  getCategories: async () => {
    try {
      console.log('📤 Fetching categories');
      
      const response = await clientApi.get('/products/categories/all');
      
      console.log('📥 Categories response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          categories: response.data.categories || []
        };
      }
      
      return {
        success: true,
        categories: []
      };
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return {
        success: false,
        categories: [],
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get all vendors
   * @returns {Promise<Object>} - { success, vendors }
   */
  getVendors: async () => {
    try {
      console.log('📤 Fetching vendors');
      
      const response = await clientApi.get('/products/vendors/all');
      
      console.log('📥 Vendors response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          vendors: response.data.vendors || []
        };
      }
      
      return {
        success: true,
        vendors: []
      };
    } catch (error) {
      console.error('❌ Error fetching vendors:', error);
      return {
        success: false,
        vendors: [],
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get filter data (price ranges, categories, vendors)
   * @returns {Promise<Object>} - { success, filters }
   */
  getFilterData: async () => {
    try {
      console.log('📤 Fetching filter data');
      
      const response = await clientApi.get('/products/filters/data');
      
      console.log('📥 Filter data response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          filters: response.data.filters || {
            priceRange: { minPrice: 0, maxPrice: 0 },
            categories: [],
            vendors: []
          }
        };
      }
      
      return {
        success: true,
        filters: {
          priceRange: { minPrice: 0, maxPrice: 0 },
          categories: [],
          vendors: []
        }
      };
    } catch (error) {
      console.error('❌ Error fetching filter data:', error);
      return {
        success: false,
        filters: {
          priceRange: { minPrice: 0, maxPrice: 0 },
          categories: [],
          vendors: []
        },
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== SEARCH METHODS ==========

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional search parameters
   * @returns {Promise<Object>} - { success, products, total, pages, currentPage }
   */
  searchProducts: async (query, params = {}) => {
    try {
      console.log(`📤 Searching products with query: ${query}`);
      
      const response = await clientApi.get('/products', {
        params: { search: query, ...params }
      });
      
      console.log('📥 Search response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          products: response.data.products || [],
          total: response.data.total || 0,
          pages: response.data.totalPages || 1,
          currentPage: response.data.currentPage || 1
        };
      }
      
      return {
        success: true,
        products: [],
        total: 0,
        pages: 1,
        currentPage: 1
      };
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return {
        success: false,
        products: [],
        total: 0,
        pages: 1,
        currentPage: 1,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get related products
   * @param {string} productId - Current product ID
   * @param {string} category - Category to find related products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Object>} - { success, products }
   */
  getRelatedProducts: async (productId, category, limit = 4) => {
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
        return {
          success: true,
          products: response.data.products || []
        };
      }
      
      return {
        success: true,
        products: []
      };
    } catch (error) {
      console.error('❌ Error fetching related products:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message
      };
    }
  },

  // ========== REVIEW METHODS ==========

  /**
   * Get product reviews
   * @param {string} productId - Product ID
   * @param {number} page - Page number
   * @param {number} limit - Reviews per page
   * @returns {Promise<Object>} - { success, reviews, distribution, pagination }
   */
  getProductReviews: async (productId, page = 1, limit = 10) => {
    try {
      console.log(`📤 Fetching reviews for product ${productId}`);
      
      const response = await clientApi.get(`/reviews/products/${productId}/reviews`, {
        params: { page, limit }
      });
      
      console.log('📥 Reviews response:', response.data);
      
      if (response.data?.success) {
        return {
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
      }
      
      return {
        success: true,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 }
      };
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      return {
        success: false,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get review summary for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - { success, summary }
   */
  getReviewSummary: async (productId) => {
    try {
      console.log(`📤 Fetching review summary for product ${productId}`);
      
      const response = await clientApi.get(`/reviews/products/${productId}/summary`);
      
      console.log('📥 Review summary response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          summary: response.data.summary || {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          }
        };
      }
      
      return {
        success: true,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
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
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Add a product review
   * @param {string} productId - Product ID
   * @param {Object} reviewData - { rating, comment }
   * @returns {Promise<Object>} - API response
   */
  addProductReview: async (productId, reviewData) => {
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
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding review:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        console.error('❌ Response headers:', error.response.headers);
        
        // Handle specific error cases
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
        console.error('❌ No response received');
        throw new Error('No response from server. Please check your connection.');
      } else {
        console.error('❌ Error message:', error.message);
        throw error;
      }
    }
  },

  /**
   * Update a review
   * @param {string} reviewId - Review ID
   * @param {Object} reviewData - { rating, comment }
   * @returns {Promise<Object>} - API response
   */
  updateReview: async (reviewId, reviewData) => {
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
  },

  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} - API response
   */
  deleteReview: async (reviewId) => {
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
  },

  // ========== UTILITY METHODS ==========

  /**
   * Check if product exists
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} - True if product exists
   */
  checkProductExists: async (productId) => {
    try {
      const response = await clientApi.head(`/products/${productId}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get multiple products by IDs
   * @param {Array<string>} productIds - Array of product IDs
   * @returns {Promise<Object>} - { success, products }
   */
  getProductsByIds: async (productIds) => {
    try {
      console.log(`📤 Fetching ${productIds.length} products by IDs`);
      
      const response = await clientApi.post('/products/batch', { productIds });
      
      console.log('📥 Batch products response:', response.data);
      
      if (response.data?.success) {
        return {
          success: true,
          products: response.data.products || []
        };
      }
      
      return {
        success: false,
        products: []
      };
    } catch (error) {
      console.error('❌ Error fetching products by IDs:', error);
      return {
        success: false,
        products: [],
        error: error.response?.data?.message || error.message
      };
    }
  }
};

export default clientProductService;