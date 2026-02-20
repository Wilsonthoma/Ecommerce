// src/pages/Shop.jsx - FIXED with proper animations and UI improvements
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
  FiChevronDown
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

// Font styles matching homepage EXACTLY
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
    font-size: 2.8rem;
    line-height: 1.2;
    text-transform: uppercase;
    color: white;
    margin-bottom: 0;
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
  
  .glow-text {
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  }
  
  .glow-text:hover {
    text-shadow: 0 0 50px rgba(59, 130, 246, 0.8);
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
    color: white;
    font-weight: 600;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }
  
  .btn-secondary {
    background: transparent;
    color: white;
    font-weight: 600;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  .btn-secondary:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
  }
`;

// Animation styles matching homepage
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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
  
  /* 3D Card Effects */
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d-content {
    transform: translateZ(20px);
  }
`;

// Beautiful gradient combinations (matching homepage)
const sectionGradients = {
  header: "from-blue-600/20 via-purple-600/20 to-pink-600/20"
};

// Top Bar Component (matching homepage)
const TopBar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-3 border-b border-gray-800 bg-black/90">
      <div className="flex items-center justify-end px-6 mx-auto space-x-6 max-w-7xl">
        <button 
          onClick={() => navigate('/stores')}
          className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <FiMapPin className="w-4 h-4" />
          FIND STORE
        </button>
        <span className="text-gray-700">|</span>
        <button 
          onClick={() => navigate('/shop')}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          SHOP ONLINE
        </button>
      </div>
    </div>
  );
};

