import axios from 'axios';

// IMPORTANT: Use the correct backend URL - should be http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

console.log('🔗 Admin API connecting to:', API_BASE_URL);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
  // Prevent axios from automatically following redirects
  maxRedirects: 0, // This is key - don't follow redirects automatically
  validateStatus: function (status) {
    // Accept all status codes, we'll handle 301 manually
    return status >= 200 && status < 500;
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token if available
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    console.log(`📤 Admin Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Admin Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Admin Response: ${response.status} ${response.config.url}`);
    
    // Handle 301 redirects
    if (response.status === 301 || response.status === 308) {
      const redirectUrl = response.headers.location;
      console.log(`🔄 301 Redirect detected to: ${redirectUrl}`);
      
      // If we get a 301, we should retry the request with the correct URL
      const originalRequest = response.config;
      
      // Check if the redirect is just adding/removing a trailing slash
      if (redirectUrl && redirectUrl.includes(originalRequest.url)) {
        console.log('🔄 Redirect appears to be trailing slash issue');
        // We'll let the individual service handle this
      }
      
      // Return the response so the service can handle it
      return response;
    }
    
    return response;
  },
  (error) => {
    console.error('❌ Admin API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
    });
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error: Cannot connect to backend');
      
      // Show user-friendly error
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('admin-network-error', {
          detail: { 
            message: 'Cannot connect to server. Make sure backend is running on http://localhost:5000',
            type: 'network'
          }
        });
        window.dispatchEvent(event);
      }
    }
    
    // Handle 301 redirects in error handler
    if (error.response?.status === 301 || error.response?.status === 308) {
      const redirectUrl = error.response.headers.location;
      console.log(`🔄 Got 301 redirect to: ${redirectUrl}`);
      
      // Create a new error with redirect info
      const redirectError = new Error(`Request redirected to ${redirectUrl}`);
      redirectError.isRedirect = true;
      redirectError.redirectUrl = redirectUrl;
      redirectError.originalUrl = error.config.url;
      throw redirectError;
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('⚠️ Admin session expired');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Access forbidden - insufficient permissions');
    }
    
    // Return standardized error
    return Promise.reject({
      message: error.response?.data?.message || 
              error.response?.data?.error || 
              error.message || 
              'An unexpected error occurred',
      status: error.response?.status || 
             (error.code === 'ERR_NETWORK' ? 0 : 500),
      data: error.response?.data,
      code: error.code,
      config: error.config,
    });
  }
);

// Special API client that follows redirects
export const apiWithRedirects = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
  maxRedirects: 5, // Allow redirects for this client
});

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing admin connection to:', API_BASE_URL);
    const response = await axios.get(`${API_BASE_URL}/api/health`, { 
      timeout: 5000,
      withCredentials: true,
      maxRedirects: 5,
    });
    console.log('✅ Admin backend connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Admin backend connection failed:', error.message);
    console.log('💡 Backend URL being tested:', API_BASE_URL);
    console.log('💡 Full URL:', `${API_BASE_URL}/api/health`);
    return false;
  }
};

export default api;