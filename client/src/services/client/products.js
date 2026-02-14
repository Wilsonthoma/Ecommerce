// client/src/services/client/products.js
import clientApi from './api';

export const clientProductService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/products/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/products/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get related products
  getRelatedProducts: async (productId, category) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get('/products/related', {
        params: { productId, category }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (productId) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  },

  // Add product review
  addProductReview: async (productId, review) => {
    try {
      // ✅ CORRECT: No /api prefix
      const response = await clientApi.post(`/products/${productId}/reviews`, review);
      return response.data;
    } catch (error) {
      console.error(`Error adding review to product ${productId}:`, error);
      throw error;
    }
  }
};

export default clientProductService;