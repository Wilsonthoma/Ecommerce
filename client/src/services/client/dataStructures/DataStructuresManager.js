import { SortedProductArray } from '../../../utils/binarySearch';
import { SearchTrie } from '../../../dataStructures/Trie';

/**
 * Data Structures Manager - Manages optimized data structures for fast searches
 */
export class DataStructuresManager {
  constructor() {
    this.sortedProducts = null;
    this.searchTrie = new SearchTrie();
    this.initialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize data structures with product data
   */
  async initialize(products) {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('🚀 Initializing product data structures...');
        this.sortedProducts = new SortedProductArray(products, 'price');
        this.searchTrie.buildFromProducts(products);
        this.initialized = true;
        console.log('✅ Product data structures initialized with', products.length, 'products');
        resolve();
      }, 0);
    });
    
    return this.initPromise;
  }

  /**
   * Get products by price range using binary search
   */
  getProductsByPriceRange(minPrice, maxPrice) {
    if (!this.sortedProducts || !this.initialized) {
      console.warn('⚠️ Data structures not initialized yet');
      return [];
    }
    return this.sortedProducts.findInPriceRange(minPrice, maxPrice);
  }

  /**
   * Autocomplete search using Trie
   */
  autocompleteSearch(query, limit = 5) {
    if (!this.searchTrie || !this.initialized || query.length < 2) {
      return [];
    }
    return this.searchTrie.autoComplete(query, limit);
  }

  /**
   * Check if initialized
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

export default DataStructuresManager;