// client/src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { clientProductService } from '../services/client/products';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    loadWishlist();
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

  // Fetch full product details for wishlist items
  const fetchWishlistProducts = useCallback(async (wishlistIds) => {
    if (!wishlistIds || wishlistIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to wishlist
  const addToWishlist = useCallback(async (product) => {
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

    toast.success('Added to wishlist');
    return true;
  }, [wishlist]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback((productId) => {
    const newWishlist = wishlist.filter(id => id !== productId);
    setWishlist(newWishlist);
    setWishlistCount(newWishlist.length);
    setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
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

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  // Clear wishlist
  const clearWishlist = useCallback(() => {
    setWishlist([]);
    setWishlistItems([]);
    setWishlistCount(0);
    localStorage.removeItem('wishlist');
    toast.success('Wishlist cleared');
  }, []);

  // Refresh wishlist (fetch latest product data)
  const refreshWishlist = useCallback(() => {
    fetchWishlistProducts(wishlist);
  }, [wishlist, fetchWishlistProducts]);

  const value = {
    wishlist,
    wishlistItems,
    wishlistCount,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};