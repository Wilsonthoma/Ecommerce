// client/src/services/client/products.js
import clientApi from './api';

export const clientProductService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    try {
      console.log('📤 Fetching products with params:', params);
      
      // ✅ Matches backend: /products with query params
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

  // Get single product
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

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      console.log('📤 Fetching featured products with limit:', limit);
      
      // ✅ Matches backend: /products/featured?limit=8
      const response = await clientApi.get('/products/featured', {
        params: { limit }
      });
      
      console.log('📥 Featured products response:', response.data);
      
      // Backend returns: { success, count, products }
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

  // Get top selling products
  getTopSellingProducts: async (limit = 10) => {
    try {
      console.log('📤 Fetching top selling products with limit:', limit);
      
      // ✅ Matches backend: /products/top-selling?limit=10
      const response = await clientApi.get('/products/top-selling', {
        params: { limit }
      });
      
      console.log('📥 Top selling products response:', response.data);
      
      // Backend returns: { success, count, products }
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

  // Get categories (from backend - you might need to create this endpoint)
  getCategories: async () => {
    try {
      console.log('📤 Fetching categories');
      
      // Note: Your backend doesn't have a categories endpoint yet
      // For now, we'll get categories from products
      const response = await clientApi.get('/products', {
        params: { limit: 100 }
      });
      
      if (response.data && response.data.success) {
        // Extract unique categories from products
        const products = response.data.products || [];
        const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
        
        // Format categories for the filter
        const categories = uniqueCategories.map(cat => ({
          _id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          slug: cat,
          productCount: products.filter(p => p.category === cat).length
        }));
        
        return {
          success: true,
          categories
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

  // Search products (using the main products endpoint with search param)
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
          pages: response.data.totalPages || 1
        };
      }
      
      return {
        success: true,
        products: [],
        total: 0,
        pages: 1
      };
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return {
        success: false,
        products: [],
        total: 0,
        pages: 1,
        error: error.message
      };
    }
  },

  // Get related products (already included in getProduct response)
  getRelatedProducts: async (productId, category) => {
    try {
      // This is already handled in getProduct, but if you need standalone:
      const response = await clientApi.get('/products', {
        params: {
          category,
          limit: 4,
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

  // Get product by slug (if you have slugs)
  getProductBySlug: async (slug) => {
    try {
      // First find the product by slug
      const response = await clientApi.get('/products', {
        params: { search: slug, limit: 1 }
      });
      
      if (response.data && response.data.success && response.data.products.length > 0) {
        const product = response.data.products[0];
        // Then get full details
        return await clientProductService.getProduct(product._id);
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
      
      // Get token from localStorage
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
      
      // Get token from localStorage
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
      
      // Get token from localStorage
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
  }
};

export default clientProductService;