// admin/src/pages/Products/ProductDetails.jsx
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
  PlusIcon,
  CurrencyDollarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { productService } from '../../services/products';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

// Backend URL for images - IMPORTANT: Remove /api for images
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Create a base URL without /api for images
const IMAGE_BASE_URL = API_URL.replace('/api', '');

// Reliable fallback images from Unsplash
const FALLBACK_IMAGES = {
  main: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
  placeholder: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [lowStockThreshold] = useState(10);
  const [imageErrors, setImageErrors] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // ✅ FIXED: Get full image URL without /api
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // CRITICAL FIX: Remove any /api from the path
    let cleanPath = imagePath;
    if (cleanPath.includes('/api/')) {
      cleanPath = cleanPath.replace('/api/', '/');
    }
    
    // Handle different path formats
    if (cleanPath.startsWith('/uploads/')) {
      return `${IMAGE_BASE_URL}${cleanPath}`;
    }
    
    if (cleanPath.startsWith('uploads/')) {
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
    
    // Default: assume it's in products subfolder
    return `${IMAGE_BASE_URL}/uploads/products/${cleanPath}`;
  };

  // ✅ FIXED: Comprehensive image extraction from various data structures
  const extractImagesFromProduct = (productData) => {
    if (!productData) return [];
    
    let images = [];
    
    // Case 1: productData.images is an array
    if (productData.images && Array.isArray(productData.images)) {
      productData.images.forEach((img, index) => {
        if (typeof img === 'object' && img !== null) {
          // Object with url property
          if (img.url) {
            images.push({
              url: getFullImageUrl(img.url),
              altText: img.altText || productData.name || `Image ${index + 1}`,
              isPrimary: img.isPrimary || index === 0,
              id: img._id || img.id || index
            });
          } 
          // Object with direct string value
          else {
            const url = Object.values(img).find(v => typeof v === 'string' && (v.includes('uploads') || v.includes('images')));
            if (url) {
              images.push({
                url: getFullImageUrl(url),
                altText: productData.name || `Image ${index + 1}`,
                isPrimary: index === 0,
                id: index
              });
            }
          }
        } else if (typeof img === 'string') {
          // Direct string URL
          images.push({
            url: getFullImageUrl(img),
            altText: productData.name || `Image ${index + 1}`,
            isPrimary: index === 0,
            id: index
          });
        }
      });
    }
    
    // Case 2: productData.image is a string
    else if (productData.image && typeof productData.image === 'string') {
      images.push({
        url: getFullImageUrl(productData.image),
        altText: productData.name || 'Product image',
        isPrimary: true,
        id: 'primary'
      });
    }
    
    // Case 3: productData.image is an object
    else if (productData.image && typeof productData.image === 'object') {
      images.push({
        url: getFullImageUrl(productData.image.url || ''),
        altText: productData.image.altText || productData.name || 'Product image',
        isPrimary: true,
        id: productData.image._id || 'primary'
      });
    }
    
    // Case 4: Check for common image field names
    if (images.length === 0) {
      const possibleFields = ['thumbnail', 'photo', 'picture', 'img', 'cover', 'mainImage'];
      for (const field of possibleFields) {
        if (productData[field]) {
          images.push({
            url: getFullImageUrl(productData[field]),
            altText: productData.name || 'Product image',
            isPrimary: true,
            id: field
          });
          break;
        }
      }
    }
    
    // Filter out any null/undefined URLs and deduplicate
    images = images.filter(img => img && img.url);
    
    // Remove duplicates by URL
    const uniqueUrls = new Set();
    images = images.filter(img => {
      if (uniqueUrls.has(img.url)) return false;
      uniqueUrls.add(img.url);
      return true;
    });
    
    return images;
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async (showToast = false) => {
    try {
      setLoading(true);
      
      const response = await productService.getById(id);
      
      if (response.success) {
        const productData = response.data || response.product || response;
        
        // Extract images using our comprehensive function
        const extractedImages = extractImagesFromProduct(productData);
        
        // Create enhanced product object with images
        const enhancedProduct = {
          ...productData,
          images: extractedImages,
          hasImages: extractedImages.length > 0
        };
        
        setProduct(enhancedProduct);
        
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

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    console.error(`❌ Image ${index} failed to load`);
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
      published: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        icon: '✅',
        label: 'Published'
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
    const stockValue = stock || 0;
    if (stockValue <= 0) {
      return (
        <div className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1.5" />
          Out of Stock
        </div>
      );
    } else if (stockValue <= lowStockThreshold) {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
            <ExclamationTriangleIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Product Not Found</h2>
          <p className="mb-6 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
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

  const productImages = product.images || [];
  const hasImages = productImages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-4">
                <Link
                  to="/products"
                  className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Products
                </Link>
                <div className="h-6 border-l border-gray-300" />
                <div className="flex items-center space-x-3">
                  {getStatusBadge(product.status)}
                  {getStockLevelBadge(product.stock || product.quantity)}
                </div>
              </div>
              
              <div className="flex flex-col mt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 truncate">{product.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <p className="text-sm text-gray-600">SKU: {product.sku || 'Not specified'}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-600">Category: {product.category || 'Uncategorized'}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-600">ID: {product._id?.substring(0, 8) || product.id?.substring(0, 8)}...</p>
                  </div>
                </div>
                
                <div className="flex items-center mt-4 space-x-3 sm:mt-0">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  
                  <Link
                    to={`/products/new?duplicate=${id}`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Duplicate
                  </Link>
                  
                  <Link
                    to={`/products/edit/${id}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Product Images */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
                  <span className="text-sm text-gray-500">
                    {hasImages ? `${productImages.length} image(s)` : 'No images'}
                  </span>
                </div>
                
                {hasImages ? (
                  <div className="space-y-4">
                    {/* Main Selected Image */}
                    <div className="relative overflow-hidden border border-gray-200 rounded-lg aspect-square bg-gray-50">
                      <img
                        key={`main-image-${selectedImageIndex}`}
                        src={productImages[selectedImageIndex]?.url}
                        alt={productImages[selectedImageIndex]?.altText || product.name}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGES.main;
                          e.target.onerror = null;
                        }}
                      />
                      
                      {productImages.length > 1 && (
                        <div className="absolute flex space-x-2 bottom-3 right-3">
                          <button
                            onClick={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}
                            disabled={selectedImageIndex === 0}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => setSelectedImageIndex(prev => Math.min(productImages.length - 1, prev + 1))}
                            disabled={selectedImageIndex === productImages.length - 1}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            →
                          </button>
                        </div>
                      )}
                      
                      {productImages[selectedImageIndex]?.isPrimary && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-600 text-white">
                            Primary
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {productImages.length > 1 && (
                      <div className="grid grid-cols-5 gap-3">
                        {productImages.map((image, index) => (
                          <button
                            key={`thumbnail-${index}`}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index
                                ? 'border-blue-600 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={image.altText}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.src = FALLBACK_IMAGES.thumbnail;
                                e.target.onerror = null;
                              }}
                            />
                            {image.isPrimary && (
                              <div className="absolute w-2 h-2 bg-blue-600 rounded-full top-1 right-1"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg aspect-square">
                    <div className="text-center">
                      <img
                        src={FALLBACK_IMAGES.placeholder}
                        alt="No images available"
                        className="object-cover w-32 h-32 mx-auto mb-3 rounded-lg opacity-50"
                      />
                      <p className="text-sm text-gray-500">No images available for this product</p>
                      <Link
                        to={`/products/edit/${id}`}
                        className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Images
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
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
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 text-lg font-medium text-gray-900">Description</h3>
                      <div className="prose max-w-none">
                        {product.description ? (
                          <div className="p-4 text-gray-600 whitespace-pre-line border border-gray-200 rounded-lg bg-gray-50">
                            {product.description}
                          </div>
                        ) : (
                          <p className="p-4 italic text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                            No description provided.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="flex items-center mb-3 text-sm font-medium text-gray-900">
                          <CurrencyDollarIcon className="w-4 h-4 mr-2" />
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

                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="flex items-center mb-3 text-sm font-medium text-gray-900">
                          <CubeIcon className="w-4 h-4 mr-2" />
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
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="flex items-center mb-3 text-sm font-medium text-gray-900">
                          <TagIcon className="w-4 h-4 mr-2" />
                          Product Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-full"
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
                      <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors border border-blue-200 rounded-lg hover:text-blue-800 hover:bg-blue-50">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Adjust Stock
                      </button>
                    </div>
                    
                    {(product.stock || product.quantity) <= lowStockThreshold && (
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
                          <div>
                            <h4 className="mb-1 text-sm font-medium text-amber-900">Stock Alert</h4>
                            <p className="text-sm text-amber-800">
                              Current stock is {formatNumber(product.stock || product.quantity)} units, which is {(product.stock || product.quantity) <= 0 ? 'out of stock' : 'below'} the {lowStockThreshold} unit threshold.
                              {(product.stock || product.quantity) > 0 && ' Consider restocking soon.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="mb-1 text-sm text-gray-600">Available Stock</div>
                        <div className="text-2xl font-bold text-gray-900">{formatNumber(product.stock || product.quantity)}</div>
                      </div>
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="mb-1 text-sm text-gray-600">Low Stock Level</div>
                        <div className="text-2xl font-bold text-gray-900">{lowStockThreshold}</div>
                      </div>
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="mb-1 text-sm text-gray-600">Reorder Point</div>
                        <div className="text-2xl font-bold text-gray-900">{product.reorderLevel || 'Not set'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Product Analytics</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="mb-2 text-sm text-gray-600">Total Sales</div>
                        <div className="mb-2 text-3xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-500">All time sales</div>
                      </div>
                      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="mb-2 text-sm text-gray-600">Total Revenue</div>
                        <div className="mb-2 text-3xl font-bold text-gray-900">{formatCurrency(0)}</div>
                        <div className="text-sm text-gray-500">All time revenue</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <div className="py-12 text-center border border-gray-200 rounded-lg bg-gray-50">
                      <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={`/products/edit/${id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit Product
                </Link>
                
                <button
                  onClick={() => handleStatusChange(product.status === 'active' || product.status === 'published' ? 'inactive' : 'active')}
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
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Create Order
                </Link>
                
                <button
                  onClick={handleDelete}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Delete Product
                </button>
              </div>
            </div>

            {/* Product Information */}
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Product Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product ID</span>
                  <span className="font-mono text-xs text-gray-900">
                    {product._id?.substring(0, 8) || product.id?.substring(0, 8)}...
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
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Shipping Information</h3>
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
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Product Status</h3>
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