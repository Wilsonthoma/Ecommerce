import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { productService } from '../../services/products';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CATEGORIES = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Cameras',
  'Headphones',
  'Speakers'
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' }
];

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    lowStock: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const IMAGE_BASE_URL = API_URL.replace('/api', '');

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    let cleanPath = imagePath;
    if (cleanPath.includes('/api/')) cleanPath = cleanPath.replace('/api/', '/');
    if (cleanPath.startsWith('/uploads/')) return `${IMAGE_BASE_URL}${cleanPath}`;
    if (cleanPath.startsWith('uploads/')) return `${IMAGE_BASE_URL}/${cleanPath}`;
    return `${IMAGE_BASE_URL}/uploads/products/${cleanPath}`;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll({ limit: 100 });
      
      if (response.success) {
        let productArray = [];
        if (Array.isArray(response.data)) productArray = response.data;
        else if (response.data?.products) productArray = response.data.products;
        else if (response.data?.data && Array.isArray(response.data.data)) productArray = response.data.data;
        else productArray = [];

        setProducts(productArray);
        
        const active = productArray.filter(p => p.status === 'active').length;
        const outOfStock = productArray.filter(p => (p.stock || p.quantity || 0) <= 0).length;
        const lowStock = productArray.filter(p => (p.stock || p.quantity || 0) > 0 && (p.stock || p.quantity || 0) <= 5).length;
        
        setStats({
          total: productArray.length,
          active,
          outOfStock,
          lowStock
        });
      } else {
        toast.error(response.error?.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    const loadingToast = toast.loading('Deleting product...');
    try {
      const response = await productService.delete(id);
      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.dismiss(loadingToast);
        toast.error(response.error?.message || 'Failed to delete product');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to delete product');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setShowFilters(false);
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'Active' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📝', label: 'Draft' },
      archived: { bg: 'bg-slate-100', text: 'text-slate-800', icon: '📦', label: 'Archived' }
    };
    const c = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <span className="mr-1.5">{c.icon}</span>
        {c.label}
      </span>
    );
  };

  const getStockBadge = (product) => {
    const stock = product.stock || product.quantity || 0;
    const trackQuantity = product.trackQuantity !== false;
    
    if (!trackQuantity) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Not Tracked
        </span>
      );
    }
    
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    }
    
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Low Stock ({stock})
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        In Stock ({stock})
      </span>
    );
  };

  const getBadge = (product) => {
    const badges = [];
    if (product.featured) badges.push({ color: 'yellow', label: 'Featured' });
    if (product.isTrending) badges.push({ color: 'orange', label: 'Trending' });
    if (product.isFlashSale) badges.push({ color: 'red', label: 'Flash Sale' });
    if (product.isJustArrived) badges.push({ color: 'green', label: 'New' });
    
    if (badges.length === 0) return null;
    
    const badge = badges[0];
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      green: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${colorClasses[badge.color]}`}>
        {badge.label}
      </span>
    );
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Products</h1>
              <p className="text-gray-400">Manage your electronics store inventory</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <Link
                to="/products/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="flex items-center text-sm text-gray-400">
                <CubeIcon className="h-4 w-4 mr-1.5" />
                Total Products
              </div>
            </div>
            
            <div className="p-4 border border-green-800 rounded-lg bg-green-900/30">
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
              <div className="flex items-center text-sm text-green-400">
                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                Active
              </div>
            </div>
            
            <div className="p-4 border border-red-800 rounded-lg bg-red-900/30">
              <div className="text-2xl font-bold text-red-400">{stats.outOfStock}</div>
              <div className="flex items-center text-sm text-red-400">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />
                Out of Stock
              </div>
            </div>
            
            <div className="p-4 border border-yellow-800 rounded-lg bg-yellow-900/30">
              <div className="text-2xl font-bold text-yellow-400">{stats.lowStock}</div>
              <div className="flex items-center text-sm text-yellow-400">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />
                Low Stock
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 text-white placeholder-gray-500 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="overflow-x-auto bg-gray-800 border border-gray-700 rounded-xl">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Product</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-300 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-300 uppercase">Stock</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 mr-3 overflow-hidden bg-gray-700 rounded-lg">
                          {product.images?.[0]?.url || product.image ? (
                            <img
                              src={getFullImageUrl(product.images?.[0]?.url || product.image)}
                              alt={product.name}
                              className="object-cover w-full h-full"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=No+Img'}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <CubeIcon className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link to={`/products/${product._id}`} className="text-sm font-medium text-white hover:text-yellow-500">
                              {product.name}
                            </Link>
                            {getBadge(product)}
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            SKU: {product.sku || 'N/A'} | ID: {product._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{product.category || 'Uncategorized'}</span>
                      {product.subcategory && (
                        <div className="text-xs text-gray-500">{product.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-sm font-medium text-yellow-500">{formatCurrency(product.price)}</div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-xs text-gray-400 line-through">{formatCurrency(product.comparePrice)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {getStockBadge(product)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/products/${product._id}`}
                          className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/products/edit/${product._id}`}
                          className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
                          title="Edit Product"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Product"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 mb-4 border-2 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
                        <p className="text-gray-400">Loading products...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ArchiveBoxIcon className="w-16 h-16 mb-4 text-gray-600" />
                        <p className="mb-2 text-gray-400">No products found</p>
                        {hasActiveFilters ? (
                          <button
                            onClick={clearFilters}
                            className="text-yellow-500 hover:text-yellow-400"
                          >
                            Clear filters
                          </button>
                        ) : (
                          <Link
                            to="/products/new"
                            className="inline-flex items-center px-4 py-2 mt-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                          >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Your First Product
                          </Link>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;