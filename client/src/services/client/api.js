// client/src/services/client/api.js - FIXED with single source of truth
import axios from "axios";

// ✅ Base URL with /api prefix
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

// Create axios instance
const clientApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // Important for cookies (CSRF, sessions)
});

// ==================== REQUEST INTERCEPTOR ====================
clientApi.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookies (set by server with withCredentials)
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || localStorage.getItem("csrfToken");
    
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    // Get auth token from storage
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
clientApi.interceptors.response.use(
  (response) => {
    // Log success in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ===== HANDLE CSRF TOKEN EXPIRATION =====
    if (error.response?.status === 403 && 
        error.response?.data?.message?.toLowerCase().includes("csrf") && 
        !originalRequest._retry) {
      
      originalRequest._retry = true;

      try {
        console.log('🔄 Refreshing CSRF token...');
        
        // Get new CSRF token
        const csrfResponse = await axios.get(`${API_BASE_URL}/auth/csrf-token`, {
          withCredentials: true,
        });

        if (csrfResponse.data.csrfToken) {
          // Store new token
          localStorage.setItem("csrfToken", csrfResponse.data.csrfToken);
          
          // Update request headers
          originalRequest.headers["X-CSRF-Token"] = csrfResponse.data.csrfToken;
          
          console.log('✅ CSRF token refreshed');
          return clientApi(originalRequest);
        }
      } catch (csrfError) {
        console.error("❌ Failed to refresh CSRF token:", csrfError);
      }
    }

    // ===== HANDLE 401 UNAUTHORIZED =====
    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized access - redirecting to login");
      
      // Only redirect if not already on login page
      const isLoginPage = window.location.pathname.includes("/login") || 
                          window.location.pathname.includes("/register");
      
      if (!isLoginPage && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear auth data
        clearAuthData();
        
        // Store current path for redirect after login
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        
        // Redirect to login
        window.location.href = "/login";
      }
    }

    // ===== HANDLE NETWORK ERRORS =====
    if (!error.response) {
      console.error("🌐 Network Error - Server may be down");
      error.message = "Network error. Please check your connection.";
    }

    // Log error details in development
    if (import.meta.env.DEV) {
      console.error("❌ Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    return Promise.reject(error);
  }
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Set authentication token
 * @param {string} token - JWT token
 * @param {boolean} remember - Whether to remember user (localStorage vs sessionStorage)
 */
export const setAuthToken = (token, remember = false) => {
  if (token) {
    if (remember) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }
    clientApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    delete clientApi.defaults.headers.common["Authorization"];
  }
};

/**
 * Set CSRF token
 * @param {string} csrfToken - CSRF token
 */
export const setCsrfToken = (csrfToken) => {
  if (csrfToken) {
    localStorage.setItem("csrfToken", csrfToken);
    clientApi.defaults.headers.common["X-CSRF-Token"] = csrfToken;
  } else {
    localStorage.removeItem("csrfToken");
    delete clientApi.defaults.headers.common["X-CSRF-Token"];
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  // Clear tokens
  localStorage.removeItem("token");
  localStorage.removeItem("csrfToken");
  sessionStorage.removeItem("token");
  
  // Clear user data
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  
  // Clear any saved redirects
  sessionStorage.removeItem("redirectAfterLogin");
  
  // Clear headers
  delete clientApi.defaults.headers.common["Authorization"];
  delete clientApi.defaults.headers.common["X-CSRF-Token"];
  
  console.log("🧹 Auth data cleared");
};

/**
 * Get current auth token
 * @returns {string|null} Current token
 */
export const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get stored user data
 * @returns {Object|null} User data
 */
export const getUserData = () => {
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

/**
 * Set user data
 * @param {Object} user - User object
 * @param {boolean} remember - Whether to remember
 */
export const setUserData = (user, remember = false) => {
  const userStr = JSON.stringify(user);
  if (remember) {
    localStorage.setItem("user", userStr);
  } else {
    sessionStorage.setItem("user", userStr);
  }
};

// ==================== EXPORTS ====================

export default clientApi;