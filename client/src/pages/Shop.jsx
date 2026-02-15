// src/pages/Shop.jsx - CORRECTED to match backend
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
  FiPackage
} from 'react-icons/fi';
import { 
  BsGridFill, 
  BsListUl,
  BsLightningFill
} from 'react-icons/bs';
import { useCart } from '../context/CartContext';

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

  // Sort options mapping to backend sort format
  const sortOptions = [
    { value: '-createdAt', label: 'Newest', icon: <FiClock /> },
    { value: 'price', label: 'Price: Low to High', icon: <FiDollarSign /> },
    { value: '-price', label: 'Price: High to Low', icon: <FiDollarSign /> },
    { value: '-rating', label: 'Highest Rated', icon: <FiStar /> },
    { value: '-salesCount', label: 'Best Selling', icon: <FiTrendingUp /> },
    { value: '-discountPercentage', label: 'Biggest Discount', icon: <BsLightningFill /> }
  ];

  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📤 Fetching products with filters:', filters);
      
      // Prepare query params to match backend
      const queryParams = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort
      };

      // Add category if selected
      if (filters.category.length > 0) {
        queryParams.category = filters.category.join(',');
      }

      // Add price range if set
      if (filters.minPrice) {
        queryParams.minPrice = filters.minPrice;
      }
      if (filters.maxPrice) {
        queryParams.maxPrice = filters.maxPrice;
      }

      // Add search if present
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

        // Extract unique categories from products for filter sidebar
        if (response.products && response.products.length > 0) {
          const uniqueCategories = [...new Set(response.products.map(p => p.category).filter(Boolean))];
          const categoryOptions = uniqueCategories.map(cat => ({
            value: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            count: response.products.filter(p => p.category === cat).length
          }));
          setCategories(categoryOptions);
        }
        
        // Update URL with current filters
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

  // Update filter handlers
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
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

  // Format price to Kenyan Shillings
  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="w-16 h-16 mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <div className="py-12 text-white bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold md:text-4xl">Our Collection</h1>
              <p className="max-w-2xl text-blue-100">
                Discover premium products at amazing prices. {pagination.totalProducts} products available.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                {showFilters ? <FiX /> : <FiFilter />}
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky p-6 bg-white shadow-lg rounded-xl top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium">Search</label>
                <div className="relative">
                  <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold">Categories</h3>
                <div className="space-y-2 overflow-y-auto max-h-60">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <label key={category.value} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category.value)}
                          onChange={() => toggleCategory(category.value)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-sm">{category.label}</span>
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
                <h3 className="mb-3 font-semibold">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {filters.minPrice ? formatKES(filters.minPrice) : 'Min: Any'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {filters.maxPrice ? formatKES(filters.maxPrice) : 'Max: Any'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-3 py-2 border rounded-lg"
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
            <div className="p-4 mb-6 bg-white shadow-sm rounded-xl">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{products.length}</span> of{' '}
                  <span className="font-semibold">{pagination.totalProducts}</span> products
                </div>
                
                <div className="flex items-center gap-4">
                  {/* View Mode */}
                  <div className="flex overflow-hidden border rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                      title="Grid view"
                    >
                      <BsGridFill />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                      title="List view"
                    >
                      <BsListUl />
                    </button>
                  </div>
                  
                  {/* Sort */}
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="py-12 text-center bg-white shadow-sm rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <FiPackage className="w-full h-full" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">No products found</h3>
                <p className="mb-4 text-gray-500">Try adjusting your filters or search term</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product} 
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product._id || product.id} className="overflow-hidden bg-white shadow-sm rounded-xl">
                    <div className="flex flex-col md:flex-row">
                      {/* Product Image */}
                      <div className="h-48 bg-gray-100 md:w-48">
                        <img
                          src={product.images?.[0]?.url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                              <Link to={`/product/${product._id || product.id}`} className="hover:text-blue-600">
                                {product.name}
                              </Link>
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-1">
                                <FiStar className="text-yellow-400 fill-current" />
                                <span className="text-sm">{product.rating || 0}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="mb-2 text-xl font-bold text-gray-900">
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
                            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            Add to Cart
                          </button>
                          <Link
                            to={`/product/${product._id || product.id}`}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            View Details
                          </Link>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft />
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
                        className={`w-10 h-10 rounded-lg ${
                          filters.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => updateFilter('page', Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={filters.page === pagination.totalPages}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight />
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