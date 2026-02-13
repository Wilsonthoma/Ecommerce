import axios from "axios";

// ✅ FIXED: Add /api to base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const clientApi = axios.create({
  baseURL: API_BASE_URL, // Now: http://localhost:5000/api
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
clientApi.interceptors.request.use(
  (config) => {
    // Get CSRF token from localStorage if available
    const csrfToken = localStorage.getItem("csrfToken");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    // Get auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Add request logging for debugging
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
clientApi.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle CSRF token expiration
    if (error.response?.status === 403 && 
        error.response?.data?.message?.includes("CSRF") && 
        !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ FIXED: Use correct CSRF endpoint
        const csrfResponse = await axios.get(`${API_BASE_URL}/auth/csrf-token`, {
          withCredentials: true,
        });

        if (csrfResponse.data.csrfToken) {
          localStorage.setItem("csrfToken", csrfResponse.data.csrfToken);
          originalRequest.headers["X-CSRF-Token"] = csrfResponse.data.csrfToken;
          return clientApi(originalRequest);
        }
      } catch (csrfError) {
        console.error("❌ Failed to refresh CSRF token:", csrfError);
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized access - redirecting to login");
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("csrfToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default clientApi;

// Helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    clientApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
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
  delete clientApi.defaults.headers.common["Authorization"];
  delete clientApi.defaults.headers.common["X-CSRF-Token"];
};