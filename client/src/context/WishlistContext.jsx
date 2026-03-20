// client/src/context/WishlistContext.jsx - COMPLETE FIXED VERSION
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { clientProductService } from '../services/client/products';
import { LRUCache } from '../dataStructures/LRUCache';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Create local cache for wishlist operations
const wishlistCache = new LRUCache(30);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  
  const pendingRequests = useRef(new Map());
  const initialLoadDone = useRef(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const startTime = performance.now();
    loadWishlist();
    const endTime = performance.now();
    setLoadTime((endTime - startTime).toFixed(0));
  }, []);

  // Deduplicate in-flight requests
  const dedupeRequest = useCallback(async (key, requestFn) => {
    if (pendingRequests.current.has(key)) {
      console.log('🔄 Reusing in-flight wishlist request:', key);
      return pendingRequests.current.get(key);
    }
    
    const promise = requestFn().finally(() => {
      pendingRequests.current.delete(key);
    });
    
    pendingRequests.current.set(key, promise);
    return promise;
  }, []);

  // Load wishlist IDs from localStorage
  const loadWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        // Filter out invalid IDs
        const validIds = parsed.filter(id => id && typeof id === 'string' && id.length > 0);
        setWishlist(validIds);
        setWishlistCount(validIds.length);
        if (validIds.length > 0) {
          fetchWishlistProducts(validIds);
        } else {
          setWishlistItems([]);
          setLoading(false);
        }
      } else {
        setWishlist([]);
        setWishlistCount(0);
        setWishlistItems([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist([]);
      setWishlistCount(0);
      setWishlistItems([]);
      setLoading(false);
    }
  };

  // Fetch full product details for wishlist items with caching
  const fetchWishlistProducts = useCallback(async (wishlistIds) => {
    if (!wishlistIds || wishlistIds.length === 0) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Create cache key from sorted IDs for consistency
    const sortedIds = [...wishlistIds].sort();
    const cacheKey = `wishlist_products_${sortedIds.join('_')}`;
    
    // Check cache first
    const cached = wishlistCache.get(cacheKey);
    if (cached && cached.length > 0) {
      console.log('✅ Wishlist products cache hit');
      setWishlistItems(cached);
      setFromCache(true);
      setLoading(false);
      return;
    }
    
    try {
      console.log(`📤 Fetching ${wishlistIds.length} wishlist products...`);
      const startTime = performance.now();
      
      // Check if service method exists
      if (typeof clientProductService.getProductsByIds !== 'function') {
        console.warn('getProductsByIds not available, fetching individually');
        // Fallback: fetch one by one
        const products = [];
        const invalidIds = [];
        
        for (const id of wishlistIds) {
          try {
            const response = await clientProductService.getProduct(id);
            if (response.success && response.product) {
              products.push(response.product);
            } else {
              invalidIds.push(id);
            }
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            invalidIds.push(id);
          }
        }
        
        // Remove invalid IDs from wishlist
        if (invalidIds.length > 0 && !initialLoadDone.current) {
          const updatedWishlist = wishlistIds.filter(id => !invalidIds.includes(id));
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
          setWishlist(updatedWishlist);
          setWishlistCount(updatedWishlist.length);
          console.log(`Removed ${invalidIds.length} invalid products from wishlist`);
        }
        
        setWishlistItems(products);
        if (products.length > 0) {
          wishlistCache.put(cacheKey, products);
        }
      } else {
        // Use batch fetch
        const response = await dedupeRequest('fetchWishlistProducts', () => 
          clientProductService.getProductsByIds(wishlistIds)
        );
        
        const endTime = performance.now();
        console.log(`⚡ Wishlist products fetched in ${(endTime - startTime).toFixed(0)}ms`);
        
        if (response?.success) {
          const products = response.products || [];
          
          // Check if any products failed to load
          const failedIds = response.failedIds || [];
          if (failedIds.length > 0 && !initialLoadDone.current) {
            const updatedWishlist = wishlistIds.filter(id => !failedIds.includes(id));
            localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
            setWishlist(updatedWishlist);
            setWishlistCount(updatedWishlist.length);
            console.log(`Removed ${failedIds.length} invalid products from wishlist`);
          }
          
          setWishlistItems(products);
          // Cache for 5 minutes
          if (products.length > 0) {
            wishlistCache.put(cacheKey, products);
          }
          setFromCache(false);
        } else {
          setWishlistItems([]);
        }
      }
      
      initialLoadDone.current = true;
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [dedupeRequest]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (product) => {
    const startTime = performance.now();
    const productId = product._id || product.id;
    
    if (!productId) {
      toast.error('Invalid product');
      return false;
    }

    // Check if already in wishlist
    if (wishlist.includes(productId)) {
      toast.info('Product already in wishlist');
      return false;
    }

    const newWishlist = [...wishlist, productId];
    setWishlist(newWishlist);
    setWishlistCount(newWishlist.length);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));

    // Add to wishlistItems if we have the product data
    setWishlistItems(prev => {
      // Check if product already exists in items
      if (prev.some(item => (item._id || item.id) === productId)) {
        return prev;
      }
      return [...prev, product];
    });

    const endTime = performance.now();
    console.log(`⚡ Add to wishlist completed in ${(endTime - startTime).toFixed(0)}ms`);
    
    // Clear related caches
    wishlistCache.clear();
    
    toast.success('Added to wishlist');
    return true;
  }, [wishlist]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback((productId) => {
    const startTime = performance.now();
    
    const newWishlist = wishlist.filter(id => id !== productId);
    setWishlist(newWishlist);
    setWishlistCount(newWishlist.length);
    setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    const endTime = performance.now();
    console.log(`⚡ Remove from wishlist completed in ${(endTime - startTime).toFixed(0)}ms`);
    
    // Clear related caches
    wishlistCache.clear();
    
    toast.success('Removed from wishlist');
    return true;
  }, [wishlist]);

  // Toggle wishlist item
  const toggleWishlist = useCallback((product) => {
    const productId = product._id || product.id;
    
    if (wishlist.includes(productId)) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(product);
    }
  }, [wishlist, addToWishlist, removeFromWishlist]);

  // Check if item is in wishlist (with caching)
  const isInWishlist = useCallback((productId) => {
    const cacheKey = `check_${productId}`;
    const cached = wishlistCache.get(cacheKey);
    
    if (cached !== undefined && cached !== null) {
      return cached;
    }
    
    const result = wishlist.includes(productId);
    wishlistCache.put(cacheKey, result);
    return result;
  }, [wishlist]);

  // Check multiple items at once
  const areInWishlist = useCallback((productIds) => {
    if (!productIds || !productIds.length) return [];
    
    const cacheKey = `check_multiple_${[...productIds].sort().join('_')}`;
    const cached = wishlistCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const results = productIds.map(id => ({
      productId: id,
      inWishlist: wishlist.includes(id)
    }));
    
    wishlistCache.put(cacheKey, results);
    return results;
  }, [wishlist]);

  // Clear wishlist
  const clearWishlist = useCallback(() => {
    const startTime = performance.now();
    
    setWishlist([]);
    setWishlistItems([]);
    setWishlistCount(0);
    localStorage.removeItem('wishlist');
    
    const endTime = performance.now();
    console.log(`⚡ Clear wishlist completed in ${(endTime - startTime).toFixed(0)}ms`);
    
    // Clear cache
    wishlistCache.clear();
    
    toast.success('Wishlist cleared');
  }, []);

  // Refresh wishlist (fetch latest product data)
  const refreshWishlist = useCallback(() => {
    if (wishlist.length > 0) {
      const cacheKey = `wishlist_products_${[...wishlist].sort().join('_')}`;
      wishlistCache.put(cacheKey, null); // Clear specific cache
      fetchWishlistProducts(wishlist);
    } else {
      setWishlistItems([]);
    }
  }, [wishlist, fetchWishlistProducts]);

  // Get wishlist statistics
  const getWishlistStats = useCallback(() => {
    const totalItems = wishlistItems.length;
    const totalValue = wishlistItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
    
    // Count categories
    const categories = {};
    wishlistItems.forEach(item => {
      const cat = item.category;
      if (cat) {
        categories[cat] = (categories[cat] || 0) + 1;
      }
    });
    
    return {
      totalItems,
      totalValue,
      averagePrice,
      categoryCount: Object.keys(categories).length,
      categories: categories,
      mostExpensive: totalItems > 0 ? Math.max(...wishlistItems.map(i => i.price || 0)) : 0,
      leastExpensive: totalItems > 0 ? Math.min(...wishlistItems.map(i => i.price || 0)) : 0
    };
  }, [wishlistItems]);

  const value = {
    wishlist,
    wishlistItems,
    wishlistCount,
    loading,
    loadTime,
    fromCache,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    areInWishlist,
    clearWishlist,
    refreshWishlist,
    getWishlistStats
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};