import BaseService from '../base/BaseService';
import CacheManager from '../cache/CacheManager';

/**
 * Product Review Service - Handles review-related operations
 */
export class ProductReviewService extends BaseService {
  constructor(cacheManager) {
    super();
    this.cacheManager = cacheManager;
  }

  /**
   * Get product reviews with pagination
   */
  async getProductReviews(productId, page = 1, limit = 10) {
    if (!productId) {
      return {
        success: false,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        error: 'Product ID is required',
        cached: false
      };
    }

    const cacheKey = `reviews_${productId}_${page}_${limit}`;
    const reviewCache = this.cacheManager.getReviewCache();
    
    const cached = reviewCache.get(cacheKey);
    if (cached) {
      console.log('✅ Reviews cache hit for product:', productId);
      return { ...cached, cached: true };
    }

    try {
      console.log(`📤 Fetching reviews for product ${productId} (page ${page})`);
      
      const response = await this.api.get(`/reviews/products/${productId}/reviews`, {
        params: { page, limit }
      });
      
      console.log('📥 Reviews response:', response.data);
      
      if (response.data?.success) {
        const result = {
          success: true,
          reviews: response.data.reviews || [],
          distribution: response.data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          pagination: response.data.pagination || {
            page: page,
            limit: limit,
            total: 0,
            pages: 1
          }
        };
        
        reviewCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        error: response.data?.message || 'Failed to fetch reviews',
        cached: false
      };
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      return {
        success: false,
        reviews: [],
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Get review summary for a product
   */
  async getReviewSummary(productId) {
    if (!productId) {
      return {
        success: false,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        cached: false
      };
    }

    const cacheKey = `review_summary_${productId}`;
    const reviewCache = this.cacheManager.getReviewCache();
    
    const cached = reviewCache.get(cacheKey);
    if (cached) {
      console.log('✅ Review summary cache hit for product:', productId);
      return { ...cached, cached: true };
    }

    try {
      console.log(`📤 Fetching review summary for product ${productId}`);
      
      const response = await this.api.get(`/reviews/products/${productId}/summary`);
      
      console.log('📥 Review summary response:', response.data);
      
      if (response.data?.success) {
        const result = {
          success: true,
          summary: response.data.summary || {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          }
        };
        
        reviewCache.put(cacheKey, result);
        return { ...result, cached: false };
      }
      
      return {
        success: false,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        error: response.data?.message || 'Failed to fetch review summary',
        cached: false
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
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Add a product review
   */
  async addProductReview(productId, reviewData) {
    try {
      console.log(`📤 Adding review to product ${productId}`, reviewData);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      if (!token) {
        throw new Error('Please login to submit a review');
      }

      const response = await this.api.post(
        `/reviews/products/${productId}/reviews`,
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
          }
        }
      );
      
      console.log('📥 Add review response:', response.data);
      
      // Clear related caches
      this.cacheManager.clearProductCache(productId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding review:', error);
      
      if (error.response?.status === 403) {
        throw new Error('You can only review products you have purchased');
      } else if (error.response?.status === 401) {
        throw new Error('Please login to submit a review');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid review data');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to submit review');
      }
    }
  }

  /**
   * Update a review
   */
  async updateReview(reviewId, reviewData) {
    try {
      console.log(`📤 Updating review ${reviewId}`, reviewData);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      if (!token) {
        throw new Error('Please login to update a review');
      }

      const response = await this.api.put(
        `/reviews/reviews/${reviewId}`,
        reviewData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
          }
        }
      );
      
      console.log('📥 Update review response:', response.data);
      
      // Clear related caches
      if (response.data?.productId) {
        this.cacheManager.clearProductCache(response.data.productId);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating review:', error);
      
      if (error.response?.status === 403) {
        throw new Error('You can only edit your own reviews');
      } else if (error.response?.status === 401) {
        throw new Error('Please login to update a review');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update review');
      }
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId) {
    try {
      console.log(`📤 Deleting review ${reviewId}`);
      
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      if (!token) {
        throw new Error('Please login to delete a review');
      }

      const response = await this.api.delete(`/reviews/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        }
      });
      
      console.log('📥 Delete review response:', response.data);
      
      // Clear related caches
      if (response.data?.productId) {
        this.cacheManager.clearProductCache(response.data.productId);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      
      if (error.response?.status === 403) {
        throw new Error('You can only delete your own reviews');
      } else if (error.response?.status === 401) {
        throw new Error('Please login to delete a review');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to delete review');
      }
    }
  }
}

export default ProductReviewService;