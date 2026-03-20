import BaseService from '../base/BaseService';
import CacheManager from '../cache/CacheManager';
import DataStructuresManager from '../dataStructures/DataStructuresManager';

/**
 * Product Core Service - Handles basic product CRUD operations
 */
export class ProductCoreService extends BaseService {
  constructor() {
    super();
    this.cacheManager = new CacheManager();
    this.dataStructures = new DataStructuresManager();
  }

  /**
   * Initialize data structures
   */
  async initialize(products) {
    return this.dataStructures.initialize(products);
  }

  /**
   * Get all products with filtering
   */
  async getProducts(params = {}) {
    const cacheKey = `products_${JSON.stringify(params)}`;
    const productCache = this.cacheManager.getProductCache();
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Products cache hit');
      return { ...cached, cached: true };
    }
    
    try {
      console.log('📤 Fetching products with filters:', params);
      
      const response = await this.api.get('/products', { params });
      
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

  /**
   * Get single product by ID
   */
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
    const productCache = this.cacheManager.getProductCache();
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Product cache hit:', id);
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(`product_${id}`, async () => {
      try {
        console.log(`📤 Fetching product ${id}`);
        
        const response = await this.api.get(`/products/${id}`);
        
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

  /**
   * Get product by slug
   */
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
    const productCache = this.cacheManager.getProductCache();
    
    const cached = productCache.get(cacheKey);
    if (cached) {
      console.log('✅ Product slug cache hit:', slug);
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(`product_slug_${slug}`, async () => {
      try {
        console.log(`📤 Fetching product by slug: ${slug}`);
        
        const response = await this.api.get(`/products/slug/${slug}`);
        
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

  /**
   * Get products by IDs (for wishlist)
   */
  async getProductsByIds(productIds) {
    if (!productIds || !productIds.length) {
      return { success: true, products: [], failedIds: [] };
    }

    const validIds = productIds.filter(id => id && typeof id === 'string' && id.length > 0);
    
    if (validIds.length === 0) {
      return { success: true, products: [], failedIds: productIds };
    }

    const cacheKey = `products_ids_${[...validIds].sort().join(',')}`;
    const productCache = this.cacheManager.getProductCache();
    
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

  /**
   * Check if product exists
   */
  async checkProductExists(productId) {
    try {
      const response = await this.api.head(`/products/${productId}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get products by price range using binary search
   */
  getProductsByPriceRange(minPrice, maxPrice) {
    return this.dataStructures.getProductsByPriceRange(minPrice, maxPrice);
  }

  /**
   * Autocomplete search using Trie
   */
  autocompleteSearch(query, limit = 5) {
    return this.dataStructures.autocompleteSearch(query, limit);
  }

  /**
   * Clear caches for a specific product
   */
  clearProductCaches(productId) {
    this.cacheManager.clearProductCache(productId);
    console.log(`🗑️ Cleared caches for product ${productId || 'all'}`);
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.cacheManager.clearAllCaches();
  }

  /**
   * Check if initialized
   */
  isInitialized() {
    return this.dataStructures.isInitialized();
  }

  /**
   * Get initialization status
   */
  getInitStatus() {
    return this.dataStructures.getInitStatus();
  }
}

export default ProductCoreService;