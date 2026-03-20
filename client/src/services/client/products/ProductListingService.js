import BaseService from '../base/BaseService';
import CacheManager from '../cache/CacheManager';

/**
 * Product Listing Service - Handles product listing endpoints
 */
export class ProductListingService extends BaseService {
  constructor(cacheManager) {
    super();
    this.cacheManager = cacheManager;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 8) {
    const cacheKey = `featured_${limit}`;
    const productCache = this.cacheManager.getProductCache();
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await this.api.get('/products/featured', { params: { limit } });
      
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

  /**
   * Get trending products
   */
  async getTrendingProducts(limit = 8) {
    const cacheKey = `trending_${limit}`;
    const productCache = this.cacheManager.getProductCache();
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await this.api.get('/products/trending', { params: { limit } });
      
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

  /**
   * Get flash sale products
   */
  async getFlashSaleProducts(limit = 10) {
    const cacheKey = `flashsale_${limit}`;
    const productCache = this.cacheManager.getProductCache();
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await this.api.get('/products/flash-sale', { params: { limit } });
      
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

  /**
   * Get just arrived products
   */
  async getJustArrivedProducts(limit = 8) {
    const cacheKey = `justarrived_${limit}`;
    const productCache = this.cacheManager.getProductCache();
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await this.api.get('/products/just-arrived', { params: { limit } });
      
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

  /**
   * Get related products
   */
  async getRelatedProducts(productId, category, limit = 4) {
    const cacheKey = `related_${productId}_${category}_${limit}`;
    const productCache = this.cacheManager.getProductCache();
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await this.api.get('/products', {
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

  /**
   * Get categories
   */
  async getCategories() {
    const categoryCache = this.cacheManager.getCategoryCache();
    const cached = categoryCache.get('all_categories');
    if (cached) {
      return { ...cached, cached: true };
    }
    
    try {
      const response = await this.api.get('/products/categories/all');
      
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

  /**
   * Search products
   */
  async searchProducts(query, params = {}) {
    if (!query || query.trim().length === 0) {
      return { success: true, products: [], count: 0, total: 0 };
    }

    const cacheKey = `search_${query}_${JSON.stringify(params)}`;
    const searchCache = this.cacheManager.getSearchCache();
    
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log('✅ Search cache hit:', query);
      return { ...cached, cached: true };
    }
    
    try {
      const response = await this.api.get('/products', { 
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
}

export default ProductListingService;