import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clientProductService } from '../services/client/products';
import LoadingSpinner, { CardSkeleton } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import ShopFilters from '../components/shop/ShopFilters';
import SearchAutocomplete from '../components/shop/SearchAutocomplete';
import ProductControls from '../components/shop/ProductControls';
import ProductGrid from '../components/shop/ProductGrid';
import ProductListView from '../components/shop/ProductListView';
import ShopPagination from '../components/shop/ShopPagination';
import { FiPackage } from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import { useCart } from '../context/CartContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

const shopHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

const sortOptions = [
  { value: '-createdAt', label: 'Newest', icon: 'clock' },
  { value: 'price', label: 'Price: Low to High', icon: 'dollar' },
  { value: '-price', label: 'Price: High to Low', icon: 'dollar' },
  { value: '-rating', label: 'Highest Rated', icon: 'star' },
  { value: '-totalSold', label: 'Best Selling', icon: 'trending' }
];

const normalizeProductData = (product) => {
  if (!product) return null;
  return {
    ...product,
    _id: product._id || product.id,
    id: product.id || product._id,
    stock: product.stock !== undefined ? product.stock : (product.quantity !== undefined ? product.quantity : 0),
    quantity: product.quantity !== undefined ? product.quantity : (product.stock !== undefined ? product.stock : 0),
    price: product.price || 0,
    comparePrice: product.comparePrice || product.originalPrice || null,
    images: product.images || [],
    image: product.image || product.primaryImage || null,
    primaryImage: product.primaryImage || product.image || null,
    rating: product.rating || 0,
    reviewsCount: product.reviewsCount || product.reviews || 0,
    featured: product.featured || false,
    isTrending: product.isTrending || false,
    isFlashSale: product.isFlashSale || false,
    isJustArrived: product.isJustArrived || false,
    discountPercentage: product.discountPercentage || 0,
    inStock: product.inStock !== undefined ? product.inStock : true
  };
};

const normalizeProductsArray = (productsArray) => {
  if (!Array.isArray(productsArray)) return [];
  return productsArray.map(normalizeProductData).filter(Boolean);
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
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

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 30,
      easing: 'ease-out-cubic',
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Capitalize category names for backend
      let capitalizedCategories = [];
      if (filters.category.length > 0) {
        capitalizedCategories = filters.category.map(cat => 
          cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
        );
      }
      
      const queryParams = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        category: capitalizedCategories.length > 0 ? capitalizedCategories.join(',') : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        search: filters.search || undefined
      };

      console.log('📤 Fetching products with params:', queryParams);

      const response = await clientProductService.getProducts(queryParams);
      
      if (response.success) {
        const normalizedProducts = normalizeProductsArray(response.products || []);
        setProducts(normalizedProducts);
        setPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalProducts: response.total || 0,
          count: response.count || 0
        });

        // Update categories from response
        if (normalizedProducts.length > 0) {
          const uniqueCategories = [...new Set(normalizedProducts.map(p => p.category).filter(Boolean))];
          const categoryOptions = uniqueCategories.map(cat => ({
            value: cat,
            label: cat,
            count: normalizedProducts.filter(p => p.category === cat).length
          }));
          setCategories(categoryOptions);
        }
        
        // Update URL
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== '' && key !== 'limit') {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                // Capitalize categories in URL too
                const capitalized = value.map(v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase());
                params.set(key, capitalized.join(','));
              }
            } else {
              params.set(key, value.toString());
            }
          }
        });
        navigate(`/shop?${params.toString()}`, { replace: true });
      } else {
        console.error('Error response:', response.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };
  
  const toggleCategory = (categoryValue) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(categoryValue)
        ? prev.category.filter(c => c !== categoryValue)
        : [...prev.category, categoryValue],
      page: 1
    }));
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
    setShowFilters(false);
    navigate('/shop');
  };

  const handleSearchInput = async (e) => {
    const value = e.target.value;
    updateFilter('search', value);
    
    if (value.length >= 2) {
      try {
        const response = await clientProductService.searchProducts(value, { limit: 5 });
        if (response.success && response.products) {
          setSuggestions(response.products);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  if (loading && initialLoad) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="OUR COLLECTION" 
          subtitle="Loading products..."
          image={shopHeaderImage}
        />
        <div className="container px-3 py-4 mx-auto max-w-7xl sm:px-4">
          <CardSkeleton count={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="OUR COLLECTION" 
        subtitle={`${pagination.totalProducts} products available`}
        image={shopHeaderImage}
      />

      <div className="container px-3 py-4 mx-auto max-w-7xl sm:px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <SearchAutocomplete
              searchValue={filters.search}
              onSearchChange={handleSearchInput}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              onSuggestionClick={handleSuggestionClick}
            />
            <div className="mt-3">
              <ShopFilters
                categories={categories}
                selectedCategories={filters.category}
                onToggleCategory={toggleCategory}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onPriceChange={(type, value) => updateFilter(type, value)}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1 min-w-0">
            <ProductControls
              totalProducts={pagination.totalProducts}
              currentProductsCount={products.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortValue={filters.sort}
              onSortChange={(value) => updateFilter('sort', value)}
              sortOptions={sortOptions}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              isMobile={true}
            />

            {loading && !initialLoad && (
              <div className="flex justify-center py-8">
                <LoadingSpinner message="Updating results..." size="sm" fullScreen={false} />
              </div>
            )}

            {products.length === 0 && !loading ? (
              <div className="py-8 text-center bg-gray-900 border border-gray-800 rounded-xl">
                <FiPackage className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <h3 className="mb-1 text-sm font-semibold text-white">No products found</h3>
                <p className="mb-3 text-xs text-gray-400">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="relative px-4 py-2 overflow-hidden text-xs font-medium text-white transition-all rounded-full group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                  <span className="relative flex items-center gap-1">
                    Clear All
                    <BsArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <ProductGrid products={products} columns={3} />
            ) : (
              <ProductListView products={products} onAddToCart={handleAddToCart} />
            )}

            <ShopPagination
              currentPage={filters.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateFilter('page', page)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;