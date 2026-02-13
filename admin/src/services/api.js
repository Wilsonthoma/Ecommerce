import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

console.log('🔗 Admin API connecting to:', API_BASE_URL);

const api = axios.create({
  // ✅ CORRECT - baseURL includes /api
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
  maxRedirects: 0,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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
    
    if (response.status === 301 || response.status === 308) {
      const redirectUrl = response.headers.location;
      console.log(`🔄 301 Redirect detected to: ${redirectUrl}`);
      
      if (redirectUrl && redirectUrl.includes(originalRequest.url)) {
        console.log('🔄 Redirect appears to be trailing slash issue');
      }
      
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
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error: Cannot connect to backend');
      
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
    
    if (error.response?.status === 301 || error.response?.status === 308) {
      const redirectUrl = error.response.headers.location;
      console.log(`🔄 Got 301 redirect to: ${redirectUrl}`);
      
      const redirectError = new Error(`Request redirected to ${redirectUrl}`);
      redirectError.isRedirect = true;
      redirectError.redirectUrl = redirectUrl;
      redirectError.originalUrl = error.config.url;
      throw redirectError;
    }
    
    if (error.response?.status === 401) {
      console.warn('⚠️ Admin session expired');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 403) {
      console.error('🚫 Access forbidden - insufficient permissions');
    }
    
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

export const apiWithRedirects = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
  maxRedirects: 5,
});

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