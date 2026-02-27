// src/pages/Shop.jsx - UPDATED with Yellow-Orange Theme and Compact Sizing
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { clientProductService } from '../services/client/products';
import ProductCard from '../components/ProductCard';
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
  FiShoppingCart // ✅ ADDED missing import
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

// Font styles - UPDATED with yellow-orange theme
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .section-title {
    font-weight: 800;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin-bottom: 0;
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

// Top Bar Component - UPDATED colors
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-2 bg-black border-b border-gray-800">
      <div className="flex items-center justify-end px-4 mx-auto space-x-4 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          <FiMapPin className="w-3 h-3" />
          FIND STORE
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-xs text-gray-400 transition-colors hover:text-yellow-500"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

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

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
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
      
      if (response.success) {
        setProducts(normalizeProductsArray(response.products || []));
        setPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.pages || 1,
          totalProducts: response.total || 0,
          count: response.count || 0
        });

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

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        <TopBar />
        <div className="relative">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-700 rounded-full border-t-yellow-600 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading products...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black">
      {/* Inject styles */}
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      {/* Top Bar */}
      <TopBar />

      {/* Shop Header Image - COMPACT */}
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
              <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                OUR COLLECTION
              </h1>
              <p className="mt-1 text-xs text-gray-300 sm:text-sm">
                {pagination.totalProducts} products available
              </p>
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

              {/* Search */}
              <div className="mb-3">
                <label className="block mb-0.5 text-[10px] font-medium text-gray-300">Search</label>
                <div className="relative">
                  <FiSearch className="absolute w-3 h-3 text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full py-1.5 pr-2 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg pl-7 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                  />
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

              {/* Price Range */}
              <div>
                <h3 className="mb-1.5 text-xs font-semibold text-white">Price Range</h3>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-2 py-1.5 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-yellow-500/50"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-2 py-1.5 text-xs text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-yellow-500/50"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
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

            {/* Products Grid - REMOVED flip-up animation, added slide-up */}
            {products.length === 0 ? (
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
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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
                        <div className="overflow-hidden bg-gray-800 h-28 md:w-28 md:h-auto">
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
                        <div className="flex-1 p-2">
                          <div className="flex flex-col items-start justify-between gap-1 md:flex-row">
                            <div className="flex-1">
                              <h3 className="mb-0.5 text-xs font-semibold text-white">
                                <Link to={`/product/${product._id || product.id}`} className="transition-colors hover:text-yellow-500">
                                  {product.name}
                                </Link>
                              </h3>
                              <p className="mb-1 text-[10px] text-gray-400 line-clamp-1">
                                {product.description || product.shortDescription || 'No description'}
                              </p>
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className="flex items-center gap-0.5">
                                  <FiStar className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                                  <span className="text-[10px] text-white">{product.rating || 0}</span>
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {product.category || 'Uncategorized'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-white">
                                {formatKES(product.discountedPrice || product.price)}
                              </div>
                              {product.discountPercentage > 0 && (
                                <div className="text-[10px] text-gray-500 line-through">
                                  {formatKES(product.price)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex items-center gap-0.5 btn-primary text-[10px] px-2 py-1"
                            >
                              <FiShoppingCart className="w-2.5 h-2.5" />
                              <span>Add</span>
                            </button>
                            <Link
                              to={`/product/${product._id || product.id}`}
                              className="btn-secondary text-[10px] px-2 py-1"
                            >
                              View
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
                className="flex justify-center mt-5"
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
    </div>
  );
};

export default Shop;