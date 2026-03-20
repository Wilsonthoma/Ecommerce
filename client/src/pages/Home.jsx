// src/pages/Home.jsx - Update to fetch real categories
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';

import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { clientProductService } from "../services/client/products";
import { normalizeProductData } from "../utils/productNormalizer";
import { 
  categoryHeaderImages, 
  sectionGradients
} from "../utils/constants";
import { fontStyles, animationStyles } from "../styles/globalStyles";

import {
  HeroSection,
  TrustStats,
  ProductSection,
  FlashSaleSection,
  CategorySection,
  TestimonialsSection
} from "../components";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AppContext);
  const { addToCart } = useCart();
  
  // Product states
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [justArrivedProducts, setJustArrivedProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Add this state
  
  // Loading states
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingFlashSale, setLoadingFlashSale] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingJustArrived, setLoadingJustArrived] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true); // Add this
  
  // Algorithm performance states (internal only)
  const [loadTimes, setLoadTimes] = useState({});
  const [cacheStats, setCacheStats] = useState({
    totalRequests: 0,
    cacheHits: 0
  });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 50,
      easing: 'ease-out-cubic',
      anchorPlacement: 'top-bottom',
    });
    
    setTimeout(() => {
      AOS.refresh();
    }, 1000);
  }, []);

  // Refresh AOS on scroll
  useEffect(() => {
    const handleScroll = () => {
      AOS.refresh();
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generic fetch function with performance tracking
  const fetchWithTracking = async (fetchFn, sectionName) => {
    const startTime = performance.now();
    
    try {
      const response = await fetchFn();
      const endTime = performance.now();
      const loadTimeMs = (endTime - startTime).toFixed(0);
      const isCached = response?._cached || false;
      
      setLoadTimes(prev => ({
        ...prev,
        [sectionName]: {
          time: loadTimeMs,
          cached: isCached
        }
      }));
      
      setCacheStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits
      }));
      
      console.log(`⚡ ${sectionName} loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch ${sectionName}:`, error);
      return null;
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await clientProductService.getCategories();
      
      if (response?.success && response.categories) {
        // Process categories for display
        const processedCategories = response.categories.map(cat => ({
          id: cat._id || cat.id,
          slug: cat.slug,
          name: cat.name,
          image: cat.image,
          count: cat.productCount || 0,
          link: `/shop?category=${cat.slug}`
        }));
        setCategories(processedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch featured products
  const fetchFeaturedProducts = async () => {
    setLoadingFeatured(true);
    const response = await fetchWithTracking(
      () => clientProductService.getFeaturedProducts(8),
      'featured'
    );
    
    if (response?.success) {
      const normalizedProducts = (response.products || []).map(p => ({
        ...normalizeProductData(p),
        _cached: response._cached
      }));
      setFeaturedProducts(normalizedProducts);
    }
    setLoadingFeatured(false);
  };

  // Fetch flash sale products
  const fetchFlashSaleProducts = async () => {
    setLoadingFlashSale(true);
    const response = await fetchWithTracking(
      () => clientProductService.getFlashSaleProducts(10),
      'flashSale'
    );
    
    if (response?.success && response.products?.length > 0) {
      const normalizedProducts = (response.products || []).map(p => ({
        ...normalizeProductData(p),
        _cached: response._cached
      }));
      setFlashSaleProducts(normalizedProducts);
    } else {
      const fallbackResponse = await clientProductService.getProducts({ 
        limit: 10,
        sort: '-discountPercentage'
      });
      
      if (fallbackResponse?.success) {
        const normalizedProducts = (fallbackResponse.products || []).map(p => ({
          ...normalizeProductData(p),
          _cached: fallbackResponse._cached
        }));
        setFlashSaleProducts(normalizedProducts);
      }
    }
    setLoadingFlashSale(false);
  };

  // Fetch trending products
  const fetchTrendingProducts = async () => {
    setLoadingTrending(true);
    const response = await fetchWithTracking(
      () => clientProductService.getTrendingProducts(8),
      'trending'
    );
    
    if (response?.success) {
      const normalizedProducts = (response.products || []).map(p => ({
        ...normalizeProductData(p),
        _cached: response._cached
      }));
      setTrendingProducts(normalizedProducts);
    }
    setLoadingTrending(false);
  };

  // Fetch just arrived products
  const fetchJustArrivedProducts = async () => {
    setLoadingJustArrived(true);
    const response = await fetchWithTracking(
      () => clientProductService.getJustArrivedProducts(8),
      'justArrived'
    );
    
    if (response?.success) {
      const normalizedProducts = (response.products || []).map(p => ({
        ...normalizeProductData(p),
        _cached: response._cached
      }));
      setJustArrivedProducts(normalizedProducts);
    }
    setLoadingJustArrived(false);
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchFeaturedProducts(),
        fetchFlashSaleProducts(),
        fetchTrendingProducts(),
        fetchJustArrivedProducts(),
        fetchCategories() // Add categories fetch
      ]);
      
      setTimeout(() => {
        AOS.refresh();
      }, 500);
    };
    
    fetchAllData();
  }, []);

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-r from-yellow-600/5 via-orange-600/5 to-red-600/5 animate-gradient"></div>
      
      <HeroSection sectionGradients={sectionGradients} />
      
      <TrustStats headerImage={categoryHeaderImages.trust} />
      
      <ProductSection 
        title="FEATURED PRODUCTS"
        products={featuredProducts}
        loading={loadingFeatured}
        headerImage={categoryHeaderImages.featured}
        onProductClick={handleProductClick}
        columns={4}
        alt="Featured products"
      />
      
      <FlashSaleSection 
        products={flashSaleProducts}
        loading={loadingFlashSale}
        headerImage={categoryHeaderImages.flashSale}
        onProductClick={handleProductClick}
      />
      
      <ProductSection 
        title="TRENDING NOW"
        products={trendingProducts}
        loading={loadingTrending}
        headerImage={categoryHeaderImages.trending}
        onProductClick={handleProductClick}
        columns={4}
        alt="Trending products"
      />
      
      <ProductSection 
        title="JUST ARRIVED"
        products={justArrivedProducts}
        loading={loadingJustArrived}
        headerImage={categoryHeaderImages.justArrived}
        onProductClick={handleProductClick}
        columns={4}
        alt="Just arrived"
      />
      
      <CategorySection 
        categories={categories}
        loading={loadingCategories}
        headerImage={categoryHeaderImages.categories}
      />
      
      <TestimonialsSection headerImage={categoryHeaderImages.testimonials} />
    </div>
  );
};

export default Home;