// client/src/services/client/products.js
import clientApi from './api';

export const clientProductService = {
  // Get all products with comprehensive filtering
  getProducts: async (params = {}) => {
    try {
      console.log('📤 Fetching products with params:', params);
      
      // ✅ Matches backend: /products with all query params
      const response = await clientApi.get('/products', { params });
      
      console.log('📥 Products response:', response.data);
      
      // Backend returns: { success, count, total, totalPages, currentPage, products }
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get single product by ID
  getProduct: async (id) => {
    try {
      console.log(`📤 Fetching product ${id}`);
      
      // ✅ Matches backend: /products/:id
      const response = await clientApi.get(`/products/${id}`);
      
      console.log('📥 Product response:', response.data);
      
      // Backend returns: { success, product, relatedProducts }
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get product by slug (SEO-friendly URL)
  getProductBySlug: async (slug) => {
    try {
      console.log(`📤 Fetching product by slug: ${slug}`);
      
      // ✅ Matches backend: /products/slug/:slug
      const response = await clientApi.get(`/products/slug/${slug}`);
      
      console.log('📥 Product by slug response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      console.log('📤 Fetching featured products with limit:', limit);
      
      // ✅ Matches backend: /products/featured?limit=8
      const response = await clientApi.get('/products/featured', {
        params: { limit }
      });
      
      console.log('📥 Featured products response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get trending products
  getTrendingProducts: async (limit = 8) => {
    try {
      console.log('📤 Fetching trending products with limit:', limit);
      
      // ✅ Matches backend: /products/trending?limit=8
      const response = await clientApi.get('/products/trending', {
        params: { limit }
      });
      
      console.log('📥 Trending products response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get flash sale products
  getFlashSaleProducts: async (limit = 10) => {
    try {
      console.log('📤 Fetching flash sale products with limit:', limit);
      
      // ✅ Matches backend: /products/flash-sale?limit=10
      const response = await clientApi.get('/products/flash-sale', {
        params: { limit }
      });
      
      console.log('📥 Flash sale products response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get just arrived products
  getJustArrivedProducts: async (limit = 8) => {
    try {
      console.log('📤 Fetching just arrived products with limit:', limit);
      
      // ✅ Matches backend: /products/just-arrived?limit=8
      const response = await clientApi.get('/products/just-arrived', {
        params: { limit }
      });
      
      console.log('📥 Just arrived products response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get top selling products
  getTopSellingProducts: async (limit = 10) => {
    try {
      console.log('📤 Fetching top selling products with limit:', limit);
      
      // ✅ Matches backend: /products/top-selling?limit=10
      const response = await clientApi.get('/products/top-selling', {
        params: { limit }
      });
      
      console.log('📥 Top selling products response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get all categories with counts
  getCategories: async () => {
    try {
      console.log('📤 Fetching categories');
      
      // ✅ Matches backend: /products/categories/all
      const response = await clientApi.get('/products/categories/all');
      
      console.log('📥 Categories response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get all vendors
  getVendors: async () => {
    try {
      console.log('📤 Fetching vendors');
      
      // ✅ Matches backend: /products/vendors/all
      const response = await clientApi.get('/products/vendors/all');
      
      console.log('📥 Vendors response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get filter data (price ranges, etc)
  getFilterData: async () => {
    try {
      console.log('📤 Fetching filter data');
      
      // ✅ Matches backend: /products/filters/data
      const response = await clientApi.get('/products/filters/data');
      
      console.log('📥 Filter data response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Search products (uses main products endpoint with search param)
  searchProducts: async (query, params = {}) => {
    try {
      console.log(`📤 Searching products with query: ${query}`);
      
      // ✅ Uses the main products endpoint with search param
      const response = await clientApi.get('/products', {
        params: { search: query, ...params }
      });
      
      console.log('📥 Search response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get related products (standalone endpoint)
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
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // ========== REVIEW METHODS ==========

  // Get product reviews
  getProductReviews: async (productId, page = 1, limit = 10) => {
    try {
      console.log(`📤 Fetching reviews for product ${productId}`);
      const response = await clientApi.get(`/reviews/products/${productId}/reviews`, {
        params: { page, limit }
      });
      
      console.log('📥 Reviews response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Get review summary
  getReviewSummary: async (productId) => {
    try {
      console.log(`📤 Fetching review summary for product ${productId}`);
      const response = await clientApi.get(`/reviews/products/${productId}/summary`);
      
      console.log('📥 Review summary response:', response.data);
      
      if (response.data && response.data.success) {
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
        error: error.message
      };
    }
  },

  // Add product review
  addProductReview: async (productId, reviewData) => {
    try {
      console.log(`📤 Adding review to product ${productId}`, reviewData);
      
      const token = localStorage.getItem('token');
      
      const response = await clientApi.post(`/reviews/products/${productId}/reviews`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📥 Add review response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding review:', error);
      throw error;
    }
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    try {
      console.log(`📤 Updating review ${reviewId}`, reviewData);
      
      const token = localStorage.getItem('token');
      
      const response = await clientApi.put(`/reviews/reviews/${reviewId}`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📥 Update review response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating review:', error);
      throw error;
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    try {
      console.log(`📤 Deleting review ${reviewId}`);
      
      const token = localStorage.getItem('token');
      
      const response = await clientApi.delete(`/reviews/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📥 Delete review response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      throw error;
    }
  },

  // Check if product exists (quick check)
  checkProductExists: async (productId) => {
    try {
      const response = await clientApi.head(`/products/${productId}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
};

export default clientProductService;