// Shop header image - DISTINCT image for shop page
const shopHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

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
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
      easing: 'ease-out-cubic',
      anchorPlacement: 'top-bottom',
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
    { value: '-createdAt', label: 'Newest', icon: <FiClock /> },
    { value: 'price', label: 'Price: Low to High', icon: <FiDollarSign /> },
    { value: '-price', label: 'Price: High to Low', icon: <FiDollarSign /> },
    { value: '-rating', label: 'Highest Rated', icon: <FiStar /> },
    { value: '-salesCount', label: 'Best Selling', icon: <FiTrendingUp /> },
    { value: '-discountPercentage', label: 'Biggest Discount', icon: <BsLightningFill /> }
  ];

  // Normalize product data function (matching Home.jsx)
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

      console.log('📤 Query params:', queryParams);
      
      const response = await clientProductService.getProducts(queryParams);
      console.log('📥 Products response:', response);
      
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
        console.error('❌ Failed to fetch products');
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <style>{fontStyles}</style>
        <style>{animationStyles}</style>
        <div className="relative">
          <div className="w-20 h-20 border-4 border-t-4 border-gray-700 rounded-full border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-6 text-gray-400 glow-text">Loading products...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Inject styles */}
      <style>{fontStyles}</style>
      <style>{animationStyles}</style>
      
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 animate-gradient"></div>
      
      {/* Top Bar - matching homepage */}
      <TopBar />

      {/* Shop Header Image - MATCHING HOMEPAGE STYLE with AOS animations */}
      <div 
        className="relative w-full overflow-hidden h-[400px] border-b border-gray-800"
        data-aos="fade-in"
        data-aos-duration="1500"
        data-aos-delay="200"
        data-aos-once="false"
      >
        <div className="absolute inset-0">
          <img 
            src={shopHeaderImage}
            alt="Shop Collection"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${sectionGradients.header} mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>
        
        {/* Header Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 mx-auto max-w-7xl">
            <div 
              className="max-w-2xl"
              data-aos="fade-right"
              data-aos-duration="1200"
              data-aos-delay="400"
              data-aos-once="false"
            >
              <h1 className="section-title glow-text">
                OUR COLLECTION
              </h1>
              <p className="mt-4 text-xl font-medium text-gray-300">
                Discover premium products at amazing prices
              </p>
              <p className="mt-2 text-lg text-gray-400">
                {pagination.totalProducts} products available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar - with AOS animation */}
          <div 
            className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-delay="200"
            data-aos-once="false"
          >
            <div className="sticky p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-500 transition-colors hover:text-blue-400"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-300">Search</label>
                <div className="relative">
                  <FiSearch className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-500 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-white">Categories</h3>
                <div className="space-y-2 overflow-y-auto max-h-60">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <label key={category.value} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category.value)}
                          onChange={() => toggleCategory(category.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm text-gray-300 transition-colors group-hover:text-white">{category.label}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          ({category.count})
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No categories available</p>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-white">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {filters.minPrice ? formatKES(filters.minPrice) : 'Min: Any'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {filters.maxPrice ? formatKES(filters.maxPrice) : 'Max: Any'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-3 py-2 text-white placeholder-gray-500 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 focus:ring-2 focus:ring-blue-500/50"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-3 py-2 text-white placeholder-gray-500 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 focus:ring-2 focus:ring-blue-500/50"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:w-3/4">
            {/* Controls Bar - with AOS animation */}
            <div 
              className="p-4 mb-6 border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="300"
              data-aos-once="false"
            >
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-400">
                  Showing <span className="font-semibold text-white">{products.length}</span> of{' '}
                  <span className="font-semibold text-white">{pagination.totalProducts}</span> products
                </div>
                
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle - FIXED: Proper button styling */}
                  <div className="flex overflow-hidden border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`relative p-2 transition-all group ${
                        viewMode === 'grid' 
                          ? 'text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Grid view"
                    >
                      {viewMode === 'grid' && (
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                      )}
                      <span className="relative">
                        <BsGridFill className="w-5 h-5" />
                      </span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`relative p-2 transition-all group ${
                        viewMode === 'list' 
                          ? 'text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="List view"
                    >
                      {viewMode === 'list' && (
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                      )}
                      <span className="relative">
                        <BsListUl className="w-5 h-5" />
                      </span>
                    </button>
                  </div>
                  
                  {/* Sort - FIXED: Proper styling */}
                  <div className="relative">
                    <select
                      value={filters.sort}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="px-4 py-2 pr-10 text-white border border-gray-700 rounded-lg appearance-none cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 focus:ring-2 focus:ring-blue-500/50"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value} className="bg-gray-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                  </div>
                  
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative px-4 py-2 overflow-hidden text-sm font-medium text-white transition-all rounded-full lg:hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900"></span>
                    <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl group-hover:opacity-50"></span>
                    <span className="relative flex items-center gap-2">
                      {showFilters ? <FiX /> : <FiFilter />}
                      <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div 
                className="py-12 text-center border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="400"
                data-aos-once="false"
              >
                <div className="w-20 h-20 mx-auto mb-4 text-gray-600">
                  <FiPackage className="w-full h-full" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">No products found</h3>
                <p className="mb-4 text-gray-400">Try adjusting your filters or search term</p>
                <button
                  onClick={clearFilters}
                  className="relative px-6 py-3 overflow-hidden text-sm font-medium text-white transition-all rounded-full group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                  <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-2">
                    Clear All Filters
                    <BsArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <div 
                    key={product._id || product.id} 
                    className="relative group card-3d"
                    data-aos="flip-up"
                    data-aos-duration="1000"
                    data-aos-delay={200 + (index * 100)}
                    data-aos-easing="ease-out-cubic"
                    data-aos-once="false"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                    <div className="relative card-3d-content">
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div 
                    key={product._id || product.id} 
                    className="relative group"
                    data-aos="fade-left"
                    data-aos-duration="1000"
                    data-aos-delay={200 + (index * 100)}
                    data-aos-easing="ease-out-cubic"
                    data-aos-once="false"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                    <div className="relative overflow-hidden border border-gray-700 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image - FIXED: Image loading */}
                        <div className="h-48 overflow-hidden bg-gray-800 md:w-48 md:h-auto">
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
                        <div className="flex-1 p-4 md:p-6">
                          <div className="flex flex-col items-start justify-between gap-2 md:flex-row">
                            <div className="flex-1">
                              <h3 className="mb-2 text-base font-semibold text-white md:text-lg">
                                <Link to={`/product/${product._id || product.id}`} className="transition-colors hover:text-blue-500">
                                  {product.name}
                                </Link>
                              </h3>
                              <p className="mb-3 text-xs text-gray-400 line-clamp-2 md:text-sm">
                                {product.description || product.shortDescription || 'No description available.'}
                              </p>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1">
                                  <FiStar className="w-3 h-3 text-yellow-400 fill-current md:w-4 md:h-4" />
                                  <span className="text-xs text-white md:text-sm">{product.rating || 0}</span>
                                </div>
                                <div className="text-xs text-gray-500 md:text-sm">
                                  {product.category || 'Uncategorized'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="mb-1 text-lg font-bold text-white md:text-xl">
                                {formatKES(product.discountedPrice || product.price)}
                              </div>
                              {product.discountPercentage > 0 && (
                                <div className="text-xs text-gray-500 line-through md:text-sm">
                                  {formatKES(product.price)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons - FIXED: Proper button styling */}
                          <div className="flex gap-2 mt-3 md:mt-4">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="relative flex-1 px-4 py-2 overflow-hidden text-xs font-medium text-white transition-all rounded-full md:flex-none md:px-6 md:py-2 md:text-sm group"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                              <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl group-hover:opacity-100"></span>
                              <span className="relative">Add to Cart</span>
                            </button>
                            <Link
                              to={`/product/${product._id || product.id}`}
                              className="flex-1 px-4 py-2 text-xs font-medium text-center text-white transition-all border border-gray-700 rounded-full md:flex-none md:px-6 md:py-2 md:text-sm hover:bg-white/10"
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div 
                className="flex justify-center mt-8"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="600"
                data-aos-once="false"
              >
                <div className="flex items-center gap-2 p-1 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                  <button
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="p-2 text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-5 h-5" />
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
                        className={`relative w-8 h-8 text-xs font-medium rounded-lg transition-all md:w-10 md:h-10 md:text-sm ${
                          filters.page === pageNum
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {filters.page === pageNum && (
                          <>
                            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"></span>
                            <span className="absolute inset-0 rounded-lg opacity-50 bg-gradient-to-r from-blue-600 to-purple-600 blur"></span>
                          </>
                        )}
                        <span className="relative">{pageNum}</span>
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => updateFilter('page', Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={filters.page === pagination.totalPages}
                    className="p-2 text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-5 h-5" />
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