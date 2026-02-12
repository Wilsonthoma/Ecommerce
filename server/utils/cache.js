import Redis from 'ioredis';
import config from '../config/env.js';
import { createCacheKey } from './helpers.js';

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initialize();
  }

  initialize() {
    if (!config.redis?.url && process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Redis not configured, using in-memory cache');
      this.useMemoryCache();
      return;
    }

    try {
      this.client = new Redis(config.redis.url || 'redis://localhost:6379', {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 10000
      });

      this.client.on('connect', () => {
        console.log('🔗 Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis error:', error.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error.message);
      this.useMemoryCache();
    }
  }

  useMemoryCache() {
    this.memoryCache = new Map();
    this.isConnected = false;
    
    // Auto-cleanup for memory cache
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.memoryCache.entries()) {
        if (data.expiry && data.expiry < now) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  async get(key) {
    try {
      if (this.client && this.isConnected) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } else if (this.memoryCache) {
        const cached = this.memoryCache.get(key);
        if (cached && (!cached.expiry || cached.expiry > Date.now())) {
          return cached.value;
        }
        this.memoryCache.delete(key);
        return null;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const data = {
        value,
        expiry: ttl ? Date.now() + (ttl * 1000) : null
      };

      if (this.client && this.isConnected) {
        if (ttl) {
          await this.client.setex(key, ttl, JSON.stringify(value));
        } else {
          await this.client.set(key, JSON.stringify(value));
        }
      } else if (this.memoryCache) {
        this.memoryCache.set(key, data);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.client && this.isConnected) {
        await this.client.del(key);
      } else if (this.memoryCache) {
        this.memoryCache.delete(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      if (this.client && this.isConnected) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
        return keys.length;
      } else if (this.memoryCache) {
        let deleted = 0;
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern.replace('*', ''))) {
            this.memoryCache.delete(key);
            deleted++;
          }
        }
        return deleted;
      }
      return 0;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  async exists(key) {
    try {
      if (this.client && this.isConnected) {
        return await this.client.exists(key);
      } else if (this.memoryCache) {
        const cached = this.memoryCache.get(key);
        return cached && (!cached.expiry || cached.expiry > Date.now()) ? 1 : 0;
      }
      return 0;
    } catch (error) {
      console.error('Cache exists error:', error);
      return 0;
    }
  }

  async incr(key, increment = 1) {
    try {
      if (this.client && this.isConnected) {
        return await this.client.incrby(key, increment);
      } else if (this.memoryCache) {
        const current = await this.get(key);
        const newValue = (current || 0) + increment;
        await this.set(key, newValue);
        return newValue;
      }
      return null;
    } catch (error) {
      console.error('Cache increment error:', error);
      return null;
    }
  }

  async expire(key, ttl) {
    try {
      if (this.client && this.isConnected) {
        await this.client.expire(key, ttl);
      } else if (this.memoryCache) {
        const cached = this.memoryCache.get(key);
        if (cached) {
          cached.expiry = Date.now() + (ttl * 1000);
          this.memoryCache.set(key, cached);
        }
      }
      return true;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  async flush() {
    try {
      if (this.client && this.isConnected) {
        await this.client.flushdb();
      } else if (this.memoryCache) {
        this.memoryCache.clear();
      }
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  async getStats() {
    try {
      if (this.client && this.isConnected) {
        const info = await this.client.info();
        const stats = {
          connected: this.isConnected,
          type: 'redis',
          memory: info.split('\r\n').find(line => line.startsWith('used_memory_human'))?.split(':')[1] || 'N/A',
          uptime: info.split('\r\n').find(line => line.startsWith('uptime_in_seconds'))?.split(':')[1] || 'N/A'
        };
        return stats;
      } else if (this.memoryCache) {
        return {
          connected: false,
          type: 'memory',
          size: this.memoryCache.size,
          uptime: 'N/A'
        };
      }
      return { connected: false, type: 'none' };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { connected: false, type: 'error', error: error.message };
    }
  }

  // Convenience methods for common patterns
  async cacheWithKey(prefix, ...args) {
    const key = createCacheKey(prefix, ...args);
    return {
      get: async (ttl, fetchFn) => {
        const cached = await this.get(key);
        if (cached !== null) {
          return cached;
        }
        
        const data = await fetchFn();
        await this.set(key, data, ttl);
        return data;
      },
      key,
      del: () => this.del(key),
      exists: () => this.exists(key)
    };
  }

  // Cache user-specific data
  async cacheUserData(userId, dataType, fetchFn, ttl = 300) {
    const key = `user:${userId}:${dataType}`;
    const cached = await this.get(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  // Invalidate user cache
  async invalidateUserCache(userId) {
    const pattern = `user:${userId}:*`;
    return await this.delPattern(pattern);
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
export { cacheService as cache };