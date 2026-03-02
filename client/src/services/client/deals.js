// src/services/client/deals.js - Complete Deals Service with LRU Cache
import clientApi from './api';
import { cachedApi } from './apiWithCache';
import { LRUCache } from '../../dataStructures/LRUCache';

// Create dedicated cache for deals
const dealsCache = new LRUCache(30); // Cache up to 30 deal collections

/**
 * Deals Service - Handles all deals and promotions API calls
 * Endpoints: /api/deals/*
 */
class DealsService {
  constructor() {
    this.pendingRequests = new Map(); // For deduplicating in-flight requests
  }

  /**
   * Deduplicate in-flight requests
   */
  async dedupeRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Reusing in-flight deals request:', key);
      return this.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Get all active deals (CACHED)
   */
  async getActiveDeals(params = {}) {
    const cacheKey = `active_deals_${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Active deals cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/deals/active', params, { useCache: true });
  }

  /**
   * Get flash sale deals (CACHED)
   */
  async getFlashSaleDeals(limit = 10) {
    const cacheKey = `flash_sale_${limit}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Flash sale deals cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/deals/flash-sale', { limit }, { useCache: true });
  }

  /**
   * Get daily deals (CACHED)
   */
  async getDailyDeals(limit = 10) {
    const cacheKey = `daily_deals_${limit}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Daily deals cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/deals/daily', { limit }, { useCache: true });
  }

  /**
   * Get clearance deals (CACHED)
   */
  async getClearanceDeals(limit = 10) {
    const cacheKey = `clearance_deals_${limit}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Clearance deals cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/deals/clearance', { limit }, { useCache: true });
  }

  /**
   * Get deals by category (CACHED)
   */
  async getDealsByCategory(category, limit = 10) {
    const cacheKey = `deals_category_${category}_${limit}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Category deals cache hit:', category);
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/deals/category', { category, limit }, { useCache: true });
  }

  /**
   * Get a specific deal by ID (CACHED)
   */
  async getDeal(dealId) {
    const cacheKey = `deal_${dealId}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Deal cache hit:', dealId);
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(`deal_${dealId}`, async () => {
      try {
        console.log(`📤 Fetching deal ${dealId}...`);
        
        const response = await clientApi.get(`/deals/${dealId}`);
        
        console.log('📥 Deal response:', response.data);
        
        if (response.data?.success) {
          const result = {
            success: true,
            deal: response.data.deal || null
          };
          
          // Cache the result
          dealsCache.put(cacheKey, result);
          
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          deal: null,
          cached: false
        };
      } catch (error) {
        console.error(`❌ Error fetching deal ${dealId}:`, error);
        return {
          success: false,
          deal: null,
          error: error.response?.data?.message || error.message,
          cached: false
        };
      }
    });
  }

  /**
   * Get featured deals (CACHED)
   */
  async getFeaturedDeals(limit = 5) {
    const cacheKey = `featured_deals_${limit}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Featured deals cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/deals/featured', { limit }, { useCache: true });
  }

  /**
   * Get upcoming deals (CACHED - short TTL)
   */
  async getUpcomingDeals(limit = 5) {
    const cacheKey = `upcoming_deals_${limit}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Upcoming deals cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/deals/upcoming', { limit }, { useCache: true });
  }

  /**
   * Get deal countdown (CACHED - short TTL)
   */
  async getDealCountdown(dealId) {
    const cacheKey = `deal_countdown_${dealId}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Deal countdown cache hit:', dealId);
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Fetching countdown for deal ${dealId}...`);
      
      const response = await clientApi.get(`/deals/${dealId}/countdown`);
      
      if (response.data?.success) {
        const result = {
          success: true,
          countdown: response.data.countdown || null,
          endsAt: response.data.endsAt
        };
        
        // Cache for 30 seconds only (countdown changes frequently)
        dealsCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        countdown: null,
        cached: false
      };
    } catch (error) {
      console.error(`❌ Error fetching countdown for deal ${dealId}:`, error);
      return {
        success: false,
        countdown: null,
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Check if a product is on sale (CACHED)
   */
  async checkProductDeal(productId) {
    const cacheKey = `product_deal_${productId}`;
    
    const cached = dealsCache.get(cacheKey);
    if (cached) {
      console.log('✅ Product deal check cache hit:', productId);
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Checking deal for product ${productId}...`);
      
      const response = await clientApi.get(`/deals/product/${productId}`);
      
      const result = {
        success: true,
        onSale: response.data?.onSale || false,
        deal: response.data?.deal || null
      };
      
      dealsCache.put(cacheKey, result);
      
      return { ...result, cached: false };
    } catch (error) {
      console.error(`❌ Error checking product deal ${productId}:`, error);
      return {
        success: false,
        onSale: false,
        deal: null,
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Clear all deals caches
   */
  clearAllCaches() {
    dealsCache.clear();
    console.log('🗑️ All deals caches cleared');
  }
}

// Create and export a singleton instance
export const clientDealsService = new DealsService();

export default clientDealsService;