import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  TrashIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  TagIcon,
  CubeIcon,
  TruckIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { productService } from '../../services/products';
import { validateProduct } from '../../utils/validators';

const MAX_IMAGES = 6; // Frontend limit
const BACKEND_MAX_IMAGES = 4; // Backend limit in main routes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '', // Will be sent as costPerItem
    stock: '', // Backend will map to quantity
    category: '',
    images: [],
    status: 'active',
    sku: '',
    barcode: '',
    weight: '',
    weightUnit: 'kg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    shippingClass: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    isFeatured: false, // Backend expects 'featured'
    taxClass: 'standard',
    trackQuantity: true,
    allowOutOfStockPurchase: false
  });

  const categories = [
    'electronics', 'clothing', 'jewelry', 'food', 'footwear',
    'fabric', 'home', 'beauty', 'other'
  ];

  const shippingClasses = [
    'standard', 'express', 'oversized', 'fragile', 'refrigerated'
  ];

  const taxClasses = [
    'standard', 'reduced', 'zero', 'exempt'
  ];

  const weightUnits = ['kg', 'g', 'lb', 'oz'];
  const dimensionUnits = ['cm', 'm', 'in'];

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productService.getById(id);
      if (response.success) {
        const product = response.data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          cost: product.costPerItem || '',
          stock: product.quantity || '',
          category: product.category || '',
          images: product.images || [],
          status: product.status || 'active',
          sku: product.sku || '',
          barcode: product.barcode || '',
          weight: product.weight || '',
          weightUnit: product.weightUnit || 'kg',
          dimensions: product.dimensions || { length: '', width: '', height: '', unit: 'cm' },
          shippingClass: '',
          tags: product.tags || [],
          metaTitle: product.seoTitle || '',
          metaDescription: product.seoDescription || '',
          isFeatured: product.featured || false,
          taxClass: 'standard',
          trackQuantity: product.trackQuantity !== false,
          allowOutOfStockPurchase: product.allowOutOfStockPurchase || false
        });
      } else {
        toast.error(response.error?.message || 'Failed to fetch product');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionKey]: value
        }
      }));
    } else if (name === 'tags') {
      const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormData(prev => ({ ...prev, tags }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalImages = formData.images.length + filesToUpload.length;

    if (totalImages + newFiles.length > MAX_IMAGES) {
      toast.error(`You can only upload a maximum of ${MAX_IMAGES} images.`);
      e.target.value = null;
      return;
    }

    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not an image.`);
        return false;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds 5MB limit.`);
        return false;
      }
      
      return true;
    });

    // Store files for upload
    if (validFiles.length > 0) {
      setFilesToUpload(prev => [...prev, ...validFiles]);
    }
    
    e.target.value = null;
  };

  const removeFile = (fileIndex) => {
    setFilesToUpload(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const removeExistingImage = async (imageIndex) => {
    if (!isEditMode) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== imageIndex)
      }));
      return;
    }

    try {
      const response = await productService.deleteImage(id, imageIndex);
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, index) => index !== imageIndex)
        }));
        toast.success('Image deleted successfully');
      } else {
        toast.error(response.error?.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const setPrimaryImage = async (imageIndex) => {
    if (!isEditMode) {
      setFormData(prev => {
        const newImages = prev.images.map((img, idx) => ({
          ...img,
          isPrimary: idx === imageIndex
        }));
        return { ...prev, images: newImages };
      });
      return;
    }

    try {
      const response = await productService.setPrimaryImage(id, imageIndex);
      if (response.success) {
        setFormData(prev => {
          const newImages = prev.images.map((img, idx) => ({
            ...img,
            isPrimary: idx === imageIndex
          }));
          return { ...prev, images: newImages };
        });
        toast.success('Primary image updated');
      } else {
        toast.error(response.error?.message || 'Failed to set primary image');
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast.error('Failed to set primary image');
    }
  };

  const validateForm = () => {
    const validationErrors = validateProduct(formData);
    
    // Additional validation for images
    const totalImages = (formData.images?.length || 0) + filesToUpload.length;
    if (totalImages === 0) {
      validationErrors.images = 'Please provide at least one image';
    } else if (totalImages > BACKEND_MAX_IMAGES) {
      validationErrors.images = `Maximum ${BACKEND_MAX_IMAGES} images allowed for initial upload`;
    }
    
    // Additional validation for required fields
    if (!formData.name || formData.name.trim() === '') {
      validationErrors.name = 'Product name is required';
    }
    
    if (!formData.price || formData.price.trim() === '') {
      validationErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      validationErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.stock || formData.stock.trim() === '') {
      validationErrors.stock = 'Stock is required';
    } else if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      validationErrors.stock = 'Stock must be a non-negative integer';
    }
    
    if (!formData.category || formData.category.trim() === '') {
      validationErrors.category = 'Category is required';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSaving(true);
    setUploadProgress(0);
    const loadingToast = toast.loading(isEditMode ? 'Updating product...' : 'Creating product...');

    try {
      // Prepare FormData for multipart upload
      const formDataObj = new FormData();
      
      // Add text fields
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', parseFloat(formData.price));
      
      if (formData.cost) {
        formDataObj.append('costPerItem', parseFloat(formData.cost));
      }
      
      formDataObj.append('stock', parseInt(formData.stock)); // Backend will map to quantity
      formDataObj.append('category', formData.category);
      formDataObj.append('status', formData.status);
      
      if (formData.sku) {
        formDataObj.append('sku', formData.sku);
      }
      
      if (formData.barcode) {
        formDataObj.append('barcode', formData.barcode);
      }
      
      if (formData.weight) {
        formDataObj.append('weight', parseFloat(formData.weight));
        formDataObj.append('weightUnit', formData.weightUnit);
      }
      
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        formDataObj.append('dimensions', JSON.stringify(formData.dimensions));
      }
      
      if (formData.tags.length > 0) {
        formDataObj.append('tags', JSON.stringify(formData.tags));
      }
      
      if (formData.metaTitle) {
        formDataObj.append('seoTitle', formData.metaTitle);
      }
      
      if (formData.metaDescription) {
        formDataObj.append('seoDescription', formData.metaDescription);
      }
      
      formDataObj.append('featured', formData.isFeatured.toString());
      formDataObj.append('trackQuantity', formData.trackQuantity.toString());
      formDataObj.append('allowOutOfStockPurchase', formData.allowOutOfStockPurchase.toString());
      
      // Add existing images
      if (isEditMode && formData.images.length > 0) {
        formData.images.forEach(img => {
          formDataObj.append('existingImages', img.url);
        });
      }
      
      // Add new images (limited to backend limit)
      const imagesToUpload = filesToUpload.slice(0, BACKEND_MAX_IMAGES);
      imagesToUpload.forEach(file => {
        formDataObj.append('images', file);
      });

      let response;
      if (isEditMode) {
        response = await productService.update(id, formDataObj);
      } else {
        response = await productService.create(formDataObj);
      }

      toast.dismiss(loadingToast);
      
      if (response.success) {
        toast.success(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        
        // If there are more images than backend limit, upload remaining via separate endpoint
        if (filesToUpload.length > BACKEND_MAX_IMAGES) {
          toast('Uploading additional images...', { icon: '⏳' });
          const remainingFiles = filesToUpload.slice(BACKEND_MAX_IMAGES);
          const uploadResponse = await productService.uploadImages(response.data._id || id, remainingFiles);
          if (uploadResponse.success) {
            toast.success('All images uploaded successfully');
          }
        }
        
        navigate('/products');
      } else {
        toast.error(response.error?.message || 'Operation failed');
        if (response.error?.validationErrors) {
          setErrors(response.error.validationErrors);
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Product submission error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/products/${id}`);
    } else {
      navigate('/products');
    }
  };

  const totalImages = (formData.images?.length || 0) + filesToUpload.length;
  const isImageLimitReached = totalImages >= MAX_IMAGES;
  const isBackendImageLimitReached = filesToUpload.length >= BACKEND_MAX_IMAGES;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleCancel}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {isEditMode ? 'Back to Product' : 'Back to Products'}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Create New Product'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isEditMode ? 'Update product details and settings' : 'Add a new product to your store'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                    {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Saving...'}
                  </span>
                ) : (
                  isEditMode ? 'Update Product' : 'Create Product'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Product Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      rows={6}
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe your product in detail..."
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {formData.description.length}/2000 characters
                      </p>
                      {errors.description && (
                        <p className="text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SEO Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Meta title for SEO"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        SEO Description
                      </label>
                      <textarea
                        name="metaDescription"
                        rows={3}
                        value={formData.metaDescription}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                        placeholder="Meta description for SEO"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Pricing & Inventory</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Price (KSh) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">KSh</div>
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className={`w-full pl-12 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Cost (KSh)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">KSh</div>
                      <input
                        type="number"
                        name="cost"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={handleChange}
                        className="w-full pl-12 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.stock}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="trackQuantity"
                        name="trackQuantity"
                        checked={formData.trackQuantity}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="trackQuantity" className="ml-2 block text-sm text-gray-900">
                        Track Quantity
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowOutOfStockPurchase"
                        name="allowOutOfStockPurchase"
                        checked={formData.allowOutOfStockPurchase}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="allowOutOfStockPurchase" className="ml-2 block text-sm text-gray-900">
                        Allow Out of Stock Purchase
                      </label>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags.join(', ')}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="tag1, tag2, tag3"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = [...formData.tags];
                            newTags.splice(index, 1);
                            setFormData({ ...formData, tags: newTags });
                          }}
                          className="ml-1.5 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <PhotoIcon className="h-6 w-6 text-purple-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Product Images ({totalImages}/{MAX_IMAGES})
                    {isBackendImageLimitReached && (
                      <span className="text-sm text-amber-600 ml-2">
                        (Max {BACKEND_MAX_IMAGES} new images per upload)
                      </span>
                    )}
                  </h2>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={isImageLimitReached}
                />

                {/* Upload Area */}
                {!isImageLimitReached && (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      errors.images
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <CloudArrowUpIcon className={`h-12 w-12 mx-auto mb-3 ${
                      errors.images ? 'text-red-500' : 'text-gray-400'
                    }`} />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WEBP up to 5MB each
                    </p>
                    {isBackendImageLimitReached && (
                      <p className="text-xs text-amber-600 mt-2">
                        Note: Only {BACKEND_MAX_IMAGES} new images can be uploaded at once
                      </p>
                    )}
                  </div>
                )}

                {errors.images && (
                  <p className="mt-3 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.images}
                  </p>
                )}

                {/* Image Previews */}
                {(totalImages > 0) && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      Image Gallery {filesToUpload.length > 0 && (
                        <span className="text-sm text-blue-600">
                          ({filesToUpload.length} new to upload)
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Existing Images */}
                      {formData.images.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={image.url}
                              alt={image.altText || `Product image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300?text=Image+Error';
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="p-1 bg-white rounded-full text-red-600 shadow-lg hover:bg-red-50"
                                title="Remove image"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              {image.isPrimary ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">
                                  <CheckIcon className="h-3 w-3 mr-1" />
                                  Primary
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-800 text-white hover:bg-gray-900">
                                  Set Primary
                                </span>
                              )}
                            </button>
                          </div>
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">
                                Primary
                              </span>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* New Images */}
                      {filesToUpload.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-blue-500">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 bg-white rounded-full text-red-600 shadow-lg hover:bg-red-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          </div>
                          {index >= BACKEND_MAX_IMAGES && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                Will upload separately
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Organization */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <TagIcon className="h-6 w-6 text-orange-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Organization</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-3 block text-sm text-gray-900">
                      Featured Product
                    </label>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <TruckIcon className="h-6 w-6 text-teal-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping & Dimensions</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Weight
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          name="weight"
                          min="0"
                          step="0.01"
                          value={formData.weight}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="0.5"
                        />
                        <select
                          name="weightUnit"
                          value={formData.weightUnit}
                          onChange={handleChange}
                          className="px-3 py-2.5 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                          {weightUnits.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Unit
                      </label>
                      <select
                        name="dimensions.unit"
                        value={formData.dimensions.unit}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        {dimensionUnits.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Dimensions ({formData.dimensions.unit})
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          name="dimensions.length"
                          min="0"
                          step="0.1"
                          value={formData.dimensions.length}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Length"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="dimensions.width"
                          min="0"
                          step="0.1"
                          value={formData.dimensions.width}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Width"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="dimensions.height"
                          min="0"
                          step="0.1"
                          value={formData.dimensions.height}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Height"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Identifiers */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <CubeIcon className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Product Identifiers</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="PROD-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Barcode
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="123456789012"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;