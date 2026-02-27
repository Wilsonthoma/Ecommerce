// src/pages/Home.jsx - UPDATED with navbar header removed
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { AppContext } from "../context/AppContext";
import { useCart } from "../context/CartContext";
import { clientProductService } from "../services/client/products";
import { toast } from "react-toastify";
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiMapPin,
  FiArrowRight,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import Typewriter from 'typewriter-effect';

// Category header images
const categoryHeaderImages = {
  trust: "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1600",
  featured: "https://images.pexels.com/photos/5709675/pexels-photo-5709675.jpeg?auto=compress&cs=tinysrgb&w=1600",
  categories: "https://images.pexels.com/photos/4498127/pexels-photo-4498127.jpeg?auto=compress&cs=tinysrgb&w=1600",
  testimonials: "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1600",
  flashSale: "https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=1600",
  trending: "https://images.pexels.com/photos/4210858/pexels-photo-4210858.jpeg?auto=compress&cs=tinysrgb&w=1600",
  justArrived: "https://images.pexels.com/photos/4210863/pexels-photo-4210863.jpeg?auto=compress&cs=tinysrgb&w=1600"
};

// Category images
const categoryImages = {
  electronics: "https://images.pexels.com/photos/5083408/pexels-photo-5083408.jpeg?auto=compress&cs=tinysrgb&w=600",
  smartphones: "https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=600",
  laptops: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
  tablets: "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600",
  cameras: "https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=600",
  monitors: "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=600",
  gaming: "https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=600",
  audio: "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=600",
  headphones: "https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=600",
  speakers: "https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=600",
  clothing: "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=600",
  footwear: "https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg?auto=compress&cs=tinysrgb&w=600",
  jewelry: "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600",
  watches: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600",
  wearables: "https://images.pexels.com/photos/4370372/pexels-photo-4370372.jpeg?auto=compress&cs=tinysrgb&w=600",
  home: "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=600",
  furniture: "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=600",
  kitchen: "https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=600",
  decor: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
  beauty: "https://images.pexels.com/photos/3738083/pexels-photo-3738083.jpeg?auto=compress&cs=tinysrgb&w=600",
  skincare: "https://images.pexels.com/photos/3998410/pexels-photo-3998410.jpeg?auto=compress&cs=tinysrgb&w=600",
  makeup: "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=600",
  haircare: "https://images.pexels.com/photos/3998410/pexels-photo-3998410.jpeg?auto=compress&cs=tinysrgb&w=600",
  accessories: "https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=600",
  bags: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600",
  sunglasses: "https://images.pexels.com/photos/164661/pexels-photo-164661.jpeg?auto=compress&cs=tinysrgb&w=600",
  fabric: "https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&cs=tinysrgb&w=600",
  food: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600",
  powerbanks: "https://images.pexels.com/photos/8216516/pexels-photo-8216516.jpeg?auto=compress&cs=tinysrgb&w=600",
  keyboards: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=600",
  mice: "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=600"
};

