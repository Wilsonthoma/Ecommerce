// client/src/services/client/api.js - FIXED with single source of truth
import axios from "axios";

// ✅ FIXED: Add /api to base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const clientApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
clientApi.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookies (it should be in cookies with withCredentials)
    // OR from localStorage as fallback
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || localStorage.getItem("csrfToken");
    
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    // Get auth token if available
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - REMOVED any toast notifications
clientApi.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle CSRF token expiration
    if (error.response?.status === 403 && 
        error.response?.data?.message?.toLowerCase().includes("csrf") && 
        !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Refreshing CSRF token...');
        // ✅ FIXED: Use correct CSRF endpoint
        const csrfResponse = await axios.get(`${API_BASE_URL}/auth/csrf-token`, {
          withCredentials: true,
        });

        if (csrfResponse.data.csrfToken) {
          localStorage.setItem("csrfToken", csrfResponse.data.csrfToken);
          originalRequest.headers["X-CSRF-Token"] = csrfResponse.data.csrfToken;
          console.log('✅ CSRF token refreshed');
          return clientApi(originalRequest);
        }
      } catch (csrfError) {
        console.error("❌ Failed to refresh CSRF token:", csrfError);
      }
    }

    // Handle 401 Unauthorized - NO TOAST HERE
    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized access");
      // Don't redirect if already on login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("csrfToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        // Don't show toast here - let the component handle it
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default clientApi;

// Helper functions
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

export const setCsrfToken = (csrfToken) => {
  if (csrfToken) {
    localStorage.setItem("csrfToken", csrfToken);
    clientApi.defaults.headers.common["X-CSRF-Token"] = csrfToken;
  } else {
    localStorage.removeItem("csrfToken");
    delete clientApi.defaults.headers.common["X-CSRF-Token"];
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("csrfToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberedEmail");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("redirectAfterLogin");
  delete clientApi.defaults.headers.common["Authorization"];
  delete clientApi.defaults.headers.common["X-CSRF-Token"];
};