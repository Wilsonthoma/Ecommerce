// Create this file - cached API wrapper
import clientApi from './api';
import { productCache, categoryCache, searchCache } from '../../dataStructures/LRUCache';

export const cachedApi = {
  get: async (url, params = {}, options = {}) => {
    const { useCache = true } = options;
    const cacheKey = `${url}_${JSON.stringify(params)}`;
    
    let cache;
    if (url.includes('/products/') && url.split('/').length > 2) cache = productCache;
    else if (url.includes('/categories')) cache = categoryCache;
    else if (url.includes('/search')) cache = searchCache;
    
    if (useCache && cache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('✅ Cache hit:', url);
        return cached;
      }
    }
    
    const response = await clientApi.get(url, { params });
    
    if (useCache && cache && response.data?.success) {
      console.log('📦 Caching:', url);
      cache.put(cacheKey, response.data);
    }
    
    return response.data;
  },

  post: async (url, data) => {
    return clientApi.post(url, data);
  },

  clearCache: () => {
    productCache.clear();
    categoryCache.clear();
    searchCache.clear();
  }
};