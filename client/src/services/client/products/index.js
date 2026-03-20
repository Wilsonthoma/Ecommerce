import ProductCoreService from './ProductCoreService';
import ProductListingService from './ProductListingService';
import ProductReviewService from './ProductReviewService';
import CacheManager from '../cache/CacheManager';

/**
 * Optimized Product Service - Main entry point that combines all services
 */
class OptimizedProductService {
  constructor() {
    this.cacheManager = new CacheManager();
    this.core = new ProductCoreService();
    this.listing = new ProductListingService(this.cacheManager);
    this.reviews = new ProductReviewService(this.cacheManager);
  }

  // Core methods
  async initialize(products) {
    return this.core.initialize(products);
  }

  async getProducts(params = {}) {
    return this.core.getProducts(params);
  }

  async getProduct(id) {
    return this.core.getProduct(id);
  }

  async getProductBySlug(slug) {
    return this.core.getProductBySlug(slug);
  }

  async getProductsByIds(productIds) {
    return this.core.getProductsByIds(productIds);
  }

  getProductsByPriceRange(minPrice, maxPrice) {
    return this.core.getProductsByPriceRange(minPrice, maxPrice);
  }

  autocompleteSearch(query, limit = 5) {
    return this.core.autocompleteSearch(query, limit);
  }

  async checkProductExists(productId) {
    return this.core.checkProductExists(productId);
  }

  // Listing methods
  async getFeaturedProducts(limit = 8) {
    return this.listing.getFeaturedProducts(limit);
  }

  async getTrendingProducts(limit = 8) {
    return this.listing.getTrendingProducts(limit);
  }

  async getFlashSaleProducts(limit = 10) {
    return this.listing.getFlashSaleProducts(limit);
  }

  async getJustArrivedProducts(limit = 8) {
    return this.listing.getJustArrivedProducts(limit);
  }

  async getCategories() {
    return this.listing.getCategories();
  }

  async searchProducts(query, params = {}) {
    return this.listing.searchProducts(query, params);
  }

  async getRelatedProducts(productId, category, limit = 4) {
    return this.listing.getRelatedProducts(productId, category, limit);
  }

  // Review methods
  async getProductReviews(productId, page = 1, limit = 10) {
    return this.reviews.getProductReviews(productId, page, limit);
  }

  async getReviewSummary(productId) {
    return this.reviews.getReviewSummary(productId);
  }

  async addProductReview(productId, reviewData) {
    return this.reviews.addProductReview(productId, reviewData);
  }

  async updateReview(reviewId, reviewData) {
    return this.reviews.updateReview(reviewId, reviewData);
  }

  async deleteReview(reviewId) {
    return this.reviews.deleteReview(reviewId);
  }

  // Cache management
  clearProductCaches(productId) {
    this.core.clearProductCaches(productId);
  }

  clearAllCaches() {
    this.core.clearAllCaches();
  }

  // Status methods
  isInitialized() {
    return this.core.isInitialized();
  }

  getInitStatus() {
    return this.core.getInitStatus();
  }

  getCacheStats() {
    return this.cacheManager.getStats();
  }
}

// Create and export a singleton instance
export const clientProductService = new OptimizedProductService();
export default clientProductService;