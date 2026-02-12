import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShoppingCartIcon,
  TagIcon,
  CubeIcon,
  ScaleIcon,
  EyeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  TruckIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon // ✅ ADDED THIS IMPORT
} from '@heroicons/react/24/outline';
import { productService } from '../../services/products';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageGallery from '../../components/common/ImageGallery';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [lowStockThreshold] = useState(10);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await productService.getById(id);
      
      if (response.success) {
        setProduct(response.data);
        if (showToast) {
          toast.success('Product details loaded');
        }
      } else {
        toast.error(response.error?.message || 'Failed to load product');
        navigate('/products');
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error('Failed to fetch product details');
      navigate('/products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProduct(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    const loadingToast = toast.loading('Deleting product...');
    
    try {
      const response = await productService.delete(id);
      
      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success('Product deleted successfully');
        navigate('/products');
      } else {
        toast.dismiss(loadingToast);
        toast.error(response.error?.message || 'Failed to delete product');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to delete product');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!product || product.status === newStatus) return;
    
    const loadingToast = toast.loading('Updating status...');
    
    try {
      const response = await productService.updateStatus(id, newStatus);
      
      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success(`Status changed to ${newStatus}`);
        setProduct(prev => ({ ...prev, status: newStatus }));
      } else {
        toast.dismiss(loadingToast);
        toast.error(response.error?.message || 'Failed to update status');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        icon: '✅',
        label: 'Active'
      },
      inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        icon: '⚫',
        label: 'Inactive'
      },
      out_of_stock: {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
        icon: '🟡',
        label: 'Out of Stock'
      },
      draft: {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-200',
        icon: '📝',
        label: 'Draft'
      },
      published: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        icon: '✅',
        label: 'Published'
      }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        <span className="mr-1.5 text-sm">{config.icon}</span>
        <span className="text-xs font-medium">{config.label}</span>
      </div>
    );
  };

  const getStockLevelBadge = (stock) => {
    if (stock <= 0) {
      return (
        <div className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1.5" />
          Out of Stock
        </div>
      );
    } else if (stock <= lowStockThreshold) {
      return (
        <div className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1.5" />
          Low Stock
        </div>
      );
    }
    return (
      <div className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CubeIcon className="h-3 w-3 mr-1.5" />
        In Stock
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
    { id: 'inventory', name: 'Inventory', icon: CubeIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'activity', name: 'Activity', icon: ClockIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4">
                <Link
                  to="/products"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Products
                </Link>
                <div className="h-6 border-l border-gray-300" />
                <div className="flex items-center space-x-3">
                  {getStatusBadge(product.status)}
                  {getStockLevelBadge(product.stock || product.quantity)}
                </div>
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 truncate">{product.name}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <p className="text-sm text-gray-600">SKU: {product.sku || 'Not specified'}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-600">Category: {product.category || 'Uncategorized'}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-600">ID: {product.id?.substring(0, 8)}...</p>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  
                  <Link
                    to={`/products/new?duplicate=${id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </Link>
                  
                  <Link
                    to={`/products/edit/${id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
                {product.images && product.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Primary Image */}
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].altText || product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                          e.target.onerror = null;
                        }}
                      />
                      {product.images[0].isPrimary && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-600 text-white">
                            Primary
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-3">
                        {product.images.slice(1).map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={image.url}
                              alt={image.altText || `${product.name} - Image ${index + 2}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                                e.target.onerror = null;
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <svg className="h-full w-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-shrink-0 px-6 py-3 text-sm font-medium border-b-2 flex items-center justify-center space-x-2
                        whitespace-nowrap
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                      <div className="prose max-w-none">
                        {product.description ? (
                          <div className="text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {product.description}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
                            No description provided.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                          Pricing Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Selling Price</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Cost Price</span>
                            <span className="text-sm font-medium text-gray-700">{formatCurrency(product.cost || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Profit Margin</span>
                            <span className={`text-sm font-medium ${product.cost ? 'text-green-600' : 'text-gray-700'}`}>
                              {product.cost && product.price > product.cost 
                                ? `${Math.round(((product.price - product.cost) / product.price) * 100)}%` 
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <CubeIcon className="h-4 w-4 mr-2" />
                          Inventory Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Current Stock</span>
                            <span className={`text-lg font-bold ${(product.stock || product.quantity) <= lowStockThreshold ? 'text-amber-600' : 'text-gray-900'}`}>
                              {formatNumber(product.stock || product.quantity)} units
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Low Stock Alert</span>
                            <span className="text-sm font-medium text-gray-700">{lowStockThreshold} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Stock Tracking</span>
                            <span className="text-sm font-medium text-gray-700">
                              {product.trackQuantity !== false ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <TagIcon className="h-4 w-4 mr-2" />
                          Product Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Inventory Management</h3>
                      <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Adjust Stock
                      </button>
                    </div>
                    
                    {product.stock <= lowStockThreshold && (
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-amber-900 mb-1">Stock Alert</h4>
                            <p className="text-sm text-amber-800">
                              Current stock is {formatNumber(product.stock || product.quantity)} units, which is {product.stock <= 0 ? 'out of stock' : 'below'} the {lowStockThreshold} unit threshold.
                              {product.stock > 0 && ' Consider restocking soon.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Available Stock</div>
                        <div className="text-2xl font-bold text-gray-900">{formatNumber(product.stock || product.quantity)}</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Low Stock Level</div>
                        <div className="text-2xl font-bold text-gray-900">{lowStockThreshold}</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Reorder Point</div>
                        <div className="text-2xl font-bold text-gray-900">{product.reorderLevel || 'Not set'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Product Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Total Sales</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">0</div>
                        <div className="text-sm text-gray-500">All time sales</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(0)}</div>
                        <div className="text-sm text-gray-500">All time revenue</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No recent activity recorded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={`/products/edit/${id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Product
                </Link>
                
                <button
                  onClick={() => handleStatusChange(product.status === 'active' ? 'inactive' : 'active')}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {product.status === 'active' || product.status === 'published' 
                    ? 'Set to Inactive' 
                    : 'Set to Active'}
                </button>
                
                <Link
                  to="/orders/new"
                  state={{ productId: id }}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Create Order
                </Link>
                
                <button
                  onClick={handleDelete}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Delete Product
                </button>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product ID</span>
                  <span className="text-xs font-mono text-gray-900">
                    {product.id?.substring(0, 8)}...
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-medium">{getStatusBadge(product.status)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(product.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(product.updatedAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SKU</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.sku || 'Not set'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Barcode</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.barcode || 'Not set'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weight</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.weight ? `${product.weight} ${product.weightUnit || 'kg'}` : 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {(product.dimensions || product.weight) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                <div className="space-y-4">
                  {product.weight && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weight</span>
                      <span className="text-sm font-medium text-gray-900">{product.weight} {product.weightUnit || 'kg'}</span>
                    </div>
                  )}
                  
                  {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dimensions</span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.dimensions.length || 0} × {product.dimensions.width || 0} × {product.dimensions.height || 0} {product.dimensions.unit || 'cm'}
                      </span>
                    </div>
                  )}
                  
                  {product.shippingClass && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shipping Class</span>
                      <span className="text-sm font-medium text-gray-900">{product.shippingClass}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Featured Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIcon className={`h-5 w-5 mr-2 ${product.featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-900">Featured Product</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.featured 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {product.featured ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">Track Quantity</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.trackQuantity !== false 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {product.trackQuantity !== false ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">Allow Backorders</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.allowOutOfStockPurchase 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {product.allowOutOfStockPurchase ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;