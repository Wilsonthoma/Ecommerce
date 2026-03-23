import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  InformationCircleIcon,
  PhotoIcon,
  FireIcon,
  BoltIcon,
  SparklesIcon,
  StarIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { productService } from '../../services/products';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const IMAGE_BASE_URL = API_URL.replace('/api', '');

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    let cleanPath = imagePath;
    if (cleanPath.includes('/api/')) cleanPath = cleanPath.replace('/api/', '/');
    if (cleanPath.startsWith('/uploads/')) return `${IMAGE_BASE_URL}${cleanPath}`;
    if (cleanPath.startsWith('uploads/')) return `${IMAGE_BASE_URL}/${cleanPath}`;
    return `${IMAGE_BASE_URL}/uploads/products/${cleanPath}`;
  };

  const extractImages = (productData) => {
    if (!productData) return [];
    let images = [];
    
    if (productData.images && Array.isArray(productData.images)) {
      images = productData.images.map((img, index) => {
        if (typeof img === 'object' && img.url) {
          return {
            url: getFullImageUrl(img.url),
            altText: img.altText || productData.name,
            isPrimary: img.isPrimary || index === 0,
            id: img._id || img.id || index
          };
        } else if (typeof img === 'string') {
          return {
            url: getFullImageUrl(img),
            altText: productData.name,
            isPrimary: index === 0,
            id: index
          };
        }
        return null;
      }).filter(Boolean);
    } else if (productData.image) {
      images = [{
        url: getFullImageUrl(productData.image),
        altText: productData.name,
        isPrimary: true,
        id: 'primary'
      }];
    }
    return images;
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(id);
      
      if (response.success) {
        const productData = response.data || response.product || response;
        const images = extractImages(productData);
        
        setProduct({
          ...productData,
          images,
          hasImages: images.length > 0
        });
      } else {
        toast.error(response.error?.message || 'Failed to load product');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product');
      navigate('/products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProduct();
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    const toastId = toast.loading('Deleting product...');
    try {
      const response = await productService.delete(id);
      if (response.success) {
        toast.dismiss(toastId);
        toast.success('Product deleted successfully');
        navigate('/products');
      } else {
        toast.dismiss(toastId);
        toast.error(response.error?.message || 'Failed to delete');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to delete product');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'Active' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📝', label: 'Draft' },
      archived: { bg: 'bg-slate-100', text: 'text-slate-800', icon: '📦', label: 'Archived' }
    };
    const c = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
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
          <ClockIcon className="w-3 h-3 mr-1" />
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

  const tabs = [
    { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
    { id: 'inventory', name: 'Inventory', icon: CubeIcon },
    { id: 'shipping', name: 'Shipping', icon: TruckIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 mb-4 border-2 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="mb-2 text-2xl font-bold text-white">Product Not Found</h2>
          <p className="mb-6 text-gray-400">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="inline-flex items-center px-4 py-2 text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const stock = product.stock || product.quantity || 0;
  const images = product.images || [];
  const hasImages = images.length > 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <Link to="/products" className="inline-flex items-center mb-2 text-sm text-gray-400 hover:text-yellow-500">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Products
              </Link>
              <h1 className="text-2xl font-bold text-white">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm text-gray-400">SKU: {product.sku || 'N/A'}</span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-400">Category: {product.category || 'Uncategorized'}</span>
                {product.subcategory && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-400">Subcategory: {product.subcategory}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to={`/products/edit/${id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Product
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-400 border border-red-600 rounded-lg hover:bg-red-900/20"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product Images */}
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Product Images</h2>
                <span className="text-sm text-gray-500">{hasImages ? `${images.length} image(s)` : 'No images'}</span>
              </div>
              
              {hasImages ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden bg-gray-700 rounded-lg aspect-square">
                    <img
                      src={images[selectedImageIndex]?.url}
                      alt={images[selectedImageIndex]?.altText || product.name}
                      className="object-contain w-full h-full"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                      }}
                    />
                    {images.length > 1 && (
                      <div className="absolute flex space-x-2 bottom-3 right-3">
                        <button
                          onClick={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}
                          disabled={selectedImageIndex === 0}
                          className="p-2 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 disabled:opacity-50"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                          disabled={selectedImageIndex === images.length - 1}
                          className="p-2 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 disabled:opacity-50"
                        >
                          →
                        </button>
                      </div>
                    )}
                    {images[selectedImageIndex]?.isPrimary && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs text-white bg-yellow-600 rounded">Primary</span>
                      </div>
                    )}
                  </div>
                  
                  {images.length > 1 && (
                    <div className="grid grid-cols-5 gap-3">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.altText}
                            className="object-cover w-full h-full"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=No+Img'}
                          />
                          {image.isPrimary && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-700 rounded-lg aspect-square">
                  <div className="text-center">
                    <PhotoIcon className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-sm text-gray-400">No images available</p>
                    <Link
                      to={`/products/edit/${id}`}
                      className="inline-flex items-center mt-3 text-sm text-yellow-500 hover:text-yellow-400"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Images
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
              <h2 className="mb-4 text-lg font-semibold text-white">Description</h2>
              <p className="text-gray-300 whitespace-pre-line">
                {product.description || 'No description provided.'}
              </p>
            </div>

            {/* Tabs Content */}
            <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
              <div className="border-b border-gray-700">
                <nav className="flex">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-b-2 border-yellow-500 text-yellow-500'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-gray-400">Pricing</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price</span>
                          <span className="font-semibold text-white">{formatCurrency(product.price)}</span>
                        </div>
                        {product.comparePrice && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Compare at</span>
                            <span className="text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
                          </div>
                        )}
                        {product.costPerItem && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Cost</span>
                            <span className="text-gray-300">{formatCurrency(product.costPerItem)}</span>
                          </div>
                        )}
                        {product.comparePrice && product.comparePrice > product.price && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Discount</span>
                            <span className="text-green-500">
                              -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-gray-400">Product Badges</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.featured && <span className="flex items-center px-3 py-1 text-sm text-yellow-500 rounded-full bg-yellow-600/20"><StarIcon className="w-3 h-3 mr-1" />Featured</span>}
                        {product.isTrending && <span className="flex items-center px-3 py-1 text-sm text-orange-500 rounded-full bg-orange-600/20"><FireIcon className="w-3 h-3 mr-1" />Trending</span>}
                        {product.isFlashSale && <span className="flex items-center px-3 py-1 text-sm text-red-500 rounded-full bg-red-600/20"><BoltIcon className="w-3 h-3 mr-1" />Flash Sale</span>}
                        {product.isJustArrived && <span className="flex items-center px-3 py-1 text-sm text-green-500 rounded-full bg-green-600/20"><SparklesIcon className="w-3 h-3 mr-1" />Just Arrived</span>}
                      </div>
                      {product.flashSaleEndDate && product.isFlashSale && (
                        <div className="pt-3 mt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400">Flash Sale ends: {formatDate(product.flashSaleEndDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-400">Stock Management</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Track Quantity</span>
                            <span className={product.trackQuantity !== false ? 'text-green-500' : 'text-gray-400'}>
                              {product.trackQuantity !== false ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          {product.trackQuantity !== false && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Current Stock</span>
                                <div className="text-right">
                                  <span className={`font-semibold ${isLowStock ? 'text-yellow-500' : stock <= 0 ? 'text-red-500' : 'text-white'}`}>
                                    {formatNumber(stock)}
                                  </span>
                                  {stock <= 5 && stock > 0 && (
                                    <div className="mt-1 text-xs text-yellow-500">Low stock alert</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Low Stock Threshold</span>
                                <span className="text-white">{product.lowStockThreshold || 5}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Allow Backorders</span>
                                <span className={product.allowOutOfStockPurchase ? 'text-yellow-500' : 'text-gray-400'}>
                                  {product.allowOutOfStockPurchase ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-400">Status</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Product Status</span>
                            <div>{getStatusBadge(product.status)}</div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Store Visibility</span>
                            <span className={product.visible !== false ? 'text-green-500' : 'text-red-500'}>
                              {product.visible !== false ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {product.trackQuantity !== false && stock <= 0 && !product.allowOutOfStockPurchase && (
                      <div className="p-4 border border-red-800 rounded-lg bg-red-900/20">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-red-500">Out of Stock</h4>
                            <p className="mt-1 text-sm text-red-400">
                              This product is currently out of stock and cannot be purchased.
                              {product.vendor && ` Consider restocking from ${product.vendor}.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {product.trackQuantity !== false && stock <= 5 && stock > 0 && (
                      <div className="p-4 border border-yellow-800 rounded-lg bg-yellow-900/20">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-yellow-500">Low Stock Alert</h4>
                            <p className="mt-1 text-sm text-yellow-400">
                              Only {stock} unit(s) remaining. Consider restocking soon.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Requires Shipping</span>
                      <span className={product.requiresShipping !== false ? 'text-green-500' : 'text-gray-400'}>
                        {product.requiresShipping !== false ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    {product.requiresShipping !== false && (
                      <>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">Package Details</h3>
                            <div className="space-y-3">
                              {product.weight && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Weight</span>
                                  <span className="text-white">{product.weight} {product.weightUnit || 'kg'}</span>
                                </div>
                              )}
                              {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Dimensions</span>
                                  <span className="text-white">
                                    {product.dimensions.length || 0} × {product.dimensions.width || 0} × {product.dimensions.height || 0} {product.dimensions.unit || 'cm'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">Shipping Rates</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Free Shipping</span>
                                <span className={product.freeShipping ? 'text-green-500' : 'text-gray-400'}>
                                  {product.freeShipping ? 'Yes' : 'No'}
                                </span>
                              </div>
                              {product.estimatedDeliveryMin && product.estimatedDeliveryMax && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Estimated Delivery</span>
                                  <span className="text-white">{product.estimatedDeliveryMin}-{product.estimatedDeliveryMax} days</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {product.freeShipping && (
                          <div className="p-4 border border-green-800 rounded-lg bg-green-900/20">
                            <p className="flex items-center text-sm text-green-400">
                              <CheckCircleIcon className="w-4 h-4 mr-2" />
                              Free shipping available for this product
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
              <h2 className="mb-4 text-lg font-semibold text-white">Quick Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <div>{getStatusBadge(product.status)}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Stock</span>
                  <div>{getStockBadge(product)}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="font-semibold text-yellow-500">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Category</span>
                  <span className="text-white">{product.category || 'Uncategorized'}</span>
                </div>
                {product.subcategory && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Subcategory</span>
                    <span className="text-white">{product.subcategory}</span>
                  </div>
                )}
                <div className="pt-3 mt-2 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Product ID</span>
                    <span className="font-mono text-xs text-gray-400">{product._id?.slice(-12)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-400">Created</span>
                    <span className="text-sm text-gray-400">{formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-400">Last Updated</span>
                    <span className="text-sm text-gray-400">{formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor & SKU Info */}
            {(product.sku || product.vendor) && (
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <h2 className="mb-4 text-lg font-semibold text-white">Identifiers</h2>
                <div className="space-y-3">
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">SKU</span>
                      <span className="font-mono text-sm text-white">{product.sku}</span>
                    </div>
                  )}
                  {product.vendor && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Vendor</span>
                      <span className="text-white">{product.vendor}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Internal Notes */}
            {product.notes && (
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <h2 className="mb-4 text-lg font-semibold text-white">Internal Notes</h2>
                <p className="text-sm text-gray-400 whitespace-pre-line">{product.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;