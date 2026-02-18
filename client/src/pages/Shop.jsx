// src/pages/Shop.jsx - FIXED with homepage styling
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
  FiArrowRight
} from 'react-icons/fi';
import { 
  BsGridFill, 
  BsListUl,
  BsLightningFill,
  BsArrowRight
} from 'react-icons/bs';
import { useCart } from '../context/CartContext';

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .glow-text {
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
`;

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

  // Sort options
  const sortOptions = [
    { value: '-createdAt', label: 'Newest', icon: <FiClock /> },
    { value: 'price', label: 'Price: Low to High', icon: <FiDollarSign /> },
    { value: '-price', label: 'Price: High to Low', icon: <FiDollarSign /> },
    { value: '-rating', label: 'Highest Rated', icon: <FiStar /> },
    { value: '-salesCount', label: 'Best Selling', icon: <FiTrendingUp /> },
    { value: '-discountPercentage', label: 'Biggest Discount', icon: <BsLightningFill /> }
  ];

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
        setProducts(response.products || []);
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
        <style>{animationStyles}</style>
        <div className="relative">
          <div className="w-20 h-20 border-4 border-t-4 border-gray-700 rounded-full border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-6 text-gray-400 glow-text">Loading products...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <style>{animationStyles}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Hero Section */}
      <div className="relative border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        <div className="relative container px-4 py-12 mx-auto">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl glow-text">Our Collection</h1>
              <p className="max-w-2xl text-gray-400">
                Discover premium products at amazing prices. {pagination.totalProducts} products available.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group relative px-6 py-3 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></span>
                <span className="relative flex items-center gap-2">
                  {showFilters ? <FiX /> : <FiFilter />}
                  <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky p-6 border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
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
                    className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-500 border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
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
                        <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{category.label}</span>
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
                      className="w-full px-3 py-2 text-white placeholder-gray-500 border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 focus:ring-2 focus:ring-blue-500/50"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-3 py-2 text-white placeholder-gray-500 border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 focus:ring-2 focus:ring-blue-500/50"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:w-3/4">
            {/* Controls Bar */}
            <div className="p-4 mb-6 border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-400">
                  Showing <span className="font-semibold text-white">{products.length}</span> of{' '}
                  <span className="font-semibold text-white">{pagination.totalProducts}</span> products
                </div>
                
                <div className="flex items-center gap-4">
                  {/* View Mode */}
                  <div className="flex overflow-hidden border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="Grid view"
                    >
                      <BsGridFill className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-all ${
                        viewMode === 'list' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      title="List view"
                    >
                      <BsListUl className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Sort */}
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="px-4 py-2 text-white border rounded-lg appearance-none cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 focus:ring-2 focus:ring-blue-500/50"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="py-12 text-center border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <div className="w-20 h-20 mx-auto mb-4 text-gray-600">
                  <FiPackage className="w-full h-full" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">No products found</h3>
                <p className="mb-4 text-gray-400">Try adjusting your filters or search term</p>
                <button
                  onClick={clearFilters}
                  className="group relative px-6 py-3 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative flex items-center gap-2">
                    Clear All Filters
                    <BsArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div key={product._id || product.id} className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                    <div className="relative">
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product._id || product.id} className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                    <div className="relative overflow-hidden border rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="h-48 overflow-hidden bg-gray-800 md:w-48">
                          <img
                            src={product.images?.[0]?.url || product.image || 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={product.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="mb-2 text-lg font-semibold text-white">
                                <Link to={`/product/${product._id || product.id}`} className="hover:text-blue-500 transition-colors">
                                  {product.name}
                                </Link>
                              </h3>
                              <p className="mb-4 text-sm text-gray-400 line-clamp-2">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                  <FiStar className="text-yellow-400 fill-current" />
                                  <span className="text-sm text-white">{product.rating || 0}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.category}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="mb-2 text-xl font-bold text-white">
                                {formatKES(product.discountedPrice || product.price)}
                              </div>
                              {product.discountPercentage > 0 && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatKES(product.price)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="group relative px-6 py-2 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                              <span className="relative">Add to Cart</span>
                            </button>
                            <Link
                              to={`/product/${product._id || product.id}`}
                              className="px-6 py-2 text-sm font-medium text-white transition-all border rounded-full border-gray-700 hover:bg-white/10"
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
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2 p-1 border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
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
                        className={`relative w-10 h-10 text-sm font-medium rounded-lg transition-all ${
                          filters.page === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {filters.page === pageNum && (
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-50 blur"></div>
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