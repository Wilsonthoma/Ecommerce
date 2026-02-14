// admin/src/pages/Products/ProductForm.jsx
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
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  ScaleIcon,
  BellAlertIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { productService } from '../../services/products';

// Backend URL for images
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const IMAGE_BASE_URL = API_URL.replace('/api', '');

// Reliable fallback images
const FALLBACK_IMAGES = {
  main: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
  placeholder: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
};

const MAX_IMAGES = 6;
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
  const [touchedFields, setTouchedFields] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    costPerItem: '',
    stock: '',
    category: '',
    subcategory: '',
    images: [],
    status: 'draft',
    sku: '',
    barcode: '',
    tags: [],
    vendor: '',
    // Stock Management
    trackQuantity: true,
    allowOutOfStockPurchase: false,
    lowStockThreshold: 5,
    // Visibility
    isFeatured: false,
    visible: true,
    // SEO
    seoTitle: '',
    seoDescription: '',
    slug: '',
    // ✅ SHIPPING FIELDS
    requiresShipping: true,
    weight: '',
    weightUnit: 'kg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    shippingClass: 'standard',
    freeShipping: false,
    flatShippingRate: '',
    internationalShipping: false,
    shippingZones: [],
    estimatedDeliveryMin: '',
    estimatedDeliveryMax: '',
    // Notes
    notes: ''
  });

  const [tagInput, setTagInput] = useState('');

  const categories = [
    'electronics', 'clothing', 'jewelry', 'food', 'footwear',
    'fabric', 'home', 'beauty', 'other'
  ];

  const subcategories = {
    electronics: ['phones', 'computers', 'accessories', 'audio', 'cameras'],
    clothing: ['men', 'women', 'kids', 'accessories'],
    jewelry: ['necklaces', 'rings', 'earrings', 'bracelets'],
    food: ['groceries', 'snacks', 'beverages', 'organic'],
    footwear: ['sneakers', 'boots', 'sandals', 'formal'],
    fabric: ['cotton', 'silk', 'wool', 'linen'],
    home: ['furniture', 'decor', 'kitchen', 'bath'],
    beauty: ['skincare', 'makeup', 'haircare', 'fragrance'],
    other: []
  };

  const weightUnits = ['kg', 'g', 'lb', 'oz'];
  const dimensionUnits = ['cm', 'm', 'in'];
  
  const shippingClasses = [
    { value: 'standard', label: 'Standard Shipping' },
    { value: 'express', label: 'Express Shipping' },
    { value: 'overnight', label: 'Overnight Shipping' },
    { value: 'freight', label: 'Freight Shipping' },
    { value: 'international', label: 'International Shipping' }
  ];

  const shippingZoneOptions = [
    { value: 'na', label: 'North America' },
    { value: 'eu', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'africa', label: 'Africa' },
    { value: 'sa', label: 'South America' },
    { value: 'oceania', label: 'Oceania' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'archived', label: 'Archived', color: 'slate' },
    { value: 'out_of_stock', label: 'Out of Stock', color: 'red' }
  ];

  // Get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    let cleanPath = imagePath;
    if (cleanPath.includes('/api/')) {
      cleanPath = cleanPath.replace('/api/', '/');
    }
    
    if (cleanPath.startsWith('/uploads/')) {
      return `${IMAGE_BASE_URL}${cleanPath}`;
    }
    
    if (cleanPath.startsWith('uploads/')) {
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
    
    return `${IMAGE_BASE_URL}/uploads/products/${cleanPath}`;
  };

  // Extract images from product
  const extractImagesFromProduct = (product) => {
    if (!product) return [];
    
    let images = [];
    
    if (product.images && Array.isArray(product.images)) {
      images = product.images.map((img, index) => {
        if (typeof img === 'object' && img !== null && img.url) {
          return {
            url: getFullImageUrl(img.url),
            altText: img.altText || product.name || `Image ${index + 1}`,
            isPrimary: img.isPrimary || index === 0,
            id: img._id || img.id || index
          };
        } else if (typeof img === 'string') {
          return {
            url: getFullImageUrl(img),
            altText: product.name || `Image ${index + 1}`,
            isPrimary: index === 0,
            id: index
          };
        }
        return null;
      }).filter(Boolean);
    } else if (product.image && typeof product.image === 'string') {
      images = [{
        url: getFullImageUrl(product.image),
        altText: product.name || 'Product image',
        isPrimary: true,
        id: 'primary'
      }];
    }
    
    return images;
  };

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
        
        const extractedImages = extractImagesFromProduct(product);
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: product.price?.toString() || '',
          comparePrice: product.comparePrice?.toString() || '',
          costPerItem: product.costPerItem?.toString() || '',
          stock: product.quantity?.toString() || product.stock?.toString() || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          images: extractedImages,
          status: product.status || 'draft',
          sku: product.sku || '',
          barcode: product.barcode || '',
          tags: product.tags || [],
          vendor: product.vendor || '',
          trackQuantity: product.trackQuantity !== false,
          allowOutOfStockPurchase: Boolean(product.allowOutOfStockPurchase),
          lowStockThreshold: product.lowStockThreshold || 5,
          isFeatured: Boolean(product.featured || product.isFeatured),
          visible: product.visible !== false,
          seoTitle: product.seoTitle || '',
          seoDescription: product.seoDescription || '',
          slug: product.slug || '',
          // Shipping fields
          requiresShipping: product.requiresShipping !== false,
          weight: product.weight?.toString() || '',
          weightUnit: product.weightUnit || 'kg',
          dimensions: product.dimensions || { length: '', width: '', height: '', unit: 'cm' },
          shippingClass: product.shippingClass || 'standard',
          freeShipping: Boolean(product.freeShipping),
          flatShippingRate: product.flatShippingRate?.toString() || '',
          internationalShipping: Boolean(product.internationalShipping),
          shippingZones: product.shippingZones || [],
          estimatedDeliveryMin: product.estimatedDeliveryMin?.toString() || '',
          estimatedDeliveryMax: product.estimatedDeliveryMax?.toString() || '',
          notes: product.notes || ''
        });
        
        if (product.tags) {
          setTagInput(product.tags.join(', '));
        }
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
    
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
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
      setTagInput(value);
      const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormData(prev => ({ ...prev, tags: tagsArray }));
    } else if (name === 'shippingZones') {
      const selectedZones = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, shippingZones: selectedZones }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'name':
        if (!value || String(value).trim() === '') {
          error = 'Product name is required';
        }
        break;
      case 'price':
        if (value === '' || value === null || value === undefined) {
          error = 'Price is required';
        } else {
          const priceNum = parseFloat(value);
          if (isNaN(priceNum) || priceNum < 0) {
            error = 'Price must be a valid positive number';
          }
        }
        break;
      case 'stock':
        if (formData.trackQuantity) {
          if (value === '' || value === null || value === undefined) {
            error = 'Stock is required when tracking quantity';
          } else {
            const stockNum = parseInt(value);
            if (isNaN(stockNum) || stockNum < 0) {
              error = 'Stock must be a valid non-negative number';
            }
          }
        }
        break;
      case 'lowStockThreshold':
        const threshold = parseInt(value);
        if (isNaN(threshold) || threshold < 0) {
          error = 'Low stock threshold must be a valid non-negative number';
        }
        break;
      case 'category':
        if (!value || String(value).trim() === '') {
          error = 'Category is required';
        }
        break;
      case 'estimatedDeliveryMin':
      case 'estimatedDeliveryMax':
        if (value && (parseInt(value) < 1)) {
          error = 'Estimated delivery must be at least 1 day';
        }
        break;
      case 'flatShippingRate':
        if (value && parseFloat(value) < 0) {
          error = 'Shipping rate cannot be negative';
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  // Enhanced validation with stock tracking
  const validateForm = () => {
    console.log('🔍 VALIDATING FORM - Current formData:', formData);

    const newErrors = {};
    
    // Name validation
    if (!formData.name || String(formData.name).trim() === '') {
      newErrors.name = 'Product name is required';
    }
    
    // Price validation
    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = 'Price must be a valid positive number';
      }
    }
    
    // Stock validation (if tracking quantity)
    if (formData.trackQuantity) {
      if (formData.stock === '' || formData.stock === null || formData.stock === undefined) {
        newErrors.stock = 'Stock is required when tracking quantity';
      } else {
        const stockNum = parseInt(formData.stock);
        if (isNaN(stockNum) || stockNum < 0) {
          newErrors.stock = 'Stock must be a valid non-negative number';
        }
      }
      
      // Low stock threshold validation
      const threshold = parseInt(formData.lowStockThreshold);
      if (isNaN(threshold) || threshold < 0) {
        newErrors.lowStockThreshold = 'Low stock threshold must be a valid non-negative number';
      }
    }
    
    // Category validation
    if (!formData.category || String(formData.category).trim() === '') {
      newErrors.category = 'Category is required';
    }
    
    // Shipping validation
    if (formData.requiresShipping) {
      if (formData.estimatedDeliveryMin && formData.estimatedDeliveryMax) {
        const min = parseInt(formData.estimatedDeliveryMin);
        const max = parseInt(formData.estimatedDeliveryMax);
        if (min > max) {
          newErrors.estimatedDeliveryMax = 'Maximum days must be greater than minimum days';
        }
      }
    }
    
    // Images validation for new products
    if (!isEditMode) {
      const totalImages = (formData.images?.length || 0) + filesToUpload.length;
      if (totalImages === 0) {
        newErrors.images = 'Please provide at least one image';
      }
    }
    
    setErrors(newErrors);
    console.log('🔍 Validation complete. Errors:', newErrors);
    return Object.keys(newErrors).length === 0;
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

    if (validFiles.length > 0) {
      setFilesToUpload(prev => [...prev, ...validFiles]);
    }
    
    if (errors.images && totalImages + validFiles.length > 0) {
      setErrors(prev => ({ ...prev, images: '' }));
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

  const setPrimaryImage = (imageIndex) => {
    setFormData(prev => {
      const newImages = prev.images.map((img, idx) => ({
        ...img,
        isPrimary: idx === imageIndex
      }));
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setSaving(true);
    setUploadProgress(0);
    const loadingToast = toast.loading(isEditMode ? 'Updating product...' : 'Creating product...');

    try {
      const formDataObj = new FormData();
      
      // Add basic fields
      formDataObj.append('name', String(formData.name || '').trim());
      formDataObj.append('description', String(formData.description || '').trim());
      formDataObj.append('shortDescription', String(formData.shortDescription || '').trim());
      
      // Parse numbers carefully
      const priceNum = parseFloat(formData.price) || 0;
      const comparePriceNum = parseFloat(formData.comparePrice) || 0;
      const costPerItemNum = parseFloat(formData.costPerItem) || 0;
      const stockNum = parseInt(formData.stock) || 0;
      
      formDataObj.append('price', priceNum);
      formDataObj.append('comparePrice', comparePriceNum);
      formDataObj.append('costPerItem', costPerItemNum);
      formDataObj.append('stock', stockNum);
      formDataObj.append('category', String(formData.category || '').trim());
      formDataObj.append('subcategory', String(formData.subcategory || '').trim());
      formDataObj.append('status', String(formData.status || 'draft'));
      formDataObj.append('featured', String(formData.isFeatured));
      formDataObj.append('visible', String(formData.visible));
      
      // Stock management fields
      formDataObj.append('trackQuantity', String(formData.trackQuantity));
      formDataObj.append('allowOutOfStockPurchase', String(formData.allowOutOfStockPurchase));
      formDataObj.append('lowStockThreshold', parseInt(formData.lowStockThreshold) || 5);
      
      if (formData.sku) {
        formDataObj.append('sku', String(formData.sku).trim());
      }
      
      if (formData.barcode) {
        formDataObj.append('barcode', String(formData.barcode).trim());
      }
      
      if (formData.vendor) {
        formDataObj.append('vendor', String(formData.vendor).trim());
      }
      
      // Tags
      if (formData.tags && formData.tags.length > 0) {
        formDataObj.append('tags', JSON.stringify(formData.tags));
      }
      
      // SEO fields
      if (formData.seoTitle) {
        formDataObj.append('seoTitle', String(formData.seoTitle).trim());
      }
      
      if (formData.seoDescription) {
        formDataObj.append('seoDescription', String(formData.seoDescription).trim());
      }
      
      if (formData.slug) {
        formDataObj.append('slug', String(formData.slug).trim());
      }
      
      // ✅ SHIPPING FIELDS
      formDataObj.append('requiresShipping', String(formData.requiresShipping));
      
      if (formData.weight) {
        formDataObj.append('weight', parseFloat(formData.weight) || 0);
        formDataObj.append('weightUnit', String(formData.weightUnit || 'kg'));
      }
      
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        formDataObj.append('dimensions', JSON.stringify(formData.dimensions));
      }
      
      formDataObj.append('shippingClass', String(formData.shippingClass || 'standard'));
      formDataObj.append('freeShipping', String(formData.freeShipping));
      
      if (formData.flatShippingRate) {
        formDataObj.append('flatShippingRate', parseFloat(formData.flatShippingRate) || 0);
      }
      
      formDataObj.append('internationalShipping', String(formData.internationalShipping));
      
      if (formData.shippingZones && formData.shippingZones.length > 0) {
        formDataObj.append('shippingZones', JSON.stringify(formData.shippingZones));
      }
      
      if (formData.estimatedDeliveryMin) {
        formDataObj.append('estimatedDeliveryMin', parseInt(formData.estimatedDeliveryMin) || 0);
      }
      
      if (formData.estimatedDeliveryMax) {
        formDataObj.append('estimatedDeliveryMax', parseInt(formData.estimatedDeliveryMax) || 0);
      }
      
      if (formData.notes) {
        formDataObj.append('notes', String(formData.notes).trim());
      }
      
      // Handle existing images
      if (isEditMode && formData.images.length > 0) {
        const imageUrls = formData.images.map(img => img.url || img);
        formDataObj.append('existingImages', JSON.stringify(imageUrls));
        
        // Add primary image info
        const primaryIndex = formData.images.findIndex(img => img.isPrimary);
        if (primaryIndex !== -1) {
          formDataObj.append('primaryImageIndex', primaryIndex);
        }
      }
      
      // Add new images
      filesToUpload.forEach(file => {
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
        navigate('/products');
      } else {
        toast.error(response.error?.message || 'Operation failed');
        if (response.error?.validationErrors) {
          setErrors(response.error.validationErrors);
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('❌ Product submission error:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleCancel}
                className="inline-flex items-center mb-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                {isEditMode ? 'Back to Product' : 'Back to Products'}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Create New Product'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {isEditMode ? 'Update product details' : 'Add a new product to your store'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                className="px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  isEditMode ? 'Update Product' : 'Create Product'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-8 lg:col-span-2">
              {/* Basic Information */}
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center mb-6">
                  <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.name && touchedFields.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && touchedFields.name && (
                      <p className="flex items-center mt-2 text-sm text-red-600">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      rows={2}
                      value={formData.shortDescription || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Brief description for product listings..."
                      maxLength="500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.shortDescription?.length || 0}/500 characters
                    </p>
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Full Description
                    </label>
                    <textarea
                      name="description"
                      rows={6}
                      value={formData.description || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Detailed product description..."
                    />
                  </div>

                  {/* Price Fields */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Price (KSh) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">KSh</div>
                        <input
                          type="number"
                          name="price"
                          min="0"
                          step="0.01"
                          value={formData.price ?? ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full pl-12 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                            errors.price && touchedFields.price ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.price && touchedFields.price && (
                        <p className="flex items-center mt-2 text-sm text-red-600">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Compare at Price
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">KSh</div>
                        <input
                          type="number"
                          name="comparePrice"
                          min="0"
                          step="0.01"
                          value={formData.comparePrice ?? ''}
                          onChange={handleChange}
                          className="w-full pl-12 px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Original price for comparison</p>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Cost per Item
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">KSh</div>
                        <input
                          type="number"
                          name="costPerItem"
                          min="0"
                          step="0.01"
                          value={formData.costPerItem ?? ''}
                          onChange={handleChange}
                          className="w-full pl-12 px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">For profit tracking</p>
                    </div>
                  </div>

                  {/* Category and Subcategory */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          errors.category && touchedFields.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                      {errors.category && touchedFields.category && (
                        <p className="flex items-center mt-2 text-sm text-red-600">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Subcategory
                      </label>
                      <select
                        name="subcategory"
                        value={formData.subcategory || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!formData.category}
                      >
                        <option value="">Select subcategory</option>
                        {formData.category && subcategories[formData.category]?.map(sub => (
                          <option key={sub} value={sub}>
                            {sub.charAt(0).toUpperCase() + sub.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* SKU, Barcode, Vendor */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., PROD-001"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Barcode / ISBN
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        value={formData.barcode || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter barcode"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Vendor
                      </label>
                      <input
                        type="text"
                        name="vendor"
                        value={formData.vendor || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Supplier name"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={tagInput}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter tags separated by commas (e.g., new, sale, popular)"
                    />
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Management Section */}
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center mb-6">
                  <CubeIcon className="w-6 h-6 mr-2 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Stock Management</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Track Quantity Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trackQuantity"
                      name="trackQuantity"
                      checked={formData.trackQuantity}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="trackQuantity" className="block ml-2 text-sm text-gray-900">
                      Track quantity
                    </label>
                    <p className="ml-4 text-xs text-gray-500">Enable to manage stock levels</p>
                  </div>

                  {formData.trackQuantity && (
                    <>
                      {/* Stock Quantity */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Stock Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="stock"
                            min="0"
                            value={formData.stock ?? ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                              errors.stock && touchedFields.stock ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                          {errors.stock && touchedFields.stock && (
                            <p className="flex items-center mt-2 text-sm text-red-600">
                              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                              {errors.stock}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Low Stock Threshold
                          </label>
                          <input
                            type="number"
                            name="lowStockThreshold"
                            min="1"
                            value={formData.lowStockThreshold ?? 5}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                              errors.lowStockThreshold && touchedFields.lowStockThreshold ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="5"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Alert when stock falls below this number
                          </p>
                        </div>
                      </div>

                      {/* Allow Out of Stock Purchases */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allowOutOfStockPurchase"
                          name="allowOutOfStockPurchase"
                          checked={formData.allowOutOfStockPurchase}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="allowOutOfStockPurchase" className="block ml-2 text-sm text-gray-900">
                          Allow out of stock purchases
                        </label>
                        <p className="ml-4 text-xs text-gray-500">
                          Customers can still purchase when out of stock (backorders)
                        </p>
                      </div>

                      {/* Stock Status Preview */}
                      {isEditMode && (
                        <div className="p-4 rounded-lg bg-gray-50">
                          <h3 className="flex items-center text-sm font-medium text-gray-700">
                            <BellAlertIcon className="w-4 h-4 mr-2" />
                            Stock Status Preview
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <span className="text-xs text-gray-500">Current Stock</span>
                              <p className="text-lg font-semibold">{parseInt(formData.stock) || 0}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Status</span>
                              <div className="mt-1">
                                {parseInt(formData.stock) <= 0 ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {formData.allowOutOfStockPurchase ? 'Backorder' : 'Out of Stock'}
                                  </span>
                                ) : parseInt(formData.stock) <= (parseInt(formData.lowStockThreshold) || 5) ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    In Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ✅ SHIPPING INFORMATION SECTION - COMPLETE */}
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center mb-6">
                  <TruckIcon className="w-6 h-6 mr-2 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Requires Shipping Toggle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requiresShipping"
                      name="requiresShipping"
                      checked={formData.requiresShipping}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="requiresShipping" className="block ml-2 text-sm text-gray-900">
                      This product requires shipping
                    </label>
                    <p className="ml-4 text-xs text-gray-500">Uncheck for digital products or services</p>
                  </div>

                  {formData.requiresShipping && (
                    <>
                      {/* Weight with Unit */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Weight
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              name="weight"
                              min="0"
                              step="0.01"
                              value={formData.weight ?? ''}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 transition border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.5"
                            />
                            <select
                              name="weightUnit"
                              value={formData.weightUnit || ''}
                              onChange={handleChange}
                              className="px-3 py-2.5 transition bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {weightUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Used to calculate shipping costs</p>
                        </div>

                        {/* Shipping Class */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Shipping Class
                          </label>
                          <select
                            name="shippingClass"
                            value={formData.shippingClass || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {shippingClasses.map(sc => (
                              <option key={sc.value} value={sc.value}>{sc.label}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">Determines shipping rates and carriers</p>
                        </div>
                      </div>

                      {/* Package Dimensions */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Package Dimensions (L × W × H)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1">
                            <input
                              type="number"
                              name="dimensions.length"
                              min="0"
                              step="0.1"
                              value={formData.dimensions.length ?? ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Length"
                            />
                          </div>
                          <div className="col-span-1">
                            <input
                              type="number"
                              name="dimensions.width"
                              min="0"
                              step="0.1"
                              value={formData.dimensions.width ?? ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Width"
                            />
                          </div>
                          <div className="col-span-1">
                            <input
                              type="number"
                              name="dimensions.height"
                              min="0"
                              step="0.1"
                              value={formData.dimensions.height ?? ''}
                              onChange={handleChange}
                              className="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Height"
                            />
                          </div>
                          <div className="col-span-1">
                            <select
                              name="dimensions.unit"
                              value={formData.dimensions.unit || ''}
                              onChange={handleChange}
                              className="w-full px-2 py-2 transition border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {dimensionUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Package dimensions for shipping calculations</p>
                      </div>

                      {/* Shipping Options */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Free Shipping */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="freeShipping"
                            name="freeShipping"
                            checked={formData.freeShipping}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="freeShipping" className="block ml-2 text-sm text-gray-900">
                            Free Shipping
                          </label>
                        </div>

                        {/* Flat Shipping Rate */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Flat Shipping Rate (KSh)
                          </label>
                          <input
                            type="number"
                            name="flatShippingRate"
                            min="0"
                            step="0.01"
                            value={formData.flatShippingRate ?? ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 500"
                          />
                          {errors.flatShippingRate && (
                            <p className="mt-1 text-xs text-red-600">{errors.flatShippingRate}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">Leave empty to use carrier rates</p>
                        </div>
                      </div>

                      {/* International Shipping */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="internationalShipping"
                            name="internationalShipping"
                            checked={formData.internationalShipping}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="internationalShipping" className="block ml-2 text-sm text-gray-900">
                            Available for International Shipping
                          </label>
                        </div>

                        {/* Shipping Zones */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Restricted Shipping Zones
                          </label>
                          <select
                            name="shippingZones"
                            multiple
                            value={formData.shippingZones || []}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            size="3"
                          >
                            {shippingZoneOptions.map(zone => (
                              <option key={zone.value} value={zone.value}>
                                {zone.label}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            {formData.shippingZones?.length > 0 
                              ? `Restricted to: ${formData.shippingZones.map(z => 
                                  shippingZoneOptions.find(opt => opt.value === z)?.label || z
                                ).join(', ')}`
                              : 'No restrictions - ships to all zones'}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Hold Ctrl/Cmd to select multiple zones to restrict
                          </p>
                        </div>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Estimated Delivery (Min Days)
                          </label>
                          <input
                            type="number"
                            name="estimatedDeliveryMin"
                            min="1"
                            value={formData.estimatedDeliveryMin ?? ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.estimatedDeliveryMin ? 'border-red-500' : ''
                            }`}
                            placeholder="e.g., 3"
                          />
                          {errors.estimatedDeliveryMin && (
                            <p className="mt-1 text-xs text-red-600">{errors.estimatedDeliveryMin}</p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-900">
                            Estimated Delivery (Max Days)
                          </label>
                          <input
                            type="number"
                            name="estimatedDeliveryMax"
                            min="1"
                            value={formData.estimatedDeliveryMax ?? ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.estimatedDeliveryMax ? 'border-red-500' : ''
                            }`}
                            placeholder="e.g., 7"
                          />
                          {errors.estimatedDeliveryMax && (
                            <p className="mt-1 text-xs text-red-600">{errors.estimatedDeliveryMax}</p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Preview */}
                      {(formData.weight || formData.flatShippingRate || formData.freeShipping) && (
                        <div className="p-4 rounded-lg bg-blue-50">
                          <h3 className="flex items-center text-sm font-medium text-blue-800">
                            <GlobeAltIcon className="w-4 h-4 mr-2" />
                            Shipping Preview
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                            {formData.freeShipping && (
                              <div className="text-blue-700">✓ Free Shipping available</div>
                            )}
                            {formData.flatShippingRate > 0 && !formData.freeShipping && (
                              <div className="text-blue-700">Flat Rate: KSh {formData.flatShippingRate}</div>
                            )}
                            {formData.weight > 0 && (
                              <div className="text-blue-700">Weight: {formData.weight} {formData.weightUnit}</div>
                            )}
                            {formData.internationalShipping && (
                              <div className="text-blue-700">✈️ International shipping available</div>
                            )}
                            {formData.estimatedDeliveryMin && formData.estimatedDeliveryMax && (
                              <div className="text-blue-700">
                                Delivery: {formData.estimatedDeliveryMin}-{formData.estimatedDeliveryMax} days
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Images Section */}
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center mb-6">
                  <PhotoIcon className="w-6 h-6 mr-2 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Product Images {!isEditMode && <span className="text-red-500">*</span>}
                    <span className="ml-2 text-sm text-gray-500">({totalImages}/{MAX_IMAGES})</span>
                  </h2>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={totalImages >= MAX_IMAGES}
                />

                {/* Upload Area */}
                {totalImages < MAX_IMAGES && (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      errors.images
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-3 ${
                      errors.images ? 'text-red-500' : 'text-gray-400'
                    }`} />
                    <p className="mb-1 text-sm font-medium text-gray-900">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WEBP up to 5MB each
                    </p>
                  </div>
                )}

                {errors.images && (
                  <p className="flex items-center mt-3 text-sm text-red-600">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.images}
                  </p>
                )}

                {/* Image Previews */}
                {totalImages > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-sm font-medium text-gray-900">
                      Image Gallery {filesToUpload.length > 0 && (
                        <span className="text-sm text-blue-600">
                          ({filesToUpload.length} new)
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {/* Existing Images */}
                      {formData.images.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <div className="overflow-hidden border border-gray-200 rounded-lg aspect-square">
                            <img
                              src={image.url}
                              alt={image.altText || `Product image ${index + 1}`}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.src = FALLBACK_IMAGES.thumbnail;
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 transition-all duration-200 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-40">
                            <div className="absolute transition-opacity duration-200 opacity-0 top-2 right-2 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="p-1 text-red-600 bg-white rounded-full shadow-lg hover:bg-red-50"
                                title="Remove image"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                            {!image.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className="absolute transition-opacity duration-200 opacity-0 bottom-2 left-2 group-hover:opacity-100"
                              >
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded hover:bg-gray-900">
                                  Set Primary
                                </span>
                              </button>
                            )}
                          </div>
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded">
                                Primary
                              </span>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* New Images */}
                      {filesToUpload.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <div className="overflow-hidden border-2 border-blue-500 rounded-lg aspect-square">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="absolute inset-0 transition-all duration-200 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-40">
                            <div className="absolute transition-opacity duration-200 opacity-0 top-2 right-2 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 text-red-600 bg-white rounded-full shadow-lg hover:bg-red-50"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
                              New
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Status */}
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center mb-6">
                  <TagIcon className="w-6 h-6 mr-2 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Status & Visibility</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Product Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="visible"
                      name="visible"
                      checked={formData.visible}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="visible" className="block ml-2 text-sm text-gray-900">
                      Visible in store
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isFeatured" className="block ml-2 text-sm text-gray-900">
                      Featured Product
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center mb-6">
                  <EyeIcon className="w-6 h-6 mr-2 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">SEO</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Title for search engines"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      SEO Description
                    </label>
                    <textarea
                      name="seoDescription"
                      rows={2}
                      value={formData.seoDescription || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Description for search engines"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="product-url-slug"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-generated from name if left empty
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center mb-6">
                  <InformationCircleIcon className="w-6 h-6 mr-2 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Internal Notes</h2>
                </div>
                
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Add internal notes about this product..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  These notes are only visible to staff
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;