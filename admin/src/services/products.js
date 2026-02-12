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
    
    // Map status codes to error types
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
    
    // Extract validation errors from backend response
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

// Helper to normalize product data from API
const normalizeProductData = (product) => {
  if (!product) return null;
  
  // Extract image URL from different possible structures
  let imageUrl = '';
  let imagesArray = [];
  
  if (product.images && Array.isArray(product.images)) {
    imagesArray = product.images.map(img => {
      if (typeof img === 'string') {
        return { url: img, altText: product.name || '', isPrimary: false };
      } else if (img && img.url) {
        return { 
          url: img.url, 
          altText: img.altText || product.name || '', 
          isPrimary: img.isPrimary || false 
        };
      }
      return { url: '', altText: '', isPrimary: false };
    }).filter(img => img.url);
    
    // Use first image as primary if no primary is set
    if (imagesArray.length > 0) {
      imageUrl = imagesArray[0].url;
      if (!imagesArray.some(img => img.isPrimary)) {
        imagesArray[0].isPrimary = true;
      }
    }
  } else if (product.image) {
    imageUrl = product.image;
    imagesArray = [{ url: product.image, altText: product.name || '', isPrimary: true }];
  } else if (product.thumbnail) {
    imageUrl = product.thumbnail;
    imagesArray = [{ url: product.thumbnail, altText: product.name || '', isPrimary: true }];
  }
  
  return {
    id: product._id || product.id,
    _id: product._id || product.id,
    name: product.name || '',
    description: product.description || '',
    price: product.price || product.unitPrice || 0,
    cost: product.cost || product.costPerItem || 0,
    stock: product.quantity || product.stock || product.inventory || 0,
    quantity: product.quantity || product.stock || product.inventory || 0,
    category: product.category || '',
    images: imagesArray,
    image: imageUrl,
    status: product.status || 'draft',
    sku: product.sku || '',
    barcode: product.barcode || '',
    weight: product.weight || 0,
    weightUnit: product.weightUnit || 'kg',
    dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
    tags: Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(',').map(t => t.trim()) : []),
    featured: Boolean(product.featured),
    createdAt: product.createdAt || product.createdDate || new Date().toISOString(),
    updatedAt: product.updatedAt || product.modifiedDate || new Date().toISOString(),
    trackQuantity: product.trackQuantity !== false,
    allowOutOfStockPurchase: Boolean(product.allowOutOfStockPurchase),
  };
};

// Helper to normalize products array
const normalizeProductsData = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalizeProductData);
  }
  
  if (data && typeof data === 'object') {
    // Check for common API response structures
    if (Array.isArray(data.data)) {
      return data.data.map(normalizeProductData);
    }
    if (Array.isArray(data.products)) {
      return data.products.map(normalizeProductData);
    }
    if (Array.isArray(data.results)) {
      return data.results.map(normalizeProductData);
    }
    if (Array.isArray(data.items)) {
      return data.items.map(normalizeProductData);
    }
    if (data._id || data.id) {
      return [normalizeProductData(data)];
    }
  }
  
  return [];
};