// Font configuration with Yellow-Orange gradient theme - REMOVED header styles
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  /* Yellow-Orange Gradient Border for all section titles */
  .section-title-wrapper {
    position: relative;
    display: inline-block;
    padding: 2px;
    border-radius: 12px;
    background: linear-gradient(135deg, #F59E0B, #EF4444, #F59E0B);
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-weight: 800;
    font-size: 2.8rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin: 0;
    padding: 0.5rem 2rem;
    background: #111827;
    border-radius: 10px;
    display: inline-block;
  }
  
  /* Responsive title sizes */
  @media (max-width: 768px) {
    .section-title {
      font-size: 2rem;
      padding: 0.4rem 1.5rem;
    }
  }
  
  @media (max-width: 480px) {
    .section-title {
      font-size: 1.5rem;
      padding: 0.3rem 1rem;
    }
  }
  
  .section-subtitle {
    font-weight: 500;
    font-size: 1.2rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .section-header-container {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  /* Yellow-Orange gradient for counters */
  .stat-number {
    font-weight: 700;
    font-size: 3.5rem;
    line-height: 1;
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  @media (max-width: 768px) {
    .stat-number {
      font-size: 2.5rem;
    }
  }
  
  .stat-label {
    font-weight: 500;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9CA3AF;
  }
  
  .badge-flash {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
  }
  
  .badge-trending {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
  }
  
  .badge-new {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    box-shadow: 0 2px 10px rgba(245, 158, 11, 0.3);
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  /* Typewriter with increased opacity - NO background color */
  .typewriter-bold {
    font-weight: 800;
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.7), 0 0 60px rgba(239, 68, 68, 0.4);
    letter-spacing: -0.02em;
    color: #FCD34D;
    background: transparent; /* Ensure no background */
  }
  
  /* Yellow-Orange gradient for other text elements */
  .text-gradient-yellow-orange {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Button with yellow-orange gradient */
  .btn-yellow-orange {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    transition: all 0.3s ease;
  }
  
  .btn-yellow-orange:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.5);
  }
`;

// Animation styles - REMOVED moving gradient effects
const animationStyles = `
  @keyframes wave {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    20% {
      opacity: 1;
      transform: translateY(0);
    }
    80% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  
  @keyframes snake {
    0% {
      clip-path: inset(0 100% 0 0);
    }
    50% {
      clip-path: inset(0 0 0 0);
    }
    100% {
      clip-path: inset(0 0 0 100%);
    }
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Wave effect for AOS */
  [data-aos="wave-up"] {
    opacity: 0;
    transform: translateY(30px);
    transition-property: transform, opacity;
  }
  
  [data-aos="wave-up"].aos-animate {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Snake entrance effect */
  .snake-entrance {
    position: relative;
    overflow: hidden;
  }
  
  .snake-entrance::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2), transparent);
    animation: snake 1.5s ease-in-out;
    pointer-events: none;
    z-index: 10;
  }
`;

// Beautiful gradient combinations for each section - replaced with yellow-orange
const sectionGradients = {
  hero: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  trust: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  featured: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  categories: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  testimonials: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  flashSale: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  trending: "from-yellow-600/20 via-orange-600/20 to-red-600/20",
  justArrived: "from-yellow-600/20 via-orange-600/20 to-red-600/20"
};

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Top Bar Component - REMOVED
// const TopBar = () => { ... }; (Deleted)

// Counter Component with Yellow-Orange gradient
const Counter = ({ end, label, duration = 4, suffix = "+" }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
    delay: 100
  });

  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView) {
      setHasAnimated(true);
    } else {
      setHasAnimated(false);
    }
  }, [inView]);

  return (
    <div ref={ref} className="text-center snake-entrance">
      <div className="stat-number">
        {hasAnimated ? (
          <CountUp 
            end={end} 
            duration={duration} 
            delay={0.3}
            separator=","
            suffix={suffix}
            redraw={true}
          />
        ) : (
          `0${suffix}`
        )}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// ========== CRITICAL FIX: PROPER NORMALIZATION FUNCTION ==========
/**
 * Normalizes product data from API to ensure all fields are present
 * Preserves ALL original fields and adds fallbacks where needed
 */
const normalizeProductData = (product) => {
  if (!product) return null;
  
  console.log('🔄 Normalizing product:', product.name || 'Unnamed', {
    originalQuantity: product.quantity,
    originalStock: product.stock,
    originalPrice: product.price
  });
  
  // CRITICAL: Preserve the original _id
  const productId = product._id || product.id;
  
  // CRITICAL: Get stock/quantity from ANY available field
  // Check all possible stock fields in order of priority
  let stockValue = 0;
  if (product.quantity !== undefined && product.quantity !== null) {
    stockValue = Number(product.quantity);
  } else if (product.stock !== undefined && product.stock !== null) {
    stockValue = Number(product.stock);
  } else if (product.inStock !== undefined) {
    // Handle boolean inStock field - convert to 1/0
    stockValue = product.inStock === true ? 10 : 0;
  } else if (product.available !== undefined) {
    // Handle boolean available field - convert to 1/0
    stockValue = product.available === true ? 10 : 0;
  } else {
    // Default fallback - assume in stock
    stockValue = 10;
  }
  
  // Ensure stockValue is a valid number
  if (isNaN(stockValue) || stockValue < 0) {
    stockValue = 0;
  }
  
  // Process images array
  let processedImages = [];
  if (product.images && Array.isArray(product.images)) {
    processedImages = product.images.map(img => {
      if (typeof img === 'string') {
        return img.startsWith('http') ? img : 
               img.startsWith('/uploads') ? `${API_URL}${img}` : 
               `${API_URL}/uploads/products/${img}`;
      } else if (img && typeof img === 'object' && img.url) {
        const url = img.url.startsWith('http') ? img.url :
                   img.url.startsWith('/uploads') ? `${API_URL}${img.url}` :
                   `${API_URL}/uploads/products/${img.url}`;
        return {
          ...img,
          url,
          isPrimary: img.isPrimary || false
        };
      }
      return null;
    }).filter(Boolean);
  }
  
  // Get primary image
  let primaryImage = null;
  if (product.primaryImage) {
    primaryImage = product.primaryImage.startsWith('http') ? product.primaryImage :
                  product.primaryImage.startsWith('/uploads') ? `${API_URL}${product.primaryImage}` :
                  `${API_URL}/uploads/products/${product.primaryImage}`;
  } else if (product.image) {
    primaryImage = product.image.startsWith('http') ? product.image :
                  product.image.startsWith('/uploads') ? `${API_URL}${product.image}` :
                  `${API_URL}/uploads/products/${product.image}`;
  } else if (processedImages.length > 0) {
    const primaryImg = processedImages.find(img => img.isPrimary) || processedImages[0];
    primaryImage = typeof primaryImg === 'string' ? primaryImg : primaryImg.url;
  }
  
  // Calculate discount percentage
  let discountPercentage = 0;
  if (product.comparePrice && product.comparePrice > product.price) {
    discountPercentage = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  } else if (product.discountPercentage) {
    discountPercentage = product.discountPercentage;
  }
  
  // Build the normalized product object
  const normalized = {
    // IDs - preserve both
    _id: productId,
    id: productId,
    
    // Core fields
    name: product.name || 'Unnamed Product',
    description: product.description || '',
    category: product.category || '',
    subcategory: product.subcategory || '',
    
    // CRITICAL FIX: Stock/quantity fields - ensure both are present
    quantity: stockValue,
    stock: stockValue,
    
    // Price fields
    price: Number(product.price) || 0,
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    discountPercentage,
    cost: product.cost ? Number(product.cost) : null,
    
    // Images
    images: processedImages,
    image: primaryImage,
    primaryImage,
    
    // Flags
    featured: product.featured || false,
    isTrending: product.isTrending || product.trending || false,
    isFlashSale: product.isFlashSale || product.flashSale || false,
    isJustArrived: product.isJustArrived || product.new || false,
    onSale: product.onSale || false,
    freeShipping: product.freeShipping || false,
    
    // Ratings
    rating: Number(product.rating) || 0,
    reviewsCount: Number(product.reviewsCount) || Number(product.reviews) || 0,
    reviews: product.reviews || [],
    
    // Shipping
    weight: product.weight || 0,
    weightUnit: product.weightUnit || 'kg',
    estimatedDeliveryMin: product.estimatedDeliveryMin || 3,
    estimatedDeliveryMax: product.estimatedDeliveryMax || 7,
    requiresShipping: product.requiresShipping !== false,
    
    // Vendor
    vendor: product.vendor || null,
    vendorId: product.vendorId || product.vendor?._id || null,
    
    // Metadata
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
    slug: product.slug || productId,
    sku: product.sku || '',
    tags: product.tags || [],
    
    // Flash sale specific
    flashSaleEndDate: product.flashSaleEndDate || null,
    
    // Preserve any other fields
    ...product
  };
  
  console.log('✅ Normalized product:', normalized.name, {
    quantity: normalized.quantity,
    stock: normalized.stock,
    price: normalized.price,
    featured: normalized.featured,
    isInStock: normalized.quantity > 0
  });
  
  return normalized;
};
// ========== END OF FIX ==========

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AppContext);
  const { addToCart } = useCart();
  
  // Product states
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [justArrivedProducts, setJustArrivedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Loading states
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingFlashSale, setLoadingFlashSale] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingJustArrived, setLoadingJustArrived] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const categoryRef = useRef(null);
  const featuredRef = useRef(null);
  const videoRef = useRef(null);

  // Typing effect phrases with yellow-orange theme
  const typingPhrases = [
    'Premium Audio Experience',
    'Wireless Freedom',
    'Crystal Clear Sound',
    'Adaptive Noise Cancellation',
    '40H Battery Life',
    'Studio Quality'
  ];

  // Initialize AOS with wave effect
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

  // Add snake entrance effect when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('snake-entrance');
          setTimeout(() => {
            entry.target.classList.remove('snake-entrance');
          }, 1500);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.section-header-container').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Fetch featured products
  const fetchFeaturedProducts = async () => {
    try {
      setLoadingFeatured(true);
      const response = await clientProductService.getFeaturedProducts(8);
      
      if (response.success) {
        console.log('✅ Featured products fetched:', response.products?.length || 0);
        const normalizedProducts = (response.products || []).map(normalizeProductData);
        setFeaturedProducts(normalizedProducts);
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    } finally {
      setLoadingFeatured(false);
    }
  };

  // Fetch latest products
  const fetchLatestProducts = async () => {
    try {
      setLoadingLatest(true);
      const response = await clientProductService.getProducts({ 
        limit: 8, 
        sort: '-createdAt' 
      });
      
      if (response.success) {
        console.log('✅ Latest products fetched:', response.products?.length || 0);
        const normalizedProducts = (response.products || []).map(normalizeProductData);
        setLatestProducts(normalizedProducts);
      }
    } catch (error) {
      console.error("Failed to fetch latest products:", error);
    } finally {
      setLoadingLatest(false);
    }
  };

  // Fetch flash sale products
  const fetchFlashSaleProducts = async () => {
    try {
      setLoadingFlashSale(true);
      const response = await clientProductService.getFlashSaleProducts(10);
      
      if (response.success && response.products && response.products.length > 0) {
        console.log('✅ Flash sale products fetched:', response.products.length);
        const normalizedProducts = (response.products || []).map(normalizeProductData);
        setFlashSaleProducts(normalizedProducts);
      } else {
        // Fallback to products with discount
        console.log('⚠️ No flash sale products, fetching discounted products...');
        const fallbackResponse = await clientProductService.getProducts({ 
          limit: 10,
          sort: '-discountPercentage'
        });
        
        if (fallbackResponse.success) {
          const normalizedProducts = (fallbackResponse.products || []).map(normalizeProductData);
          setFlashSaleProducts(normalizedProducts);
        } else {
          // Use latest products as last resort
          const latestResponse = await clientProductService.getProducts({ 
            limit: 10,
            sort: '-createdAt'
          });
          if (latestResponse.success) {
            const normalizedProducts = (latestResponse.products || []).map(normalizeProductData);
            setFlashSaleProducts(normalizedProducts);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch flash sale products:", error);
      setFlashSaleProducts([]);
    } finally {
      setLoadingFlashSale(false);
    }
  };

  // Fetch trending products
  const fetchTrendingProducts = async () => {
    try {
      setLoadingTrending(true);
      const response = await clientProductService.getTrendingProducts(8);
      
      if (response.success) {
        console.log('✅ Trending products fetched:', response.products?.length || 0);
        const normalizedProducts = (response.products || []).map(normalizeProductData);
        setTrendingProducts(normalizedProducts);
      }
    } catch (error) {
      console.error("Failed to fetch trending products:", error);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Fetch just arrived products
  const fetchJustArrivedProducts = async () => {
    try {
      setLoadingJustArrived(true);
      const response = await clientProductService.getJustArrivedProducts(8);
      
      if (response.success) {
        console.log('✅ Just arrived products fetched:', response.products?.length || 0);
        const normalizedProducts = (response.products || []).map(normalizeProductData);
        setJustArrivedProducts(normalizedProducts);
      }
    } catch (error) {
      console.error("Failed to fetch just arrived products:", error);
    } finally {
      setLoadingJustArrived(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await clientProductService.getCategories();
      
      if (response.success) {
        console.log('✅ Categories fetched:', response.categories?.length || 0);
        setCategories(response.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchFeaturedProducts(),
        fetchLatestProducts(),
        fetchFlashSaleProducts(),
        fetchTrendingProducts(),
        fetchJustArrivedProducts(),
        fetchCategories()
      ]);
      
      setTimeout(() => {
        AOS.refresh();
      }, 500);
    };
    
    fetchAllData();
  }, []);

  // VIDEO AUTOPLAY
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    
    const playVideo = async () => {
      try {
        await video.play();
        setVideoPlaying(true);
        setVideoError(false);
      } catch (err) {
        console.log("❌ Video autoplay failed:", err);
        setVideoPlaying(false);
        setVideoError(true);
      }
    };

    playVideo();

    const handleError = () => {
      setVideoError(true);
      setVideoPlaying(false);
    };

    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('error', handleError);
      video.pause();
    };
  }, []);

  const toggleVideoPlay = () => {
    const video = videoRef.current;
    if (!video || videoError) return;

    if (videoPlaying) {
      video.pause();
      setVideoPlaying(false);
    } else {
      video.play()
        .then(() => setVideoPlaying(true))
        .catch(err => console.log("Video play failed:", err));
    }
  };

  const scrollCategories = (dir) => {
    if (categoryRef.current) {
      const scrollAmount = dir === "left" ? -400 : 400;
      categoryRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  const scrollFeatured = (dir) => {
    if (featuredRef.current) {
      const scrollAmount = dir === "left" ? -300 : 300;
      featuredRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const handleProductClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  // Get category image based on category name
  const getCategoryImage = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    
    if (name.includes('smartphone') || name.includes('phone') || name.includes('mobile')) {
      return categoryImages.smartphones;
    }
    if (name.includes('laptop') || name.includes('computer') || name.includes('notebook')) {
      return categoryImages.laptops;
    }
    if (name.includes('tablet') || name.includes('ipad')) {
      return categoryImages.tablets;
    }
    if (name.includes('camera') || name.includes('photo') || name.includes('video')) {
      return categoryImages.cameras;
    }
    if (name.includes('monitor') || name.includes('display') || name.includes('screen')) {
      return categoryImages.monitors;
    }
    if (name.includes('gaming') || name.includes('game') || name.includes('console')) {
      return categoryImages.gaming;
    }
    if (name.includes('electronics') || name.includes('electronic')) {
      return categoryImages.electronics;
    }
    if (name.includes('headphone') || name.includes('earphone') || name.includes('headset') || name.includes('audio')) {
      return categoryImages.headphones;
    }
    if (name.includes('speaker') || name.includes('sound')) {
      return categoryImages.speakers;
    }
    if (name.includes('clothing') || name.includes('apparel') || name.includes('cloth')) {
      return categoryImages.clothing;
    }
    if (name.includes('footwear') || name.includes('shoe') || name.includes('sneaker') || name.includes('boot')) {
      return categoryImages.footwear;
    }
    if (name.includes('jewelry') || name.includes('jewellery') || name.includes('necklace') || name.includes('ring')) {
      return categoryImages.jewelry;
    }
    if (name.includes('watch') || name.includes('wearable')) {
      return categoryImages.watches;
    }
    if (name.includes('home') || name.includes('house')) {
      return categoryImages.home;
    }
    if (name.includes('furniture') || name.includes('chair') || name.includes('table') || name.includes('sofa')) {
      return categoryImages.furniture;
    }
    if (name.includes('kitchen') || name.includes('cook')) {
      return categoryImages.kitchen;
    }
    if (name.includes('decor') || name.includes('decoration')) {
      return categoryImages.decor;
    }
    if (name.includes('beauty') || name.includes('cosmetic')) {
      return categoryImages.beauty;
    }
    if (name.includes('skincare') || name.includes('skin')) {
      return categoryImages.skincare;
    }
    if (name.includes('makeup') || name.includes('make-up')) {
      return categoryImages.makeup;
    }
    if (name.includes('hair') || name.includes('trimmer') || name.includes('clipper')) {
      return categoryImages.haircare;
    }
    if (name.includes('accessory') || name.includes('accessories')) {
      return categoryImages.accessories;
    }
    if (name.includes('bag') || name.includes('backpack') || name.includes('purse')) {
      return categoryImages.bags;
    }
    if (name.includes('sunglass') || name.includes('eyewear')) {
      return categoryImages.sunglasses;
    }
    if (name.includes('keyboard') || name.includes('type')) {
      return categoryImages.keyboards;
    }
    if (name.includes('mouse') || name.includes('pointer')) {
      return categoryImages.mice;
    }
    if (name.includes('fabric') || name.includes('textile')) {
      return categoryImages.fabric;
    }
    if (name.includes('food') || name.includes('grocery')) {
      return categoryImages.food;
    }
    if (name.includes('power') || name.includes('battery') || name.includes('bank')) {
      return categoryImages.powerbanks;
    }
    
    return categoryImages.electronics;
  };

  // Build categories
  const displayCategories = categories.map(cat => ({
    id: cat._id || cat.id || cat.name,
    slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'),
    name: cat.name,
    image: getCategoryImage(cat.name),
    count: cat.count ? `${cat.count}+` : (cat.productCount ? `${cat.productCount}+` : "0"),
    link: `/shop?category=${cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}`
  }));

  // Trust stats
  const trustStats = [
    { number: 300, label: "HAPPY CLIENTS", duration: 5, suffix: "+" },
    { number: 25, label: "COUNTIES SERVED", duration: 4.5, suffix: "+" },
    { number: 365, label: "DAYS WARRANTY", duration: 5, suffix: "" },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Unbox Therapy",
      text: "OpenArc is the ultimate gym companion, from intense workouts to training sessions.",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5
    },
    {
      name: "Fisayo Fosudo",
      text: "Vocals and the instrumentals were very outstanding. Here I was impressed.",
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 5
    },
    {
      name: "Chouaib Reviews",
      text: "The sound in music is impressive and the bass is very good and rich.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Inject styles */}
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      {/* Animated gradient overlay - changed to yellow-orange */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-r from-yellow-600/5 via-orange-600/5 to-red-600/5 animate-gradient"></div>
      
      {/* Top Bar - REMOVED */}

      {/* HERO SECTION */}
      <div 
        className="relative h-screen min-h-[800px] overflow-hidden"
        data-aos="fade-in"
        data-aos-duration="1500"
        data-aos-delay="200"
        data-aos-once="false"
      >
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            className="object-cover w-full h-full opacity-80"
            poster="https://images.pexels.com/photos/5083408/pexels-photo-5083408.jpeg?auto=compress&cs=tinysrgb&w=1600"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
          </video>
          
          <div className={`absolute inset-0 bg-gradient-to-r ${sectionGradients.hero} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

        {!videoError && (
          <button
            onClick={toggleVideoPlay}
            className="absolute z-20 p-4 text-white transition-all border rounded-full top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20 hover:border-white/40"
          >
            {videoPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
          </button>
        )}

        <div className="relative z-10 flex items-center h-full">
          <div className="w-full px-6 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
              data-aos-delay="400"
              data-aos-once="false"
            >
              <h1 className="text-6xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
                SpaceBuds
                <span className="block text-5xl text-gray-300 md:text-6xl lg:text-7xl">Pro</span>
              </h1>
              
              {/* Typewriter with increased opacity - NO BACKGROUND COLOR */}
              <div className="h-20 mt-4 text-2xl font-bold md:text-3xl lg:text-4xl typewriter-bold">
                <Typewriter
                  options={{
                    strings: typingPhrases,
                    autoStart: true,
                    loop: true,
                    delay: 120,
                    deleteSpeed: 70,
                    pauseFor: 2000,
                    cursor: '|',
                    wrapperClassName: 'font-extrabold',
                    cursorClassName: 'text-yellow-500 text-4xl'
                  }}
                />
              </div>
              
              <p className="mt-4 text-lg text-gray-400 md:text-xl">
                TWS Earphones with Immersive Sound
              </p>
              
              <div 
                className="flex flex-wrap gap-6 mt-8"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="600"
                data-aos-once="false"
              >
                <button 
                  onClick={() => navigate('/product/spacebuds-pro')}
                  className="px-8 py-3 text-sm font-medium text-white transition-all border rounded-full border-white/20 hover:bg-white/10 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                >
                  EXPLORE NOW
                </button>
                <button 
                  onClick={() => navigate('/shop')}
                  className="px-8 py-3 text-sm font-medium text-white transition-all border rounded-full border-white/20 hover:bg-white/10 hover:border-yellow-500/50"
                >
                  SHOP ALL
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -translate-x-1/2 left-1/2 bottom-8 animate-bounce">
          <div className="flex justify-center w-10 h-16 border-2 rounded-full border-white/20">
            <div className="w-1 h-3 mt-2 rounded-full bg-gradient-to-b from-yellow-500 to-orange-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* TRUST STATS SECTION */}
      <section className="py-16 bg-black border-b border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
            data-aos-once="false"
          >
            <img 
              src={categoryHeaderImages.trust}
              alt="Trusted by hundreds"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
            data-aos-once="false"
          >
            <div className="section-title-wrapper">
              <h2 className="section-title">TRUSTED BY HUNDREDS</h2>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-16 md:gap-24">
            {trustStats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay={400 + (index * 200)}
                data-aos-once="false"
              >
                <Counter 
                  end={stat.number} 
                  label={stat.label} 
                  duration={stat.duration}
                  suffix={stat.suffix}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="py-20 bg-black">
        <div className="px-6 mx-auto max-w-7xl">
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
            data-aos-once="false"
          >
            <img 
              src={categoryHeaderImages.featured}
              alt="Featured products"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
              onError={(e) => {
                e.target.src = "https://images.pexels.com/photos/5083408/pexels-photo-5083408.jpeg?auto=compress&cs=tinysrgb&w=1600";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
            data-aos-once="false"
          >
            <div className="section-title-wrapper">
              <h2 className="section-title">FEATURED PRODUCTS</h2>
            </div>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-gray-900 rounded-lg h-64 sm:h-72 md:h-80 animate-pulse"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <div 
                  key={product._id || product.id || index} 
                  className="cursor-pointer group"
                  onClick={() => handleProductClick(product._id || product.id)}
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  data-aos-delay={200 + (index * 100)}
                  data-aos-once="false"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              No featured products available
            </div>
          )}
        </div>
      </section>

      {/* FLASH SALE SECTION */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
            data-aos-once="false"
          >
            <img 
              src={categoryHeaderImages.flashSale}
              alt="Flash sale"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
            data-aos-once="false"
          >
            <div className="section-title-wrapper">
              <h2 className="section-title">FLASH SALE</h2>
            </div>
          </div>

          <div 
            className="flex flex-col items-center justify-between gap-8 mb-12 md:flex-row"
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-delay="400"
            data-aos-once="false"
          >
            <p className="text-2xl font-semibold text-gray-300">Limited time offers ending soon!</p>
            <button 
              onClick={() => navigate('/shop?onSale=true')}
              className="px-8 py-3 text-sm font-medium text-white transition-colors border rounded-full border-white/20 hover:bg-white/10 hover:border-yellow-500/50"
            >
              SHOP NOW
            </button>
          </div>

          <div className="relative">
            <div 
              ref={featuredRef} 
              className="flex gap-3 sm:gap-4 pb-4 overflow-x-auto scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {loadingFlashSale ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 sm:w-40 md:w-48 bg-gray-900 rounded-lg h-64 sm:h-72 md:h-80 animate-pulse"></div>
                ))
              ) : flashSaleProducts.length > 0 ? (
                flashSaleProducts.slice(0, 8).map((product, index) => (
                  <div 
                    key={product._id || product.id || index} 
                    className="flex-shrink-0 w-36 sm:w-40 md:w-48 cursor-pointer group"
                    onClick={() => handleProductClick(product._id || product.id)}
                    data-aos="fade-left"
                    data-aos-duration="1000"
                    data-aos-delay={300 + (index * 100)}
                    data-aos-once="false"
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="w-full py-12 text-center text-gray-400">
                  No flash sale products available
                </div>
              )}
            </div>
            
            {flashSaleProducts.length > 4 && (
              <>
                <button 
                  onClick={() => scrollFeatured("left")}
                  className="absolute left-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group"
                >
                  <FiChevronLeft className="w-6 h-6 text-white transition-colors group-hover:text-yellow-500" />
                </button>
                <button 
                  onClick={() => scrollFeatured("right")}
                  className="absolute right-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group"
                >
                  <FiChevronRight className="w-6 h-6 text-white transition-colors group-hover:text-yellow-500" />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS SECTION */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
            data-aos-once="false"
          >
            <img 
              src={categoryHeaderImages.trending}
              alt="Trending products"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
            data-aos-once="false"
          >
            <div className="section-title-wrapper">
              <h2 className="section-title">TRENDING NOW</h2>
            </div>
          </div>

          {loadingTrending ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-gray-900 rounded-lg h-64 sm:h-72 md:h-80 animate-pulse"></div>
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
              {trendingProducts.slice(0, 4).map((product, index) => (
                <div 
                  key={product._id || product.id || index} 
                  className="cursor-pointer group"
                  onClick={() => handleProductClick(product._id || product.id)}
                  data-aos="fade-right"
                  data-aos-duration="1000"
                  data-aos-delay={200 + (index * 100)}
                  data-aos-once="false"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              No trending products available
            </div>
          )}
        </div>
      </section>

      {/* JUST ARRIVED SECTION */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
            data-aos-once="false"
          >
            <img 
              src={categoryHeaderImages.justArrived}
              alt="Just arrived"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
            data-aos-once="false"
          >
            <div className="section-title-wrapper">
              <h2 className="section-title">JUST ARRIVED</h2>
            </div>
          </div>

          {loadingJustArrived ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-gray-900 rounded-lg h-64 sm:h-72 md:h-80 animate-pulse"></div>
              ))}
            </div>
          ) : justArrivedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
              {justArrivedProducts.slice(0, 4).map((product, index) => (
                <div 
                  key={product._id || product.id || index} 
                  className="cursor-pointer group"
                  onClick={() => handleProductClick(product._id || product.id)}
                  data-aos="fade-left"
                  data-aos-duration="1000"
                  data-aos-delay={200 + (index * 100)}
                  data-aos-once="false"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              No new arrivals available
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
            data-aos-once="false"
          >
            <img 
              src={categoryHeaderImages.categories}
              alt="Shop by category"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
            data-aos-once="false"
          >
            <div className="section-title-wrapper">
              <h2 className="section-title">SHOP BY CATEGORY</h2>
            </div>
          </div>
          
          {loadingCategories ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-gray-900 rounded-lg h-64 sm:h-72 md:h-80 animate-pulse"></div>
              ))}
            </div>
          ) : displayCategories.length > 0 ? (
            <div className="relative">
              <div 
                ref={categoryRef} 
                className="flex gap-4 sm:gap-6 pb-8 overflow-x-auto scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
              >
                {displayCategories.map((category, index) => (
                  <div 
                    key={category.id || index} 
                    className="flex-shrink-0 cursor-pointer w-48 sm:w-56 md:w-64 lg:w-72 group"
                    onClick={() => navigate(category.link)}
                    onMouseEnter={() => setHoveredCategory(index)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    data-aos="fade-up"
                    data-aos-duration="1000"
                    data-aos-delay={200 + (index * 100)}
                    data-aos-once="false"
                  >
                    <div className="relative mb-3 overflow-hidden bg-gray-900 rounded-lg aspect-square">
                      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 group-hover:opacity-30 blur-xl"></div>
                      
                      <img 
                        src={category.image}
                        alt={category.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = categoryImages.electronics;
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white">{category.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-300">{category.count} Products</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {displayCategories.length > 3 && (
                <>
                  <button 
                    onClick={() => scrollCategories("left")}
                    className="absolute left-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group"
                  >
                    <FiChevronLeft className="w-6 h-6 text-white transition-colors group-hover:text-yellow-500" />
                  </button>
                  <button 
                    onClick={() => scrollCategories("right")}
                    className="absolute right-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group"
                  >
                    <FiChevronRight className="w-6 h-6 text-white transition-colors group-hover:text-yellow-500" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              No categories available
            </div>
          )}
          
          {displayCategories.length > 0 && (
            <div 
              className="mt-8 text-center"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="600"
              data-aos-once="false"
            >
              <button 
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all border border-gray-700 rounded-full hover:bg-white/10 hover:border-yellow-500/50"
              >
                VIEW ALL CATEGORIES
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-black border-t border-gray-800">
        <div className="px-6 mx-auto max-w-7xl">
          <div 
            className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
            data-aos="zoom-in"
            data-aos-duration="1200"
            data-aos-delay="200"
            data-aos-once="false"
          >
            <img 
              src={categoryHeaderImages.testimonials}
              alt="What people say about us"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div 
            className="section-header-container"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
            data-aos-once="false"
          >
            <div className="section-title-wrapper">
              <h2 className="section-title">HEAR WHAT THEY ARE SAYING</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="p-4 sm:p-6 transition-all duration-500 rounded-lg bg-gray-900/50 hover:scale-105 hover:bg-gray-800/50"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay={300 + (index * 150)}
                data-aos-once="false"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-white text-sm sm:text-base">{testimonial.name}</div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        i < testimonial.rating ? 
                          <FaStar key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" /> :
                          <FaRegStar key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-gray-400">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;