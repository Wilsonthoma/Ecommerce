/**
 * Base Service Class - Provides common functionality for all services
 */
import clientApi from '../api';

export class BaseService {
  constructor() {
    this.pendingRequests = new Map();
    this.cache = null;
  }

  /**
   * Deduplicate in-flight requests
   */
  async dedupeRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Reusing in-flight request:', key);
      return this.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Clear all pending requests
   */
  clearPendingRequests() {
    this.pendingRequests.clear();
  }

  /**
   * Get API client
   */
  get api() {
    return clientApi;
  }
}

export default BaseService;