export const productService = {
  // Configuration
  config: API_CONFIG,

  // Get all products with enhanced filtering and pagination
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
        minPrice: '',
        maxPrice: '',
        minStock: '',
        maxStock: '',
        ...filters,
      };

      // Clean up filters - remove empty values
      const cleanFilters = {};
      Object.entries(defaultFilters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined && !(typeof value === 'object' && Object.keys(value).length === 0)) {
          // Handle nested objects
          if (typeof value === 'object' && !Array.isArray(value)) {
            const nestedValues = Object.values(value).filter(v => v !== '' && v !== null && v !== undefined);
            if (nestedValues.length > 0) {
              cleanFilters[key] = value;
            }
          } else {
            cleanFilters[key] = value;
          }
        }
      });

      console.log('Fetching products with filters:', cleanFilters);

      const response = await retryRequest(() => 
        api.get('/admin/products', { 
          params: cleanFilters,
          timeout: API_CONFIG.TIMEOUT,
        })
      );
      
      console.log('Raw API response:', response.data);
      
      // Normalize the response data
      const normalizedData = normalizeProductsData(response.data);
      
      return {
        success: true,
        data: normalizedData,
        pagination: {
          page: parseInt(cleanFilters.page) || 1,
          limit: parseInt(cleanFilters.limit) || 100,
          total: response.data?.total || normalizedData.length,
          totalPages: response.data?.totalPages || Math.ceil(normalizedData.length / (cleanFilters.limit || 100)),
        },
      };
    } catch (error) {
      console.error('Error in getAll:', error);
      const errorDetails = formatError(error, 'fetching products');
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Get single product
  getById: async (id, options = {}) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      const config = {
        timeout: API_CONFIG.TIMEOUT,
        ...options,
      };

      const response = await retryRequest(() => 
        api.get(`/admin/products/${id}`, config)
      );

      const normalizedData = normalizeProductData(response.data);
      
      return {
        success: true,
        data: normalizedData,
      };
    } catch (error) {
      const errorDetails = formatError(error, `fetching product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Create product with FormData
  create: async (formData, options = {}) => {
    try {
      // Validate required fields
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

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: API_CONFIG.TIMEOUT,
      };

      console.log('Creating product...');
      const response = await retryRequest(() => 
        api.post('/admin/products', formData, config)
      );

      const normalizedData = normalizeProductData(response.data);
      
      return {
        success: true,
        data: normalizedData,
        message: 'Product created successfully',
      };
    } catch (error) {
      const errorDetails = formatError(error, 'creating product');
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Update product with FormData or JSON
  update: async (id, data, options = {}) => {
    try {
      if (!id) {
        throw new Error('Product ID is required for update');
      }

      const isFormData = data instanceof FormData;
      
      const config = {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : {
          'Content-Type': 'application/json',
        },
        timeout: API_CONFIG.TIMEOUT,
      };

      console.log(`Updating product ${id}...`);
      const response = await retryRequest(() => 
        api.put(`/admin/products/${id}`, data, config)
      );

      const normalizedData = normalizeProductData(response.data);
      
      return {
        success: true,
        data: normalizedData,
        message: 'Product updated successfully',
      };
    } catch (error) {
      const errorDetails = formatError(error, `updating product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Delete product
  delete: async (id, options = {}) => {
    try {
      if (!id) {
        throw new Error('Product ID is required for deletion');
      }

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
      const errorDetails = formatError(error, `deleting product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Update status
  updateStatus: async (id, status) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

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
      const errorDetails = formatError(error, `updating status for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Get product statistics
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
      const errorDetails = formatError(error, 'fetching product stats');
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Upload images separately
  uploadImages: async (id, files, options = {}) => {
    try {
      if (!id) {
        throw new Error('Product ID is required for image upload');
      }

      if (!Array.isArray(files) || files.length === 0) {
        throw new Error('Files array is required for image upload');
      }

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: API_CONFIG.TIMEOUT,
      };

      const response = await retryRequest(() => 
        api.post(`/admin/products/${id}/images`, formData, config)
      );

      return {
        success: true,
        data: response.data,
        message: `${files.length} images uploaded successfully`,
      };
    } catch (error) {
      const errorDetails = formatError(error, `uploading images for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Delete image
  deleteImage: async (id, imageIndex) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      if (imageIndex === undefined || imageIndex < 0) {
        throw new Error('Valid image index is required');
      }

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
      const errorDetails = formatError(error, `deleting image for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Set primary image
  setPrimaryImage: async (id, imageIndex) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }

      if (imageIndex === undefined || imageIndex < 0) {
        throw new Error('Valid image index is required');
      }

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
      const errorDetails = formatError(error, `setting primary image for product ${id}`);
      return {
        success: false,
        error: errorDetails,
      };
    }
  },

  // Simple helper to test connection
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
      return {
        success: false,
        connected: false,
        error: error.message
      };
    }
  }
};

export default productService;