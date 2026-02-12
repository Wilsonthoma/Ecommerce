import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PhotoIcon,
  ArrowPathIcon,
  CubeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { productService } from '../../services/products';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import { formatCurrency, formatDate } from '../../utils/formatters';
import BulkActions from '../../components/products/BulkActions';
import ExportProducts from '../../components/products/ExportProducts';
import FiltersPanel from '../../components/products/FiltersPanel';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    lowStock: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priceRange: { min: '', max: '' },
    stockRange: { min: '', max: '' },
    dateRange: { start: '', end: '' },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Add your server's base URL
    const baseUrl = 'http://localhost:5000';
    
    // If path already starts with /, just prepend baseUrl
    if (imagePath.startsWith('/')) {
      return `${baseUrl}${imagePath}`;
    }
    
    // Default: assume it's relative to uploads
    return `${baseUrl}/uploads/${imagePath}`;
  };

  // Fetch products with better error handling
  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      setLoading(true);
      const response = await productService.getAll({
        ...filters,
        page: 1,
        limit: 100
      });
      
      console.log('API Response:', response);
      
      if (response.success) {
        // Handle different response structures
        let productArray = [];
        
        if (Array.isArray(response.data)) {
          productArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          productArray = response.data.data;
        } else if (response.data?.products && Array.isArray(response.data.products)) {
          productArray = response.data.products;
        } else if (response.data?.results && Array.isArray(response.data.results)) {
          productArray = response.data.results;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          productArray = response.data.items;
        } else if (response.data && typeof response.data === 'object') {
          const data = response.data;
          const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
          if (arrayKeys.length > 0) {
            productArray = data[arrayKeys[0]];
          } else if (data._id || data.id) {
            productArray = [data];
          } else {
            console.warn('No array found in response:', data);
          }
        } else {
          console.warn('Unexpected response structure:', response);
        }
        
        // Ensure productArray is an array
        productArray = Array.isArray(productArray) ? productArray : [];
        console.log('Product array:', productArray);
        
        // Log image URLs for debugging
        console.log('Products with images:', productArray.map(p => ({
          id: p._id,
          name: p.name,
          image: p.image,
          images: p.images,
          thumbnail: p.thumbnail,
          fullImageUrl: getFullImageUrl(p.image || p.images?.[0]?.url || p.thumbnail)
        })));
        
        setProducts(productArray);
        
        // Calculate stats
        const active = productArray.filter(p => p.status === 'active' || p.status === 'published').length;
        const outOfStock = productArray.filter(p => {
          const stock = p.stock || p.quantity || p.inventory || 0;
          return stock <= 0;
        }).length;
        const lowStock = productArray.filter(p => {
          const stock = p.stock || p.quantity || p.inventory || 0;
          return stock > 0 && stock <= 10;
        }).length;
        
        setStats({
          total: productArray.length,
          active,
          outOfStock,
          lowStock
        });
      } else {
        console.error('API Error:', response.error);
        toast.error(response.error?.message || 'Failed to fetch products');
        setProducts([]);
        setStats({
          total: 0,
          active: 0,
          outOfStock: 0,
          lowStock: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products. Please check your connection.');
      setProducts([]);
      setStats({
        total: 0,
        active: 0,
        outOfStock: 0,
        lowStock: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Test image URLs on products change
  useEffect(() => {
    if (products.length > 0) {
      console.log('Testing image URLs:');
      products.forEach((product, index) => {
        const imagePath = product.image || product.images?.[0]?.url || product.thumbnail;
        if (imagePath) {
          const fullUrl = getFullImageUrl(imagePath);
          console.log(`Product ${index + 1} (${product.name || 'Unnamed'}):`);
          console.log('  Raw image path:', imagePath);
          console.log('  Full URL:', fullUrl);
          
          // Test if the image exists
          const img = new Image();
          img.src = fullUrl;
          img.onload = () => console.log(`  ✅ Image loads successfully: ${fullUrl}`);
          img.onerror = () => console.log(`  ❌ Image failed to load: ${fullUrl}`);
        } else {
          console.log(`Product ${index + 1} (${product.name || 'Unnamed'}): No image found`);
        }
      });
    }
  }, [products]);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        (product.name?.toLowerCase() || '').includes(query) ||
        (product.description?.toLowerCase() || '').includes(query) ||
        (product.category?.toLowerCase() || '').includes(query) ||
        (product.sku?.toLowerCase() || '').includes(query) ||
        (product.tags?.join(' ')?.toLowerCase() || '').includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    // Price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      const min = parseFloat(filters.priceRange.min) || 0;
      const max = parseFloat(filters.priceRange.max) || Infinity;
      filtered = filtered.filter(product => {
        const price = product.price || product.unitPrice || 0;
        return price >= min && price <= max;
      });
    }

    // Stock range filter
    if (filters.stockRange.min || filters.stockRange.max) {
      const min = parseInt(filters.stockRange.min) || 0;
      const max = parseInt(filters.stockRange.max) || Infinity;
      filtered = filtered.filter(product => {
        const stock = product.stock || product.quantity || product.inventory || 0;
        return stock >= min && stock <= max;
      });
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      
      filtered = filtered.filter(product => {
        const productDate = new Date(product.createdAt || product.createdDate || Date.now());
        if (start && productDate < start) return false;
        if (end && productDate > end) return false;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'price':
          aValue = a.price || a.unitPrice || 0;
          bValue = b.price || b.unitPrice || 0;
          break;
        case 'stock':
          aValue = a.stock || a.quantity || a.inventory || 0;
          bValue = b.stock || b.quantity || b.inventory || 0;
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || a.createdDate || 0);
          bValue = new Date(b.createdAt || b.createdDate || 0);
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

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

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} selected products?`)) {
      return;
    }

    const loadingToast = toast.loading(`Deleting ${selectedRows.length} products...`);
    
    try {
      const deletePromises = selectedRows.map(id => productService.delete(id));
      await Promise.all(deletePromises);
      
      toast.dismiss(loadingToast);
      toast.success(`${selectedRows.length} products deleted successfully`);
      setSelectedRows([]);
      fetchProducts();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to delete some products');
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedRows.length === 0) return;
    
    const loadingToast = toast.loading(`Updating ${selectedRows.length} products...`);
    
    try {
      const updatePromises = selectedRows.map(id => 
        productService.update(id, { status })
      );
      await Promise.all(updatePromises);
      
      toast.dismiss(loadingToast);
      toast.success(`${selectedRows.length} products updated to ${status}`);
      setSelectedRows([]);
      fetchProducts();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update some products');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      priceRange: { min: '', max: '' },
      stockRange: { min: '', max: '' },
      dateRange: { start: '', end: '' },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchQuery('');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { color: 'emerald', icon: '✅', label: 'Active' },
      'published': { color: 'emerald', icon: '✅', label: 'Published' },
      'inactive': { color: 'gray', icon: '⚫', label: 'Inactive' },
      'out_of_stock': { color: 'red', icon: '⛔', label: 'Out of Stock' },
      'draft': { color: 'yellow', icon: '📝', label: 'Draft' },
      'archived': { color: 'slate', icon: '📦', label: 'Archived' },
    };

    const config = statusMap[status] || { color: 'gray', icon: '❓', label: status || 'Unknown' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800 border border-${config.color}-200`}>
        <span className="mr-1.5">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getStockBadge = (stock) => {
    const stockValue = stock || 0;
    if (stockValue <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Out of Stock
        </span>
      );
    } else if (stockValue <= 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          In Stock
        </span>
      );
    }
  };

  const columns = [
    {
      key: 'selection',
      title: (
        <input
          type="checkbox"
          checked={selectedRows.length === filteredProducts.length && filteredProducts.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(filteredProducts.map(p => p._id || p.id));
            } else {
              setSelectedRows([]);
            }
          }}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      ),
      render: (_, product) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(product._id || product.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(prev => [...prev, product._id || product.id]);
            } else {
              setSelectedRows(prev => prev.filter(id => id !== (product._id || product.id)));
            }
          }}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
      ),
      className: 'w-12',
    },
    {
      key: 'image',
      title: 'Image',
      render: (_, product) => {
        // Get image URL from different possible fields
        let imageUrl = null;
        
        if (product.images && product.images.length > 0) {
          // Check if images is an array of objects or strings
          const firstImage = product.images[0];
          imageUrl = typeof firstImage === 'object' ? firstImage.url : firstImage;
        } else if (product.image) {
          imageUrl = product.image;
        } else if (product.thumbnail) {
          imageUrl = product.thumbnail;
        }
        
        // Convert to full URL
        const fullImageUrl = imageUrl ? getFullImageUrl(imageUrl) : null;
        
        console.log(`Rendering image for product "${product.name}":`, {
          rawImageUrl: imageUrl,
          fullImageUrl: fullImageUrl,
          product: product
        });
        
        const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik01MCA2MEM1MCA2Ni42Mjg4IDU1LjM3MTYgNzIgNjIgNzJDNjguNjI4NCA3MiA3NCA2Ni42Mjg0IDc0IDYwQzc0IDUzLjM3MTYgNjguNjI4NCA0OCA2MiA0OEM1NS4zNzE2IDQ4IDUwIDUzLjM3MTYgNTAgNjBaIiBmaWxsPSIjRENEQ0RDIi8+CjxwYXRoIGQ9Ik00Mi41IDEwMEwxMS4yNSAxMDBDMTEuMjUgMTAwIDE4LjUzOTEgNzkuMDMzNyAzMC41MzkxIDc5LjAzMzdDMzYuNDI0OCA3OS4wMzM3IDQxLjg3IDgzLjgxODQgNDIuNSAxMDBaIiBmaWxsPSIjRENEQ0RDIi8+CjxwYXRoIGQ9Ik0xMDcuNSAxMDBMMTM4Ljc1IDEwMEwxMzguNzUgMTAwIDEzMS40NjEgNzkuMDMzNyAxMTkuNDYxIDc5LjAzMzdDMTEzLjU3NSA3OS4wMzM3IDEwOC4xMyA4My44MTg0IDEwNy41IDEwMFoiIGZpbGw9IiNEQ0RDREMiLz4KPHBhdGggZD0iTTc1IDEyMEMzNS45MTUyIDEyMCA1IDEzMy45MTUyIDUgMTYwSDE0NUMxNDUgMTMzLjkxNTIgMTE0LjA4NSAxMjAgNzUgMTIwWiIgZmlsbD0iI0RDREJEQiIvPgo8L3N2Zz4K';
        
        return (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {fullImageUrl ? (
              <>
                <img
                  src={fullImageUrl}
                  alt={product.name || 'Product image'}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log(`✅ Image loaded: ${fullImageUrl}`)}
                  onError={(e) => {
                    console.error(`❌ Failed to load image: ${fullImageUrl}`, e);
                    e.target.src = fallbackUrl;
                    e.target.onerror = null;
                  }}
                  loading="lazy"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-tl-lg opacity-75">
                  ✓
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PhotoIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
            {product.featured && (
              <div className="absolute top-0 left-0 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-br-lg">
                ★
              </div>
            )}
          </div>
        );
      },
      className: 'w-16',
    },
    {
      key: 'name',
      title: 'Product',
      sortable: true,
      render: (name, product) => {
        const productName = name || 'Unnamed Product';
        const productId = product._id || product.id;
        
        return (
          <div className="min-w-0 max-w-xs">
            <div className="flex items-center">
              <Link
                to={`/products/${productId}`}
                className="font-medium text-gray-900 hover:text-blue-600 truncate transition-colors"
                title={productName}
              >
                {productName}
              </Link>
              {product.featured && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Featured
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate mt-1">
              SKU: {product.sku || 'N/A'} • {product.category || 'Uncategorized'}
            </div>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {product.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {product.tags.length > 2 && (
                  <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    +{product.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (price) => (
        <div className="font-medium text-gray-900 text-right">
          {formatCurrency(price || 0)}
        </div>
      ),
      className: 'text-right',
    },
    {
      key: 'stock',
      title: 'Stock',
      sortable: true,
      render: (stock, product) => {
        const stockValue = stock || product.quantity || product.inventory || 0;
        return (
          <div className="text-right">
            <div className="font-medium text-gray-900 mb-1">
              {stockValue.toLocaleString()}
            </div>
            {getStockBadge(stockValue)}
          </div>
        );
      },
      className: 'text-right',
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (date) => (
        <div className="text-sm text-gray-600">
          {formatDate(date)}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, product) => {
        const productId = product._id || product.id;
        
        return (
          <div className="flex items-center justify-end space-x-2">
            <Link
              to={`/products/${productId}`}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="View details"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
            <Link
              to={`/products/edit/${productId}`}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleDelete(productId)}
              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        );
      },
      className: 'w-32',
    },
  ];

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">Manage your store's products inventory</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowExport(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? (
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                )}
                Refresh
              </button>
              
              <Link
                to="/products/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600 flex items-center">
                <CubeIcon className="h-4 w-4 mr-1.5" />
                Total Products
              </div>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700">{stats.active.toLocaleString()}</div>
              <div className="text-sm text-emerald-600 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                Active
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{stats.outOfStock.toLocaleString()}</div>
              <div className="text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
                Out of Stock
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{stats.lowStock.toLocaleString()}</div>
              <div className="text-sm text-yellow-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
                Low Stock
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search products by name, SKU, category, or tags..."
                onSearch={handleSearch}
                value={searchQuery}
                className="w-full"
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                  showFilters || Object.values(filters).some(v => 
                    typeof v === 'string' ? v : Object.values(v).some(subV => subV)
                  )
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
                {(showFilters || Object.values(filters).some(v => 
                  typeof v === 'string' ? v : Object.values(v).some(subV => subV)
                )) && (
                  <span className="ml-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {Object.values(filters).filter(v => 
                      typeof v === 'string' ? v : Object.values(v).some(subV => subV)
                    ).length}
                  </span>
                )}
              </button>
              
              <button
                onClick={clearFilters}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Clear
              </button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4">
              <FiltersPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <BulkActions
              selectedCount={selectedRows.length}
              onBulkDelete={handleBulkDelete}
              onBulkStatusChange={handleBulkStatusChange}
              onClearSelection={() => setSelectedRows([])}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredProducts}
            loading={loading}
            emptyMessage={
              <div className="text-center py-16">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </>
                ) : (
                  <>
                    <ArchiveBoxIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchQuery || Object.values(filters).some(v => 
                        typeof v === 'string' ? v : Object.values(v).some(subV => subV)
                      )
                        ? 'No products match your search criteria. Try adjusting your filters or search term.'
                        : 'Get started by adding your first product to your store.'
                      }
                    </p>
                    {(!searchQuery && !Object.values(filters).some(v => 
                      typeof v === 'string' ? v : Object.values(v).some(subV => subV)
                    )) && (
                      <Link
                        to="/products/new"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Your First Product
                      </Link>
                    )}
                  </>
                )}
              </div>
            }
            pagination
            currentPage={1}
            totalPages={Math.ceil(filteredProducts.length / 10)}
            totalItems={filteredProducts.length}
            itemsPerPage={10}
            onSort={(key, order) => handleFilterChange({ sortBy: key, sortOrder: order })}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
          />
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <ExportProducts
          onClose={() => setShowExport(false)}
          products={filteredProducts}
          filters={filters}
        />
      )}
    </div>
  );
};

export default ProductList;