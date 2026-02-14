// admin/src/services/products.js
import api from './api';

// Configuration constants
const API_CONFIG = {
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000,
  BASE_URL: 'http://localhost:5000'
};

// Error types for better error handling
export const ProductErrorType = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// Helper function for retry logic
const retryRequest = async (requestFn, retries = API_CONFIG.RETRY_ATTEMPTS, delay = API_CONFIG.RETRY_DELAY) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      console.warn(`Request attempt ${attempt} failed:`, error.message);
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Helper function to format API errors
const formatError = (error, context) => {
  console.error(`API Error in ${context}:`, error);
  
  const errorDetails = {
    message: 'An unexpected error occurred',
    context,
    timestamp: new Date().toISOString(),
  };

  if (error.response) {
    errorDetails.status = error.response.status;
    errorDetails.data = error.response.data;
    
    if (error.response.status === 400) {
      errorDetails.type = ProductErrorType.VALIDATION;
      errorDetails.message = error.response.data?.message || 'Validation error occurred';
    }
    else if (error.response.status === 401) {
      errorDetails.type = ProductErrorType.UNAUTHORIZED;
      errorDetails.message = 'Unauthorized access';
    }
    else if (error.response.status === 403) {
      errorDetails.type = ProductErrorType.UNAUTHORIZED;
      errorDetails.message = 'Access forbidden';
    }
    else if (error.response.status === 404) {
      errorDetails.type = ProductErrorType.NOT_FOUND;
      errorDetails.message = 'Resource not found';
    }
    else if (error.response.status >= 500) {
      errorDetails.type = ProductErrorType.SERVER;
      errorDetails.message = 'Server error occurred';
    }
    else {
      errorDetails.type = ProductErrorType.UNKNOWN;
      errorDetails.message = error.response.data?.message || 'Unknown error occurred';
    }
    
    if (error.response.data?.errors) {
      errorDetails.validationErrors = error.response.data.errors;
    }
  } else if (error.request) {
    errorDetails.type = ProductErrorType.NETWORK;
    errorDetails.message = 'Network error - Please check your connection';
  } else if (error.message) {
    errorDetails.message = error.message;
    errorDetails.type = ProductErrorType.UNKNOWN;
  }

  return errorDetails;
};

// Helper to normalize product data from API with stock fields
const normalizeProductData = (product) => {
  if (!product) return null;
  
  console.log('🔄 Normalizing product:', product);
  
  let imageUrl = '';
  let imagesArray = [];
  
  // ✅ Extract images properly for multiple formats
  if (product.images && Array.isArray(product.images)) {
    imagesArray = product.images.map((img, index) => {
      if (typeof img === 'string') {
        return { 
          url: img, 
          altText: product.name || '', 
          isPrimary: index === 0 
        };
      } else if (img && typeof img === 'object') {
        // Handle object with url property
        const url = img.url || img.src || img.path;
        if (url) {
          return { 
            url, 
            altText: img.altText || product.name || '', 
            isPrimary: img.isPrimary || index === 0,
            id: img._id || img.id || index
          };
        }
      }
      return null;
    }).filter(Boolean);
  } 
  
  // Handle single image field
  if (imagesArray.length === 0) {
    if (product.image && typeof product.image === 'string') {
      imageUrl = product.image;
      imagesArray = [{ url: product.image, altText: product.name || '', isPrimary: true }];
    } else if (product.image && typeof product.image === 'object' && product.image.url) {
      imageUrl = product.image.url;
      imagesArray = [{ 
        url: product.image.url, 
        altText: product.image.altText || product.name || '', 
        isPrimary: true 
      }];
    } else if (product.thumbnail) {
      imageUrl = product.thumbnail;
      imagesArray = [{ url: product.thumbnail, altText: product.name || '', isPrimary: true }];
    }
  }
  
  // Ensure we have at least the image URL
  if (imagesArray.length === 0 && imageUrl) {
    imagesArray = [{ url: imageUrl, altText: product.name || '', isPrimary: true }];
  }
  
  // ✅ Calculate stock status based on quantity and settings
  const stockQuantity = parseInt(product.quantity || product.stock || product.inventory || 0);
  const trackQuantity = product.trackQuantity !== false;
  const allowOutOfStock = product.allowOutOfStockPurchase || false;
  const lowStockThreshold = product.lowStockThreshold || 5;
  
  let stockStatus = 'available';
  let inStock = true;
  
  if (trackQuantity) {
    if (stockQuantity <= 0 && !allowOutOfStock) {
      stockStatus = 'sold';
      inStock = false;
    } else if (stockQuantity <= 0 && allowOutOfStock) {
      stockStatus = 'backorder';
      inStock = true;
    } else if (stockQuantity <= lowStockThreshold) {
      stockStatus = 'low';
      inStock = true;
    } else {
      stockStatus = 'available';
      inStock = true;
    }
  }
  
  const normalized = {
    id: product._id || product.id,
    _id: product._id || product.id,
    name: product.name || '',
    description: product.description || '',
    price: parseFloat(product.price || product.unitPrice || 0),
    comparePrice: parseFloat(product.comparePrice || 0),
    cost: parseFloat(product.cost || product.costPerItem || 0),
    // Stock fields
    quantity: stockQuantity,
    stock: stockQuantity,
    trackQuantity: trackQuantity,
    allowOutOfStockPurchase: allowOutOfStock,
    lowStockThreshold: lowStockThreshold,
    stockStatus: stockStatus,
    inStock: inStock,
    category: product.category || '',
    images: imagesArray,
    image: imageUrl || (imagesArray[0]?.url || ''),
    status: product.status || 'draft',
    sku: product.sku || '',
    barcode: product.barcode || '',
    weight: parseFloat(product.weight || 0),
    weightUnit: product.weightUnit || 'kg',
    dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
    tags: Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(',').map(t => t.trim()) : []),
    featured: Boolean(product.featured),
    createdAt: product.createdAt || product.createdDate || new Date().toISOString(),
    updatedAt: product.updatedAt || product.modifiedDate || new Date().toISOString(),
  };
  
  console.log('✅ Normalized product:', {
    id: normalized.id,
    name: normalized.name,
    stock: normalized.quantity,
    stockStatus: normalized.stockStatus,
    imageCount: normalized.images.length
  });
  
  return normalized;
};

