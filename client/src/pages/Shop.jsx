// src/pages/Shop.jsx - COMPLETE VERSION
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
  FiGrid,
  FiList,
  FiStar,
  FiTrendingUp,
  FiClock,
  FiDollarSign,
  FiCheck,
  FiPackage
} from 'react-icons/fi';
import { 
  BsGridFill, 
  BsListUl,
  BsLightningFill,
  BsFire
} from 'react-icons/bs';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ? [searchParams.get('category')] : [],
    minPrice: searchParams.get('minPrice') || 0,
    maxPrice: searchParams.get('maxPrice') || 100000,
    minRating: searchParams.get('minRating') || 0,
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'featured',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });
  
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 100000
  });

  // Fetch categories and initial products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await clientProductService.getCategories();
        setCategories(response.categories || response.data?.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare query params
      const queryParams = { ...filters };
      
      // Convert array to string for API
      if (filters.category.length > 0) {
        queryParams.category = filters.category.join(',');
      }
      
      // Remove empty values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });
      
      const response = await clientProductService.getProducts(queryParams);
      
      if (response.success) {
        setProducts(response.products || response.data?.products || []);
        setTotalPages(response.pages || response.data?.pages || 1);
        setTotalProducts(response.total || response.data?.total || 0);
        
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
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
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
  
  const toggleCategory = (categorySlug) => {
    setFilters(prev => {
      const newCategories = prev.category.includes(categorySlug)
        ? prev.category.filter(c => c !== categorySlug)
        : [...prev.category, categorySlug];
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
      minPrice: 0,
      maxPrice: 100000,
      minRating: 0,
      inStock: false,
      onSale: false,
      search: '',
      sortBy: 'featured',
      page: 1,
      limit: 12
    });
    navigate('/shop');
    setShowFilters(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  // Sort options
  const sortOptions = [
    { value: 'featured', label: 'Featured', icon: <FiStar /> },
    { value: 'newest', label: 'Newest', icon: <FiClock /> },
    { value: 'price_low', label: 'Price: Low to High', icon: <FiDollarSign /> },
    { value: 'price_high', label: 'Price: High to Low', icon: <FiDollarSign /> },
    { value: 'rating', label: 'Highest Rated', icon: <FiStar /> },
    { value: 'trending', label: 'Trending', icon: <FiTrendingUp /> },
    { value: 'discount', label: 'Biggest Discount', icon: <BsLightningFill /> }
  ];

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
                Discover premium tech products at amazing prices. {totalProducts} products available.
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
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category._id || category.slug} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category.slug)}
                        onChange={() => toggleCategory(category.slug)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm">{category.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        ({category.productCount || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Min: {formatKES(filters.minPrice)}</span>
                    <span className="text-sm text-gray-600">Max: {formatKES(filters.maxPrice)}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 100000)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold">Minimum Rating</h3>
                <div className="flex items-center gap-2">
                  {[4, 3, 2, 1, 0].map(rating => (
                    <button
                      key={rating}
                      onClick={() => updateFilter('minRating', rating)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        filters.minRating === rating
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FiStar className={filters.minRating === rating ? 'fill-current' : ''} />
                      <span>{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Filters */}
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm">In Stock Only</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => updateFilter('onSale', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm">On Sale</span>
                </label>
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
                  <span className="font-semibold">{totalProducts}</span> products
                </div>
                
                <div className="flex items-center gap-4">
                  {/* View Mode */}
                  <div className="flex overflow-hidden border rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                    >
                      <BsGridFill />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                    >
                      <BsListUl />
                    </button>
                  </div>
                  
                  {/* Sort */}
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
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
                    key={product._id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product._id} className="overflow-hidden bg-white shadow-sm rounded-xl">
                    <div className="flex flex-col md:flex-row">
                      {/* Product Image */}
                      <div className="h-48 bg-gray-100 md:w-48">
                        <img
                          src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                              <Link to={`/product/${product._id}`} className="hover:text-blue-600">
                                {product.name}
                              </Link>
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-1">
                                <FiStar className="text-yellow-400" />
                                <span className="text-sm">{product.rating || 0}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="mb-2 text-xl font-bold text-gray-900">
                              {formatKES(product.discountPrice || product.price)}
                            </div>
                            {product.discountPrice && (
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
                            to={`/product/${product._id}`}
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
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
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
                    onClick={() => updateFilter('page', Math.min(totalPages, filters.page + 1))}
                    disabled={filters.page === totalPages}
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