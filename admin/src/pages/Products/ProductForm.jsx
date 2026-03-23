import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  TrashIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  InformationCircleIcon,
  CubeIcon,
  TruckIcon,
  ArrowPathIcon,
  SparklesIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { productService } from '../../services/products';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const IMAGE_BASE_URL = API_URL.replace('/api', '');

const FALLBACK_IMAGES = {
  main: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
  placeholder: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
};

const CATEGORIES = [
  { value: 'Smartphones', label: 'Smartphones' },
  { value: 'Laptops', label: 'Laptops' },
  { value: 'Tablets', label: 'Tablets' },
  { value: 'Cameras', label: 'Cameras' },
  { value: 'Headphones', label: 'Headphones' },
  { value: 'Speakers', label: 'Speakers' }
];

const SUBCATEGORIES = {
  'Smartphones': [
    'Android Phones', 'iPhones', 'Foldable Phones', 'Gaming Phones',
    'Budget Smartphones', 'Premium Smartphones'
  ],
  'Laptops': [
    'Gaming Laptops', 'Business Laptops', 'Ultrabooks', '2-in-1 Laptops',
    'Student Laptops', 'Workstation Laptops', 'Chromebooks'
  ],
  'Tablets': [
    'iPad', 'Android Tablets', 'Windows Tablets', 'Kids Tablets',
    'Drawing Tablets', 'E-Readers'
  ],
  'Cameras': [
    'DSLR Cameras', 'Mirrorless Cameras', 'Point & Shoot', 'Action Cameras',
    'Professional Cameras', 'Camera Lenses', 'Camera Accessories'
  ],
  'Headphones': [
    'Wireless Headphones', 'Wired Headphones', 'Noise Cancelling', 'Earbuds',
    'Over-Ear', 'On-Ear', 'Sports Headphones', 'Gaming Headsets'
  ],
  'Speakers': [
    'Bluetooth Speakers', 'Smart Speakers', 'Home Theater Systems', 'Portable Speakers',
    'Soundbars', 'Studio Monitors', 'Party Speakers', 'Outdoor Speakers'
  ]
};

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [filesToUpload, setFilesToUpload] = useState([]);
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
    vendor: '',
    trackQuantity: true,
    allowOutOfStockPurchase: false,
    lowStockThreshold: 5,
    isFeatured: false,
    isTrending: false,
    isFlashSale: false,
    isJustArrived: false,
    flashSaleEndDate: '',
    visible: true,
    seoTitle: '',
    seoDescription: '',
    slug: '',
    requiresShipping: true,
    weight: '',
    weightUnit: 'kg',
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    freeShipping: false,
    estimatedDeliveryMin: '',
    estimatedDeliveryMax: '',
    notes: ''
  });

  const weightUnits = ['kg', 'g', 'lb', 'oz'];
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
  ];

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    let cleanPath = imagePath;
    if (cleanPath.includes('/api/')) cleanPath = cleanPath.replace('/api/', '/');
    if (cleanPath.startsWith('/uploads/')) return `${IMAGE_BASE_URL}${cleanPath}`;
    if (cleanPath.startsWith('uploads/')) return `${IMAGE_BASE_URL}/${cleanPath}`;
    return `${IMAGE_BASE_URL}/uploads/products/${cleanPath}`;
  };

  const extractImagesFromProduct = (product) => {
    if (!product) return [];
    let images = [];
    
    if (product.images && Array.isArray(product.images)) {
      images = product.images.map((img, index) => {
        if (typeof img === 'object' && img.url) {
          return {
            url: getFullImageUrl(img.url),
            altText: img.altText || product.name,
            isPrimary: img.isPrimary || index === 0,
            id: img._id || img.id || index
          };
        } else if (typeof img === 'string') {
          return {
            url: getFullImageUrl(img),
            altText: product.name,
            isPrimary: index === 0,
            id: index
          };
        }
        return null;
      }).filter(Boolean);
    } else if (product.image) {
      images = [{
        url: getFullImageUrl(product.image),
        altText: product.name,
        isPrimary: true,
        id: 'primary'
      }];
    }
    return images;
  };

  const validateField = (fieldName, value) => {
    let error = '';
    switch (fieldName) {
      case 'name':
        if (!value || String(value).trim() === '') error = 'Product name is required';
        break;
      case 'price':
        if (value === '' || value === null) error = 'Price is required';
        else {
          const priceNum = parseFloat(value);
          if (isNaN(priceNum) || priceNum < 0) error = 'Price must be a valid positive number';
        }
        break;
      case 'category':
        if (!value || String(value).trim() === '') error = 'Category is required';
        break;
      case 'stock':
        if (formData.trackQuantity && (value === '' || value === null)) {
          error = 'Stock quantity is required when tracking is enabled';
        } else if (formData.trackQuantity && parseFloat(value) < 0) {
          error = 'Stock cannot be negative';
        }
        break;
      case 'comparePrice':
        if (value && parseFloat(value) < 0) error = 'Compare price cannot be negative';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    if (name.startsWith('dimensions.')) {
      const dimensionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimensionKey]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || String(formData.name).trim() === '') newErrors.name = 'Product name is required';
    if (formData.price === '' || formData.price === null) newErrors.price = 'Price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isEditMode) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productService.getById(id);
      if (response.success) {
        const product = response.data || response.product || response;
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
          vendor: product.vendor || '',
          trackQuantity: product.trackQuantity !== false,
          allowOutOfStockPurchase: Boolean(product.allowOutOfStockPurchase),
          lowStockThreshold: product.lowStockThreshold || 5,
          isFeatured: Boolean(product.featured || product.isFeatured),
          isTrending: Boolean(product.isTrending),
          isFlashSale: Boolean(product.isFlashSale),
          isJustArrived: Boolean(product.isJustArrived),
          flashSaleEndDate: product.flashSaleEndDate || '',
          visible: product.visible !== false,
          seoTitle: product.seoTitle || '',
          seoDescription: product.seoDescription || '',
          slug: product.slug || '',
          requiresShipping: product.requiresShipping !== false,
          weight: product.weight?.toString() || '',
          weightUnit: product.weightUnit || 'kg',
          dimensions: product.dimensions || { length: '', width: '', height: '', unit: 'cm' },
          freeShipping: Boolean(product.freeShipping),
          estimatedDeliveryMin: product.estimatedDeliveryMin?.toString() || '',
          estimatedDeliveryMax: product.estimatedDeliveryMax?.toString() || '',
          notes: product.notes || ''
        });
      } else {
        toast.error('Failed to fetch product');
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

    if (validFiles.length > 0) setFilesToUpload(prev => [...prev, ...validFiles]);
    if (errors.images && totalImages + validFiles.length > 0) setErrors(prev => ({ ...prev, images: '' }));
    e.target.value = null;
  };

  const removeFile = (fileIndex) => {
    setFilesToUpload(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const removeExistingImage = (imageIndex) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imageIndex)
    }));
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
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading(isEditMode ? 'Updating product...' : 'Creating product...');

    try {
      const formDataObj = new FormData();
      
      formDataObj.append('name', String(formData.name || '').trim());
      formDataObj.append('description', String(formData.description || '').trim());
      formDataObj.append('shortDescription', String(formData.shortDescription || '').trim());
      formDataObj.append('price', parseFloat(formData.price) || 0);
      
      if (formData.comparePrice) formDataObj.append('comparePrice', parseFloat(formData.comparePrice) || 0);
      if (formData.costPerItem) formDataObj.append('costPerItem', parseFloat(formData.costPerItem) || 0);
      if (formData.stock) formDataObj.append('stock', parseInt(formData.stock) || 0);
      
      formDataObj.append('category', String(formData.category || '').trim());
      if (formData.subcategory) formDataObj.append('subcategory', String(formData.subcategory || '').trim());
      formDataObj.append('status', String(formData.status || 'draft'));
      
      formDataObj.append('featured', String(formData.isFeatured));
      formDataObj.append('isTrending', String(formData.isTrending));
      formDataObj.append('isFlashSale', String(formData.isFlashSale));
      formDataObj.append('isJustArrived', String(formData.isJustArrived));
      if (formData.flashSaleEndDate) formDataObj.append('flashSaleEndDate', formData.flashSaleEndDate);
      
      formDataObj.append('visible', String(formData.visible));
      formDataObj.append('trackQuantity', String(formData.trackQuantity));
      formDataObj.append('allowOutOfStockPurchase', String(formData.allowOutOfStockPurchase));
      formDataObj.append('lowStockThreshold', parseInt(formData.lowStockThreshold) || 5);
      
      if (formData.sku) formDataObj.append('sku', String(formData.sku).trim());
      if (formData.vendor) formDataObj.append('vendor', String(formData.vendor).trim());
      
      if (formData.seoTitle) formDataObj.append('seoTitle', String(formData.seoTitle).trim());
      if (formData.seoDescription) formDataObj.append('seoDescription', String(formData.seoDescription).trim());
      if (formData.slug) formDataObj.append('slug', String(formData.slug).trim());
      
      formDataObj.append('requiresShipping', String(formData.requiresShipping));
      if (formData.weight) formDataObj.append('weight', parseFloat(formData.weight) || 0);
      formDataObj.append('weightUnit', String(formData.weightUnit || 'kg'));
      
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        formDataObj.append('dimensions', JSON.stringify(formData.dimensions));
      }
      
      formDataObj.append('freeShipping', String(formData.freeShipping));
      if (formData.estimatedDeliveryMin) formDataObj.append('estimatedDeliveryMin', parseInt(formData.estimatedDeliveryMin) || 0);
      if (formData.estimatedDeliveryMax) formDataObj.append('estimatedDeliveryMax', parseInt(formData.estimatedDeliveryMax) || 0);
      if (formData.notes) formDataObj.append('notes', String(formData.notes).trim());
      
      if (isEditMode && formData.images.length > 0) {
        const imageUrls = formData.images.map(img => img.url);
        formDataObj.append('existingImages', JSON.stringify(imageUrls));
      }
      
      filesToUpload.forEach(file => formDataObj.append('images', file));

      let response;
      if (isEditMode) response = await productService.update(id, formDataObj);
      else response = await productService.create(formDataObj);

      toast.dismiss(loadingToast);
      
      if (response.success) {
        toast.success(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        navigate('/products');
      } else {
        toast.error(response.error?.message || 'Operation failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const totalImages = (formData.images?.length || 0) + filesToUpload.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-yellow-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <button onClick={() => navigate('/products')} className="inline-flex items-center mb-2 text-sm font-medium text-gray-400 hover:text-yellow-500">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Products
              </button>
              <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Product' : 'Create New Product'}</h1>
              <p className="mt-1 text-sm text-gray-400">{isEditMode ? 'Update product details' : 'Add a new product to your store'}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700">
                Cancel
              </button>
              <button type="submit" form="product-form" className="px-6 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700" disabled={saving}>
                {saving ? <span className="flex items-center"><ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />Saving...</span> : (isEditMode ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-8 lg:col-span-2">
              {/* Basic Information */}
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center mb-6">
                  <InformationCircleIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">Product Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Product Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name || ''} 
                      onChange={handleChange} 
                      onBlur={handleBlur} 
                      className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.name && touchedFields.name ? 'border-red-500' : 'border-gray-600'}`} 
                      placeholder="Enter product name" 
                    />
                    {errors.name && touchedFields.name && <p className="flex items-center mt-2 text-sm text-red-500"><ExclamationTriangleIcon className="w-4 h-4 mr-1" />{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Short Description</label>
                    <textarea 
                      name="shortDescription" 
                      rows={2} 
                      value={formData.shortDescription || ''} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none" 
                      placeholder="Brief description for product listings..." 
                      maxLength="500" 
                    />
                    <p className="mt-1 text-xs text-gray-500">{formData.shortDescription?.length || 0}/500 characters</p>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Full Description</label>
                    <textarea 
                      name="description" 
                      rows={6} 
                      value={formData.description || ''} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none" 
                      placeholder="Detailed product description..." 
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">Price (KSh) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        name="price" 
                        min="0" 
                        step="0.01" 
                        value={formData.price ?? ''} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.price && touchedFields.price ? 'border-red-500' : 'border-gray-600'}`} 
                        placeholder="0.00" 
                      />
                      {errors.price && touchedFields.price && <p className="flex items-center mt-2 text-sm text-red-500"><ExclamationTriangleIcon className="w-4 h-4 mr-1" />{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">Compare at Price</label>
                      <input 
                        type="number" 
                        name="comparePrice" 
                        min="0" 
                        step="0.01" 
                        value={formData.comparePrice ?? ''} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                        placeholder="0.00" 
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">Cost per Item</label>
                      <input 
                        type="number" 
                        name="costPerItem" 
                        min="0" 
                        step="0.01" 
                        value={formData.costPerItem ?? ''} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">Category <span className="text-red-500">*</span></label>
                      <select 
                        name="category" 
                        value={formData.category || ''} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${errors.category && touchedFields.category ? 'border-red-500' : 'border-gray-600'}`}
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                      </select>
                      {errors.category && touchedFields.category && <p className="flex items-center mt-2 text-sm text-red-500"><ExclamationTriangleIcon className="w-4 h-4 mr-1" />{errors.category}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">Subcategory</label>
                      <select 
                        name="subcategory" 
                        value={formData.subcategory || ''} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                        disabled={!formData.category}
                      >
                        <option value="">Select subcategory</option>
                        {formData.category && SUBCATEGORIES[formData.category]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">SKU</label>
                      <input 
                        type="text" 
                        name="sku" 
                        value={formData.sku || ''} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                        placeholder="e.g., PROD-001" 
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">Vendor</label>
                      <input 
                        type="text" 
                        name="vendor" 
                        value={formData.vendor || ''} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                        placeholder="Supplier name" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center mb-6">
                  <CubeIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">Stock Management</h2>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="trackQuantity" 
                      name="trackQuantity" 
                      checked={formData.trackQuantity} 
                      onChange={handleChange} 
                      className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                    />
                    <label htmlFor="trackQuantity" className="block ml-2 text-sm text-gray-300">Track quantity</label>
                  </div>
                  {formData.trackQuantity && (
                    <>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">Stock Quantity</label>
                          <input 
                            type="number" 
                            name="stock" 
                            min="0" 
                            value={formData.stock ?? ''} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                            placeholder="0" 
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">Low Stock Threshold</label>
                          <input 
                            type="number" 
                            name="lowStockThreshold" 
                            min="1" 
                            value={formData.lowStockThreshold ?? 5} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                            placeholder="5" 
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="allowOutOfStockPurchase" 
                          name="allowOutOfStockPurchase" 
                          checked={formData.allowOutOfStockPurchase} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                        />
                        <label htmlFor="allowOutOfStockPurchase" className="block ml-2 text-sm text-gray-300">Allow out of stock purchases</label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center mb-6">
                  <PhotoIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">Product Images ({totalImages}/{MAX_IMAGES})</h2>
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
                {totalImages < MAX_IMAGES && (
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer ${errors.images ? 'border-red-500 bg-red-50' : 'border-gray-600 hover:border-yellow-500 hover:bg-gray-700'}`} 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-3 ${errors.images ? 'text-red-500' : 'text-gray-500'}`} />
                    <p className="mb-1 text-sm font-medium text-white">Click to upload images</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB each</p>
                  </div>
                )}
                {totalImages > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-sm font-medium text-white">Image Gallery</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {formData.images.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <div className="overflow-hidden bg-gray-700 border border-gray-600 rounded-lg aspect-square">
                            <img 
                              src={image.url} 
                              alt={image.altText} 
                              className="object-cover w-full h-full" 
                              onError={(e) => e.target.src = FALLBACK_IMAGES.thumbnail} 
                            />
                          </div>
                          <div className="absolute inset-0 transition-all bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-40">
                            <button 
                              type="button" 
                              onClick={() => removeExistingImage(index)} 
                              className="absolute p-1 text-red-600 bg-white rounded-full shadow-lg opacity-0 top-2 right-2 group-hover:opacity-100 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                            {!image.isPrimary && (
                              <button 
                                type="button" 
                                onClick={() => setPrimaryImage(index)} 
                                className="absolute px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded opacity-0 bottom-2 left-2 group-hover:opacity-100 hover:bg-gray-900"
                              >
                                Set Primary
                              </button>
                            )}
                          </div>
                          {image.isPrimary && (
                            <div className="absolute px-2 py-1 text-xs font-medium text-white bg-yellow-600 rounded top-2 left-2">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                      {filesToUpload.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <div className="overflow-hidden bg-gray-700 border-2 border-yellow-500 rounded-lg aspect-square">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`New image ${index + 1}`} 
                              className="object-cover w-full h-full" 
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFile(index)} 
                            className="absolute p-1 text-red-600 bg-white rounded-full shadow-lg opacity-0 top-2 right-2 group-hover:opacity-100"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <div className="absolute px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded bottom-2 left-2">
                            New
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
              {/* Status & Labels */}
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center mb-6">
                  <TagIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">Status & Labels</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Product Status</label>
                    <select 
                      name="status" 
                      value={formData.status || ''} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="visible" 
                      name="visible" 
                      checked={formData.visible} 
                      onChange={handleChange} 
                      className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                    />
                    <label htmlFor="visible" className="block ml-2 text-sm text-gray-300">Visible in store</label>
                  </div>
                  <div className="pt-4 mt-2 border-t border-gray-700">
                    <h3 className="flex items-center mb-3 text-sm font-medium text-gray-300">
                      <SparklesIcon className="w-4 h-4 mr-2 text-yellow-500" />
                      Product Labels
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="isFeatured" 
                          name="isFeatured" 
                          checked={formData.isFeatured} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                        />
                        <label htmlFor="isFeatured" className="flex items-center ml-2 text-sm text-gray-300">
                          <StarIcon className="w-4 h-4 mr-1.5 text-yellow-500" />
                          Featured Product
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="isTrending" 
                          name="isTrending" 
                          checked={formData.isTrending} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                        />
                        <label htmlFor="isTrending" className="flex items-center ml-2 text-sm text-gray-300">
                          <FireIcon className="w-4 h-4 mr-1.5 text-orange-500" />
                          Trending Product
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="isFlashSale" 
                          name="isFlashSale" 
                          checked={formData.isFlashSale} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                        />
                        <label htmlFor="isFlashSale" className="flex items-center ml-2 text-sm text-gray-300">
                          <BoltIcon className="w-4 h-4 mr-1.5 text-yellow-500" />
                          Flash Sale
                        </label>
                      </div>
                      {formData.isFlashSale && (
                        <div className="ml-6">
                          <label className="block mb-2 text-xs font-medium text-gray-400">Flash Sale End Date</label>
                          <input 
                            type="datetime-local" 
                            name="flashSaleEndDate" 
                            value={formData.flashSaleEndDate || ''} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                          />
                        </div>
                      )}
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="isJustArrived" 
                          name="isJustArrived" 
                          checked={formData.isJustArrived} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                        />
                        <label htmlFor="isJustArrived" className="flex items-center ml-2 text-sm text-gray-300">
                          <SparklesIcon className="w-4 h-4 mr-1.5 text-green-500" />
                          Just Arrived / New
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center mb-6">
                  <TruckIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">Shipping Information</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="requiresShipping" 
                      name="requiresShipping" 
                      checked={formData.requiresShipping} 
                      onChange={handleChange} 
                      className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                    />
                    <label htmlFor="requiresShipping" className="block ml-2 text-sm text-gray-300">This product requires shipping</label>
                  </div>
                  {formData.requiresShipping && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">Weight</label>
                          <input 
                            type="number" 
                            name="weight" 
                            min="0" 
                            step="0.01" 
                            value={formData.weight ?? ''} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                            placeholder="0.5" 
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">Unit</label>
                          <select 
                            name="weightUnit" 
                            value={formData.weightUnit || ''} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          >
                            {weightUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">Min Days</label>
                          <input 
                            type="number" 
                            name="estimatedDeliveryMin" 
                            min="1" 
                            value={formData.estimatedDeliveryMin ?? ''} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                            placeholder="3" 
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">Max Days</label>
                          <input 
                            type="number" 
                            name="estimatedDeliveryMax" 
                            min="1" 
                            value={formData.estimatedDeliveryMax ?? ''} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                            placeholder="7" 
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="freeShipping" 
                          name="freeShipping" 
                          checked={formData.freeShipping} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-yellow-600 border-gray-600 rounded focus:ring-yellow-500" 
                        />
                        <label htmlFor="freeShipping" className="block ml-2 text-sm text-gray-300">Free Shipping</label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SEO */}
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center mb-6">
                  <EyeIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">SEO</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">SEO Title</label>
                    <input 
                      type="text" 
                      name="seoTitle" 
                      value={formData.seoTitle || ''} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                      placeholder="Title for search engines" 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">SEO Description</label>
                    <textarea 
                      name="seoDescription" 
                      rows={2} 
                      value={formData.seoDescription || ''} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none" 
                      placeholder="Description for search engines" 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">URL Slug</label>
                    <input 
                      type="text" 
                      name="slug" 
                      value={formData.slug || ''} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
                      placeholder="product-url-slug" 
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="p-6 bg-gray-800 border border-gray-700 rounded-xl">
                <div className="flex items-center mb-6">
                  <InformationCircleIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">Internal Notes</h2>
                </div>
                <textarea 
                  name="notes" 
                  rows={4} 
                  value={formData.notes || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none" 
                  placeholder="Add internal notes about this product..." 
                />
                <p className="mt-1 text-xs text-gray-500">These notes are only visible to staff</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;