// Helper to normalize products array
const normalizeProductsData = (data) => {
  console.log('🔄 Normalizing products data:', data);
  
  if (!data) return [];
  
  // If it's already an array
  if (Array.isArray(data)) {
    return data.map(normalizeProductData).filter(Boolean);
  }
  
  // If it's an object with common patterns
  if (data && typeof data === 'object') {
    // Check for common array properties
    const possibleArrays = ['data', 'products', 'results', 'items', 'docs'];
    for (const key of possibleArrays) {
      if (Array.isArray(data[key])) {
        return data[key].map(normalizeProductData).filter(Boolean);
      }
    }
    
    // If it's a single product object with _id or id
    if (data._id || data.id) {
      const normalized = normalizeProductData(data);
      return normalized ? [normalized] : [];
    }
  }
  
  return [];
};

export const productService = {
  config: API_CONFIG,

  getAll: async (filters = {}) => {
    try {
      const defaultFilters = {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
        category: '',
        status: '',
        stockStatus: '', // Filter by stock status
        minPrice: '',
        maxPrice: '',
        minStock: '',
        maxStock: '',
        ...filters,
      };

      const cleanFilters = {};
      Object.entries(defaultFilters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            const nestedValues = Object.values(value).filter(v => v !== '' && v !== null && v !== undefined);
            if (nestedValues.length > 0) {
              cleanFilters[key] = value;
            }
          } else if (value !== '') {
            cleanFilters[key] = value;
          }
        }
      });

      console.log('📤 Fetching products with filters:', cleanFilters);

      const response = await retryRequest(() => 
        api.get('/admin/products', { 
          params: cleanFilters,
          timeout: API_CONFIG.TIMEOUT,
        })
      );
      
      console.log('📦 Raw API response:', response.data);
      
      const normalizedData = normalizeProductsData(response.data);
      console.log('✨ Normalized data:', normalizedData);
      
      return {
        success: true,
        data: normalizedData,
        pagination: {
          page: response.data?.page || parseInt(cleanFilters.page) || 1,
          limit: response.data?.limit || parseInt(cleanFilters.limit) || 100,
          total: response.data?.total || response.data?.count || normalizedData.length,
          totalPages: response.data?.totalPages || response.data?.pages || Math.ceil(normalizedData.length / (cleanFilters.limit || 100)),
        },
      };
    } catch (error) {
      console.error('❌ Error in getAll:', error);
      const errorDetails = formatError(error, 'fetching products');
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  getById: async (id, options = {}) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      console.log(`🔍 Fetching product ${id}...`);

      const response = await retryRequest(() => 
        api.get(`/admin/products/${id}`, {
          timeout: API_CONFIG.TIMEOUT,
          ...options,
        })
      );

      console.log('📦 Raw product response:', response.data);
      
      // Handle different response structures
      let productData = response.data;
      
      // Case 1: response.data.product exists
      if (response.data.product) {
        productData = response.data.product;
      } 
      // Case 2: response.data.data exists
      else if (response.data.data) {
        productData = response.data.data;
      }
      // Case 3: response.data itself is the product
      else if (response.data._id || response.data.id) {
        productData = response.data;
      }
      // Case 4: response.data.success and response.data.data
      else if (response.data.success && response.data.data) {
        productData = response.data.data;
      }

      console.log('📊 Extracted product data:', productData);

      const normalizedData = normalizeProductData(productData);
      console.log('✨ Normalized product:', normalizedData);
      
      return {
        success: true,
        data: normalizedData,
      };
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      const errorDetails = formatError(error, `fetching product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  create: async (formData, options = {}) => {
    try {
      const name = formData.get('name');
      const price = formData.get('price');
      const stock = formData.get('stock');
      const category = formData.get('category');
      
      if (!name || name.toString().trim() === '') {
        throw new Error('Product name is required');
      }
      if (!price || isNaN(parseFloat(price))) {
        throw new Error('Valid price is required');
      }
      if (!stock || isNaN(parseInt(stock))) {
        throw new Error('Valid stock quantity is required');
      }
      if (!category || category.toString().trim() === '') {
        throw new Error('Category is required');
      }

      console.log('📝 Creating product...');
      
      const response = await retryRequest(() => 
        api.post('/admin/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      const normalizedData = normalizeProductData(response.data);
      
      return {
        success: true,
        data: normalizedData,
        message: 'Product created successfully',
      };
    } catch (error) {
      console.error('❌ Error creating product:', error);
      const errorDetails = formatError(error, 'creating product');
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  update: async (id, data, options = {}) => {
    try {
      if (!id) {
        throw new Error('Product ID is required for update');
      }

      const isFormData = data instanceof FormData;
      
      console.log(`📝 Updating product ${id}...`);

      const response = await retryRequest(() => 
        api.put(`/admin/products/${id}`, data, {
          headers: isFormData ? {
            'Content-Type': 'multipart/form-data',
          } : {
            'Content-Type': 'application/json',
          },
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      const normalizedData = normalizeProductData(response.data);
      
      return {
        success: true,
        data: normalizedData,
        message: 'Product updated successfully',
      };
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      const errorDetails = formatError(error, `updating product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  delete: async (id, options = {}) => {
    try {
      if (!id) {
        throw new Error('Product ID is required for deletion');
      }

      console.log(`🗑️ Deleting product ${id}...`);

      const response = await retryRequest(() => 
        api.delete(`/admin/products/${id}`, {
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      return {
        success: true,
        data: response.data,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      const errorDetails = formatError(error, `deleting product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  updateStatus: async (id, status) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      console.log(`🔄 Updating status for product ${id} to ${status}...`);

      const response = await retryRequest(() => 
        api.patch(`/admin/products/${id}/status`, { status }, {
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      const normalizedData = normalizeProductData(response.data);
      
      return {
        success: true,
        data: normalizedData,
        message: `Status updated to ${status}`,
      };
    } catch (error) {
      console.error(`❌ Error updating status for product ${id}:`, error);
      const errorDetails = formatError(error, `updating status for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  updateStock: async (id, stockData) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      console.log(`📦 Updating stock for product ${id}:`, stockData);

      const response = await retryRequest(() => 
        api.patch(`/admin/products/${id}/stock`, stockData, {
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      const normalizedData = normalizeProductData(response.data);
      
      return {
        success: true,
        data: normalizedData,
        message: 'Stock updated successfully',
      };
    } catch (error) {
      console.error(`❌ Error updating stock for product ${id}:`, error);
      const errorDetails = formatError(error, `updating stock for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  getStats: async () => {
    try {
      const response = await retryRequest(() => 
        api.get('/admin/products/stats', {
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error fetching product stats:', error);
      const errorDetails = formatError(error, 'fetching product stats');
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  uploadImages: async (id, files, options = {}) => {
    try {
      if (!id) {
        throw new Error('Product ID is required for image upload');
      }

      if (!Array.isArray(files) || files.length === 0) {
        throw new Error('Files array is required for image upload');
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      console.log(`📸 Uploading ${files.length} images for product ${id}...`);

      const response = await retryRequest(() => 
        api.post(`/admin/products/${id}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      return {
        success: true,
        data: response.data,
        message: `${files.length} images uploaded successfully`,
      };
    } catch (error) {
      console.error(`❌ Error uploading images for product ${id}:`, error);
      const errorDetails = formatError(error, `uploading images for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  deleteImage: async (id, imageIndex) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      if (imageIndex === undefined || imageIndex < 0) {
        throw new Error('Valid image index is required');
      }

      console.log(`🗑️ Deleting image ${imageIndex} for product ${id}...`);

      const response = await retryRequest(() => 
        api.delete(`/admin/products/${id}/images/${imageIndex}`, {
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      return {
        success: true,
        data: response.data,
        message: 'Image deleted successfully',
      };
    } catch (error) {
      console.error(`❌ Error deleting image for product ${id}:`, error);
      const errorDetails = formatError(error, `deleting image for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  setPrimaryImage: async (id, imageIndex) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      if (imageIndex === undefined || imageIndex < 0) {
        throw new Error('Valid image index is required');
      }

      console.log(`⭐ Setting image ${imageIndex} as primary for product ${id}...`);

      const response = await retryRequest(() => 
        api.put(`/admin/products/${id}/images/${imageIndex}/primary`, {}, {
          timeout: API_CONFIG.TIMEOUT,
        })
      );

      return {
        success: true,
        data: response.data,
        message: 'Primary image set successfully',
      };
    } catch (error) {
      console.error(`❌ Error setting primary image for product ${id}:`, error);
      const errorDetails = formatError(error, `setting primary image for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  testConnection: async () => {
    try {
      const response = await api.get('/health', {
        timeout: 5000,
      });
      return {
        success: true,
        connected: true,
        message: 'Connected to API',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        connected: false,
        error: error.message
      };
    }
  }
};

export default productService;