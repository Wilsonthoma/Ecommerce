import { LRUCache } from '../../../dataStructures/LRUCache';

/**
 * Cache Manager - Handles all caching operations
 */
export class CacheManager {
  constructor() {
    this.productCache = new LRUCache(100);
    this.categoryCache = new LRUCache(50);
    this.searchCache = new LRUCache(30);
    this.reviewCache = new LRUCache(50);
  }

  /**
   * Get product cache
   */
  getProductCache() {
    return this.productCache;
  }

  /**
   * Get category cache
   */
  getCategoryCache() {
    return this.categoryCache;
  }

  /**
   * Get search cache
   */
  getSearchCache() {
    return this.searchCache;
  }

  /**
   * Get review cache
   */
  getReviewCache() {
    return this.reviewCache;
  }

  /**
   * Clear product cache for specific product
   */
  clearProductCache(productId) {
    if (productId) {
      this.productCache.put(`product_${productId}`, null);
      this.productCache.put(`review_summary_${productId}`, null);
      // Clear reviews cache (keys starting with reviews_)
      // In production, you'd want a more sophisticated approach
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.productCache.clear();
    this.categoryCache.clear();
    this.searchCache.clear();
    this.reviewCache.clear();
    console.log('🗑️ All caches cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      productCacheSize: this.productCache.size(),
      categoryCacheSize: this.categoryCache.size(),
      searchCacheSize: this.searchCache.size(),
      reviewCacheSize: this.reviewCache.size()
    };
  }
}

export default CacheManager;