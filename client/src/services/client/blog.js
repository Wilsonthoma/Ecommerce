// src/services/client/blog.js - Complete Blog Service with LRU Cache
import clientApi from './api';
import { cachedApi } from './apiWithCache';
import { LRUCache } from '../../dataStructures/LRUCache';

// Create dedicated cache for blog
const blogCache = new LRUCache(50); // Cache up to 50 blog posts/collections

/**
 * Blog Service - Handles all blog-related API calls
 * Endpoints: /api/blog/*
 */
class BlogService {
  constructor() {
    this.pendingRequests = new Map(); // For deduplicating in-flight requests
  }

  /**
   * Deduplicate in-flight requests
   */
  async dedupeRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      console.log('🔄 Reusing in-flight blog request:', key);
      return this.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Get all blog posts with pagination (CACHED)
   */
  async getPosts(params = {}) {
    const cacheKey = `blog_posts_${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Blog posts cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/posts', params, { useCache: true });
  }

  /**
   * Get a single blog post by ID or slug (CACHED)
   */
  async getPost(postId) {
    const cacheKey = `blog_post_${postId}`;
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Blog post cache hit:', postId);
      return { ...cached, cached: true };
    }
    
    return await this.dedupeRequest(`blog_post_${postId}`, async () => {
      try {
        console.log(`📤 Fetching blog post ${postId}...`);
        
        const response = await clientApi.get(`/blog/posts/${postId}`);
        
        console.log('📥 Blog post response:', response.data);
        
        if (response.data?.success) {
          const result = {
            success: true,
            post: response.data.post || null,
            related: response.data.related || []
          };
          
          // Cache the result
          blogCache.put(cacheKey, result);
          
          return { ...result, cached: false };
        }
        
        return {
          success: false,
          post: null,
          related: [],
          cached: false
        };
      } catch (error) {
        console.error(`❌ Error fetching blog post ${postId}:`, error);
        return {
          success: false,
          post: null,
          related: [],
          error: error.response?.data?.message || error.message,
          cached: false
        };
      }
    });
  }

  /**
   * Get featured blog post (CACHED)
   */
  async getFeaturedPost() {
    const cacheKey = 'blog_featured';
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Featured post cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/featured', {}, { useCache: true });
  }

  /**
   * Get latest blog posts (CACHED)
   */
  async getLatestPosts(limit = 6) {
    const cacheKey = `blog_latest_${limit}`;
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Latest posts cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/latest', { limit }, { useCache: true });
  }

  /**
   * Get popular blog posts (CACHED)
   */
  async getPopularPosts(limit = 5) {
    const cacheKey = `blog_popular_${limit}`;
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Popular posts cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/popular', { limit }, { useCache: true });
  }

  /**
   * Get blog posts by category (CACHED)
   */
  async getPostsByCategory(category, params = {}) {
    const cacheKey = `blog_category_${category}_${JSON.stringify(params)}`;
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Category posts cache hit:', category);
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/category', { category, ...params }, { useCache: true });
  }

  /**
   * Get blog posts by tag (CACHED)
   */
  async getPostsByTag(tag, params = {}) {
    const cacheKey = `blog_tag_${tag}_${JSON.stringify(params)}`;
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Tag posts cache hit:', tag);
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/tag', { tag, ...params }, { useCache: true });
  }

  /**
   * Get all categories with post counts (CACHED)
   */
  async getCategories() {
    const cacheKey = 'blog_categories';
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Blog categories cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/categories', {}, { useCache: true });
  }

  /**
   * Get all tags with post counts (CACHED)
   */
  async getTags() {
    const cacheKey = 'blog_tags';
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Blog tags cache hit');
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/tags', {}, { useCache: true });
  }

  /**
   * Search blog posts (CACHED)
   */
  async searchPosts(query, params = {}) {
    const cacheKey = `blog_search_${query}_${JSON.stringify(params)}`;
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Blog search cache hit:', query);
      return { ...cached, cached: true };
    }
    
    return await cachedApi.get('/blog/search', { q: query, ...params }, { useCache: true });
  }

  /**
   * Get related posts (CACHED)
   */
  async getRelatedPosts(postId, limit = 3) {
    const cacheKey = `blog_related_${postId}_${limit}`;
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Related posts cache hit:', postId);
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Fetching related posts for ${postId}...`);
      
      const response = await clientApi.get(`/blog/posts/${postId}/related`, {
        params: { limit }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          posts: response.data.posts || []
        };
        
        blogCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: true,
        posts: [],
        cached: false
      };
    } catch (error) {
      console.error(`❌ Error fetching related posts for ${postId}:`, error);
      return {
        success: false,
        posts: [],
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Increment post view count (NO CACHE)
   */
  async incrementViewCount(postId) {
    try {
      console.log(`📤 Incrementing view count for post ${postId}...`);
      
      const response = await clientApi.post(`/blog/posts/${postId}/view`);
      
      // Clear specific post cache to reflect new view count
      blogCache.put(`blog_post_${postId}`, null);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error incrementing view count for ${postId}:`, error);
      return { success: false };
    }
  }

  /**
   * Like a blog post (NO CACHE)
   */
  async likePost(postId) {
    try {
      console.log(`📤 Liking post ${postId}...`);
      
      const token = localStorage.getItem('token');
      
      const response = await clientApi.post(`/blog/posts/${postId}/like`, {}, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      // Clear specific post cache
      blogCache.put(`blog_post_${postId}`, null);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error liking post ${postId}:`, error);
      return { success: false };
    }
  }

  /**
   * Add a comment to a blog post (NO CACHE)
   */
  async addComment(postId, commentData) {
    try {
      console.log(`📤 Adding comment to post ${postId}:`, commentData);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to comment');
      }

      const response = await clientApi.post(`/blog/posts/${postId}/comments`, commentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Clear post cache to show new comment
      blogCache.put(`blog_post_${postId}`, null);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error adding comment to post ${postId}:`, error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to comment');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to add comment');
      }
    }
  }

  /**
   * Get comments for a blog post (CACHED - short TTL)
   */
  async getComments(postId, page = 1, limit = 10) {
    const cacheKey = `blog_comments_${postId}_${page}_${limit}`;
    
    const cached = blogCache.get(cacheKey);
    if (cached) {
      console.log('✅ Comments cache hit:', postId);
      return { ...cached, cached: true };
    }
    
    try {
      console.log(`📤 Fetching comments for post ${postId}...`);
      
      const response = await clientApi.get(`/blog/posts/${postId}/comments`, {
        params: { page, limit }
      });
      
      if (response.data?.success) {
        const result = {
          success: true,
          comments: response.data.comments || [],
          pagination: response.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 1
          }
        };
        
        // Cache comments for 2 minutes
        blogCache.put(cacheKey, result);
        
        return { ...result, cached: false };
      }
      
      return {
        success: true,
        comments: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        cached: false
      };
    } catch (error) {
      console.error(`❌ Error fetching comments for post ${postId}:`, error);
      return {
        success: false,
        comments: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        error: error.response?.data?.message || error.message,
        cached: false
      };
    }
  }

  /**
   * Clear all blog caches
   */
  clearAllCaches() {
    blogCache.clear();
    console.log('🗑️ All blog caches cleared');
  }
}

// Create and export a singleton instance
export const clientBlogService = new BlogService();

export default clientBlogService;