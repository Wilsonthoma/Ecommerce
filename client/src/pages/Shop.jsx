// src/pages/Shop.jsx - UPDATED with LoadingSpinner, proper responsive spacing (algorithm tracking hidden from UI)
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { clientProductService } from '../services/client/products';
import ProductCard from '../components/ProductCard';
import LoadingSpinner, { CardSkeleton } from '../components/LoadingSpinner';
import { 
  FiFilter, 
  FiX, 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight,
  FiStar,
  FiTrendingUp,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiGrid,
  FiList,
  FiArrowRight,
  FiMapPin,
  FiChevronDown,
  FiShoppingCart
} from 'react-icons/fi';
import { 
  BsGridFill, 
  BsListUl,
  BsLightningFill,
  BsArrowRight
} from 'react-icons/bs';
import { useCart } from '../context/CartContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Font styles - UPDATED with yellow-orange theme and Dashboard-style heading
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  /* Section title styling from Dashboard (matching Cart page) */
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
    font-size: 2rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin: 0;
    padding: 0.5rem 2rem;
    background: #111827;
    border-radius: 10px;
    display: inline-block;
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 1.5rem;
      padding: 0.4rem 1.5rem;
    }
  }
  
  .section-header {
    font-weight: 700;
    font-size: clamp(1rem, 2.5vw, 1.4rem);
    letter-spacing: -0.02em;
    background: linear-gradient(to right, #fff, #e5e5e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .glow-text {
    text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
  }
  
  .glow-text:hover {
    text-shadow: 0 0 50px rgba(245, 158, 11, 0.8);
  }
  
  .badge-flash {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);
  }
  
  .badge-trending {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);
  }
  
  .badge-new {
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    font-size: 0.6rem;
    box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);
  }
  
  /* Tiny Buttons */
  .btn-primary {
    background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
    color: white;
    font-weight: 500;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 2px 5px rgba(245, 158, 11, 0.3);
    font-size: 0.65rem;
    letter-spacing: 0.02em;
  }
  
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);
  }
  
  .btn-secondary {
    background: transparent;
    color: white;
    font-weight: 500;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.65rem;
  }
  
  .btn-secondary:hover {
    border-color: #F59E0B;
    background: rgba(245, 158, 11, 0.1);
  }
  
  /* COMPACT TEXT SIZES */
  .text-xs {
    font-size: 0.65rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .text-base {
    font-size: 0.9rem;
  }
  
  .text-lg {
    font-size: 1rem;
  }
  
  .text-xl {
    font-size: 1.1rem;
  }
  
  .text-2xl {
    font-size: 1.2rem;
  }
`;

// Animation styles - REMOVED flip effects
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes gradient {
    0% { opacity: 0.1; }
    50% { opacity: 0.3; }
    100% { opacity: 0.1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.3s ease-out;
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out;
  }
  
  .animate-gradient {
    animation: gradient 8s ease-in-out infinite;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Shop header image
const shopHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Gradient for header - UPDATED to yellow-orange
const headerGradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Algorithm states for performance tracking (internal only - not shown to users)
  const [loadTime, setLoadTime] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [algorithmStats, setAlgorithmStats] = useState({
    totalRequests: 0,
    cacheHits: 0,
    avgLoadTime: 0
  });
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priceRangeResults, setPriceRangeResults] = useState(null);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ? searchParams.get('category').split(',') : [],
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : '',
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    count: 0
  });
  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 30,
      easing: 'ease-out-cubic',
    });
    
    setTimeout(() => {
      AOS.refresh();
    }, 1000);
  }, []);

  // Refresh AOS when products change
  useEffect(() => {
    setTimeout(() => {
      AOS.refresh();
    }, 500);
  }, [products]);

  // Sort options
  const sortOptions = [
    { value: '-createdAt', label: 'Newest', icon: <FiClock className="w-3 h-3" /> },
    { value: 'price', label: 'Price: Low to High', icon: <FiDollarSign className="w-3 h-3" /> },
    { value: '-price', label: 'Price: High to Low', icon: <FiDollarSign className="w-3 h-3" /> },
    { value: '-rating', label: 'Highest Rated', icon: <FiStar className="w-3 h-3" /> },
    { value: '-salesCount', label: 'Best Selling', icon: <FiTrendingUp className="w-3 h-3" /> },
    { value: '-discountPercentage', label: 'Biggest Discount', icon: <BsLightningFill className="w-3 h-3" /> }
  ];

  // Normalize product data function
  const normalizeProductData = (product) => {
    if (!product) return null;
    
    return {
      ...product,
      _id: product._id || product.id,
      id: product.id || product._id,
      stock: product.stock !== undefined ? product.stock : 
             (product.quantity !== undefined ? product.quantity : 0),
      quantity: product.quantity !== undefined ? product.quantity :
                (product.stock !== undefined ? product.stock : 0),
      price: product.price || 0,
      comparePrice: product.comparePrice || product.originalPrice || null,
      images: product.images || [],
      image: product.image || null,
      primaryImage: product.primaryImage || product.image || null,
      rating: product.rating || 0,
      reviewsCount: product.reviewsCount || product.reviews || 0,
      featured: product.featured || false,
      isTrending: product.isTrending || false,
      isFlashSale: product.isFlashSale || false,
      isJustArrived: product.isJustArrived || false
    };
  };

  // Normalize products array
  const normalizeProductsArray = (productsArray) => {
    if (!Array.isArray(productsArray)) return [];
    return productsArray.map(normalizeProductData).filter(Boolean);
  };

  // ========== ALGORITHM INTEGRATIONS ==========
  
  /**
   * Auto-complete handler using Trie data structure
   */
  const handleSearchInput = async (e) => {
    const value = e.target.value;
    updateFilter('search', value);
    
    // Use Trie for instant autocomplete suggestions
    if (value.length >= 2 && clientProductService.autocompleteSearch) {
      try {
        const productIds = clientProductService.autocompleteSearch(value, 5);
        if (productIds.length > 0) {
          // Fetch product details for suggestions
          const response = await clientProductService.getProductsByIds?.(productIds);
          if (response?.success) {
            setSuggestions(response.products);
            setShowSuggestions(true);
          }
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * Apply price range filter using Binary Search
   */
  const applyPriceRangeFilter = () => {
    if (clientProductService.isInitialized?.() && filters.minPrice && filters.maxPrice) {
      const filtered = clientProductService.getProductsByPriceRange(
        parseFloat(filters.minPrice) || 0, 
        parseFloat(filters.maxPrice) || Infinity
      );
      setPriceRangeResults({
        count: filtered.length,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice
      });
      // Log to console only - hidden from UI
      console.log(`🔍 Binary Search: Found ${filtered.length} products in price range KSh ${filters.minPrice} - ${filters.maxPrice}`);
    } else {
      setPriceRangeResults(null);
    }
  };

  /**
   * Handle price input change with algorithm
   */
  const handlePriceChange = (type, value) => {
    updateFilter(type, value);
    // Use setTimeout to allow state to update
    setTimeout(() => {
      applyPriceRangeFilter();
    }, 100);
  };

  // Fetch products with performance tracking
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const startTime = performance.now();
      
      console.log('📤 Fetching products with filters:', filters);
      
      const queryParams = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort
      };

      if (filters.category.length > 0) {
        queryParams.category = filters.category.join(',');
      }

      if (filters.minPrice) {
        queryParams.minPrice = filters.minPrice;
      }
      if (filters.maxPrice) {
        queryParams.maxPrice = filters.maxPrice;
      }

      if (filters.search) {
        queryParams.search = filters.search;
      }

      const response = await clientProductService.getProducts(queryParams);
      
      const endTime = performance.now();
      const loadTimeMs = (endTime - startTime).toFixed(0);
      const isCached = response?.cached || false;
      
      setLoadTime(loadTimeMs);
      setFromCache(isCached);
      
      // Update algorithm statistics (internal only)
      setAlgorithmStats(prev => ({
        totalRequests: prev.totalRequests + 1,
        cacheHits: isCached ? prev.cacheHits + 1 : prev.cacheHits,
        avgLoadTime: prev.totalRequests === 0 
          ? parseFloat(loadTimeMs)
          : (prev.avgLoadTime * prev.totalRequests + parseFloat(loadTimeMs)) / (prev.totalRequests + 1)
      }));
      
      // Log to console only - hidden from UI
      console.log(`⚡ Products loaded in ${loadTimeMs}ms ${isCached ? '(from LRU Cache)' : '(from API)'}`);
      
      if (response.success) {
        setProducts(normalizeProductsArray(response.products || []));
        setPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.pages || 1,
          totalProducts: response.total || 0,
          count: response.count || 0
        });

        // Initialize product service with first batch of products for algorithms
        if (response.products && response.products.length > 0 && !clientProductService.isInitialized?.()) {
          await clientProductService.initialize(response.products);
          console.log('🚀 Product service initialized with algorithms: LRU Cache, Binary Search, Trie');
        }

        if (response.products && response.products.length > 0) {
          const uniqueCategories = [...new Set(response.products.map(p => p.category).filter(Boolean))];
          const categoryOptions = uniqueCategories.map(cat => ({
            value: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            count: response.products.filter(p => p.category === cat).length
          }));
          setCategories(categoryOptions);
        }
        
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== '' && key !== 'limit') {
            if (Array.isArray(value)) {
              if (value.length > 0) params.set(key, value.join(','));
            } else {
              params.set(key, value.toString());
            }
          }
        });
        navigate(`/shop?${params.toString()}`, { replace: true });
      } else {
        setProducts([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalProducts: 0,
          count: 0
        });
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        count: 0
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };
  
  const toggleCategory = (categoryValue) => {
    setFilters(prev => {
      const newCategories = prev.category.includes(categoryValue)
        ? prev.category.filter(c => c !== categoryValue)
        : [...prev.category, categoryValue];
      return {
        ...prev,
        category: newCategories,
        page: 1
      };
    });
  };
  
  const clearFilters = () => {
    setFilters({
      category: [],
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: '-createdAt',
      page: 1,
      limit: 12
    });
    setSuggestions([]);
    setShowSuggestions(false);
    setPriceRangeResults(null);
    navigate('/shop');
    setShowFilters(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  // Loading state with CardSkeleton for better UX
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        
        {/* Header Image - COMPACT with Dashboard-style heading */}
        <div 
          className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64"
          data-aos="fade-in"
          data-aos-duration="1500"
        >
          <div className="absolute inset-0">
            <img 
              src={shopHeaderImage}
              alt="Shop Collection"
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="w-full px-4 mx-auto max-w-7xl">
              <div 
                className="max-w-2xl"
                data-aos="fade-right"
                data-aos-duration="1200"
              >
                <div className="section-title-wrapper">
                  <h1 className="section-title">OUR COLLECTION</h1>
                </div>
                <p className="mt-2 text-xs text-gray-300 sm:text-sm animate-pulse">
                  Loading products...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Cards */}
        <div className="container px-3 py-4 mx-auto max-w-7xl sm:px-4">
          <CardSkeleton count={12} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black">
      {/* Inject styles */}
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>

      {/* Shop Header Image - COMPACT with Dashboard-style heading */}
      <div 
        className="relative w-full h-48 overflow-hidden sm:h-56 md:h-64"
        data-aos="fade-in"
        data-aos-duration="1500"
      >
        <div className="absolute inset-0">
          <img 
            src={shopHeaderImage}
            alt="Shop Collection"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${headerGradient} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-4 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
            >
              {/* Updated heading with Dashboard style */}
              <div className="section-title-wrapper">
                <h1 className="section-title">OUR COLLECTION</h1>
              </div>
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                {pagination.totalProducts} products available
              </p>
              
              {/* Algorithm Performance Badges REMOVED - hidden from users */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - COMPACT */}
      <div className="container px-3 py-4 mx-auto max-w-7xl sm:px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
          {/* Filters Sidebar - COMPACT */}
          <div 
            className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
            data-aos="fade-right"
            data-aos-duration="800"
          >
            <div className="sticky p-3 bg-gray-900 border border-gray-800 rounded-xl top-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-yellow-500 transition-colors hover:text-yellow-400"
                >
                  Clear All
                </button>
              </div>

              {/* Search with Autocomplete */}
              <div className="mb-3">
                <label className="block mb-0.5 text-[10px] font-medium text-gray-300">Search</label>
                <div className="relative">
                  <FiSearch className="absolute w-3 h-3 text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={handleSearchInput}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => filters.search.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                    className="w-full py-1.5 pr-2 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg pl-7 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                  />
                  
                  {/* Autocomplete Suggestions Dropdown - Using Trie Algorithm */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 overflow-hidden bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                      <div className="overflow-y-auto max-h-60 custom-scrollbar">
                        {suggestions.map(product => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="flex items-center gap-3 p-2 transition-colors hover:bg-gray-800"
                            onClick={() => setShowSuggestions(false)}
                          >
                            <div className="flex-shrink-0 w-8 h-8 overflow-hidden bg-gray-800 rounded">
                              <img 
                                src={product.primaryImage || product.image || 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                                alt={product.name}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.src = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{product.name}</p>
                              <p className="text-[10px] text-gray-400">{formatKES(product.price)}</p>
                            </div>
                            <FiArrowRight className="w-3 h-3 text-gray-500" />
                          </Link>
                        ))}
                        {/* Algorithm indicator REMOVED - hidden from users */}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-3">
                <h3 className="mb-1.5 text-xs font-semibold text-white">Categories</h3>
                <div className="space-y-1 overflow-y-auto max-h-36">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <label key={category.value} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category.value)}
                          onChange={() => toggleCategory(category.value)}
                          className="w-3.5 h-3.5 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-offset-0"
                        />
                        <span className="ml-1.5 text-[10px] text-gray-300 transition-colors group-hover:text-white">{category.label}</span>
                        <span className="ml-auto text-[10px] text-gray-500">({category.count})</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-[10px] text-gray-500">No categories</p>
                  )}
                </div>
              </div>

              {/* Price Range with Binary Search Feedback */}
              <div>
                <h3 className="mb-1.5 text-xs font-semibold text-white">Price Range</h3>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handlePriceChange('minPrice', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-2 py-1.5 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-yellow-500/50"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handlePriceChange('maxPrice', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-2 py-1.5 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-yellow-500/50"
                    min="0"
                  />
                </div>
                
                {/* Price Range Results Feedback REMOVED - hidden from users */}
              </div>
              
              {/* Algorithm Stats Summary REMOVED - hidden from users */}
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Controls Bar - COMPACT */}
            <div 
              className="p-2 mb-4 bg-gray-900 border border-gray-800 rounded-xl"
              data-aos="fade-up"
              data-aos-duration="800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[10px] text-gray-400">
                  Showing <span className="font-semibold text-white">{products.length}</span> of{' '}
                  <span className="font-semibold text-white">{pagination.totalProducts}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {/* View Mode Toggle */}
                  <div className="flex overflow-hidden bg-gray-800 border border-gray-700 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`relative p-1.5 transition-all ${
                        viewMode === 'grid' ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                      title="Grid view"
                    >
                      {viewMode === 'grid' && (
                        <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                      )}
                      <span className="relative">
                        <BsGridFill className="w-3.5 h-3.5" />
                      </span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`relative p-1.5 transition-all ${
                        viewMode === 'list' ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                      title="List view"
                    >
                      {viewMode === 'list' && (
                        <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                      )}
                      <span className="relative">
                        <BsListUl className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>
                  
                  {/* Sort - COMPACT */}
                  <div className="relative">
                    <select
                      value={filters.sort}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="px-2 py-1.5 pr-6 text-xs text-white bg-gray-800 border border-gray-700 rounded-lg appearance-none cursor-pointer focus:ring-1 focus:ring-yellow-500/50"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value} className="bg-gray-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute w-3 h-3 text-gray-400 transform -translate-y-1/2 pointer-events-none right-1.5 top-1/2" />
                  </div>
                  
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative px-2 py-1.5 overflow-hidden text-xs font-medium text-white transition-all rounded-lg lg:hidden group"
                  >
                    <span className="absolute inset-0 bg-gray-800"></span>
                    <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-50"></span>
                    <span className="relative flex items-center gap-0.5">
                      {showFilters ? <FiX className="w-3 h-3" /> : <FiFilter className="w-3 h-3" />}
                      <span className="text-[10px]">{showFilters ? 'Hide' : 'Filter'}</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading overlay for subsequent loads */}
            {loading && !initialLoad && (
              <div className="flex justify-center py-8">
                <LoadingSpinner message="Updating results..." size="sm" fullScreen={false} />
              </div>
            )}

            {/* Products Grid */}
            {products.length === 0 && !loading ? (
              <div 
                className="py-8 text-center bg-gray-900 border border-gray-800 rounded-xl"
                data-aos="fade-up"
                data-aos-duration="800"
              >
                <FiPackage className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <h3 className="mb-1 text-sm font-semibold text-white">No products found</h3>
                <p className="mb-3 text-xs text-gray-400">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="relative px-4 py-2 overflow-hidden text-xs font-medium text-white transition-all rounded-full group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-1">
                    Clear All
                    <BsArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {products.map((product, index) => (
                  <div 
                    key={product._id || product.id} 
                    className="relative group"
                    data-aos="fade-up"
                    data-aos-duration="600"
                    data-aos-delay={index * 30}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                    <div className="relative">
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product, index) => (
                  <div 
                    key={product._id || product.id} 
                    className="relative group"
                    data-aos="fade-up"
                    data-aos-duration="600"
                    data-aos-delay={index * 30}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                    <div className="relative overflow-hidden bg-gray-900 border border-gray-800 rounded-xl">
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="flex-shrink-0 overflow-hidden bg-gray-800 h-28 md:w-28 md:h-auto">
                          <img
                            src={product.primaryImage || (product.images && product.images[0]?.url) || product.image || 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={product.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.target.src = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400';
                            }}
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0 p-3">
                          <div className="flex flex-col items-start justify-between gap-2 md:flex-row">
                            <div className="flex-1 w-full md:w-auto">
                              <h3 className="mb-1 text-sm font-semibold text-white truncate">
                                <Link to={`/product/${product._id || product.id}`} className="transition-colors hover:text-yellow-500">
                                  {product.name}
                                </Link>
                              </h3>
                              <p className="mb-2 text-xs text-gray-400 line-clamp-2">
                                {product.description || product.shortDescription || 'No description available'}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                  <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-white">{product.rating || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500 truncate">
                                  {product.category || 'Uncategorized'}
                                </span>
                              </div>
                            </div>
                            <div className="text-left md:text-right">
                              <div className="text-lg font-bold text-white">
                                {formatKES(product.discountedPrice || product.price)}
                              </div>
                              {product.discountPercentage > 0 && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatKES(product.price)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex items-center gap-1 btn-primary text-xs px-3 py-1.5"
                            >
                              <FiShoppingCart className="w-3 h-3" />
                              <span>Add to Cart</span>
                            </button>
                            <Link
                              to={`/product/${product._id || product.id}`}
                              className="btn-secondary text-xs px-3 py-1.5"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination - COMPACT */}
            {pagination.totalPages > 1 && (
              <div 
                className="flex justify-center mt-6"
                data-aos="fade-up"
                data-aos-duration="800"
              >
                <div className="flex items-center gap-1 p-1 bg-gray-900 border border-gray-800 rounded-lg">
                  <button
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="p-1.5 text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 disabled:opacity-50"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilter('page', pageNum)}
                        className={`relative w-7 h-7 text-[10px] font-medium rounded-lg transition-all md:w-8 md:h-8 ${
                          filters.page === pageNum
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {filters.page === pageNum && (
                          <>
                            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                            <span className="absolute inset-0 rounded-lg opacity-50 bg-gradient-to-r from-yellow-600 to-orange-600 blur"></span>
                          </>
                        )}
                        <span className="relative">{pageNum}</span>
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => updateFilter('page', Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={filters.page === pagination.totalPages}
                    className="p-1.5 text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 disabled:opacity-50"
                  >
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.5);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Shop;