// client/src/context/WishlistContext.jsx - UPDATED with performance tracking and caching
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
        setWishlist(parsed);
        setWishlistCount(parsed.length);
        fetchWishlistProducts(parsed);
      } else {
        setWishlist([]);
        setWishlistCount(0);
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist([]);
      setWishlistCount(0);
    }
  };

  // Fetch full product details for wishlist items with caching
  const fetchWishlistProducts = useCallback(async (wishlistIds) => {
    if (!wishlistIds || wishlistIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    const cacheKey = `wishlist_products_${wishlistIds.sort().join('_')}`;
    
    // Check cache first
    const cached = wishlistCache.get(cacheKey);
    if (cached) {
      console.log('✅ Wishlist products cache hit');
      setWishlistItems(cached);
      setFromCache(true);
      setLoading(false);
      return;
    }
    
    try {
      console.log(`📤 Fetching ${wishlistIds.length} wishlist products...`);
      const startTime = performance.now();
      
      // Batch fetch using dedupe
      const response = await dedupeRequest('fetchWishlistProducts', () => 
        clientProductService.getProductsByIds(wishlistIds)
      );
      
      const endTime = performance.now();
      console.log(`⚡ Wishlist products fetched in ${(endTime - startTime).toFixed(0)}ms`);
      
      if (response?.success) {
        const products = response.products || [];
        setWishlistItems(products);
        // Cache for 5 minutes
        wishlistCache.put(cacheKey, products);
        setFromCache(false);
      } else {
        // Fallback: fetch one by one
        const productPromises = wishlistIds.map(id => 
          clientProductService.getProduct(id).catch(err => {
            console.error(`Error fetching product ${id}:`, err);
            return null;
          })
        );

        const results = await Promise.all(productPromises);
        const validProducts = results
          .filter(result => result && result.success && result.product)
          .map(result => result.product);

        setWishlistItems(validProducts);
        wishlistCache.put(cacheKey, validProducts);
      }
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
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
    setWishlistItems(prev => [...prev, product]);

    const endTime = performance.now();
    console.log(`⚡ Add to wishlist completed in ${(endTime - startTime).toFixed(0)}ms`);
    
    // Clear cache
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
    
    // Clear cache
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
    
    if (cached !== null) {
      return cached;
    }
    
    const result = wishlist.includes(productId);
    wishlistCache.put(cacheKey, result);
    return result;
  }, [wishlist]);

  // Check multiple items at once
  const areInWishlist = useCallback((productIds) => {
    const cacheKey = `check_multiple_${productIds.sort().join('_')}`;
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
    const cacheKey = `wishlist_products_${wishlist.sort().join('_')}`;
    wishlistCache.put(cacheKey, null); // Clear specific cache
    fetchWishlistProducts(wishlist);
  }, [wishlist, fetchWishlistProducts]);

  // Get wishlist statistics
  const getWishlistStats = useCallback(() => {
    const totalItems = wishlistItems.length;
    const totalValue = wishlistItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
    
    return {
      totalItems,
      totalValue,
      averagePrice,
      categories: [...new Set(wishlistItems.map(item => item.category).filter(Boolean))].length
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