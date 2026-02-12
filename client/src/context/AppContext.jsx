import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Configure Axios globally
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = backendUrl;
  
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Accept'] = 'application/json';

  // Global states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);

  // Token management
  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const setToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Test backend connection
  const testBackendConnection = useCallback(async () => {
    try {
      const response = await axios.get(`/api/health`, { 
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        console.log("✅ Backend connected:", response.data.message);
        setBackendAvailable(true);
        return true;
      }
    } catch (error) {
      console.warn("❌ Backend connection failed:", error.message);
    }
    
    setBackendAvailable(false);
    return false;
  }, []);

  // Initialize CSRF token
  const initializeCsrfToken = useCallback(async () => {
    if (!backendAvailable) return null;

    try {
      const response = await axios.get(`/api/csrf-token`, { 
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.data?.csrfToken) {
        axios.defaults.headers.common["X-CSRF-Token"] = response.data.csrfToken;
        setCsrfToken(response.data.csrfToken);
        console.log("✅ CSRF token initialized");
        return response.data.csrfToken;
      }
    } catch (error) {
      console.warn("⚠️ CSRF token not available, continuing without CSRF");
    }
    return null;
  }, [backendAvailable]);

  // ✅ FIXED: Fetch user data using /api/auth/me
  const fetchUserData = useCallback(async (retryCount = 0) => {
    if (!backendAvailable) {
      const cachedUser = localStorage.getItem("user");
      const cachedToken = localStorage.getItem("token");
      
      if (cachedUser && cachedToken) {
        try {
          const user = JSON.parse(cachedUser);
          setUserData(user);
          setIsLoggedIn(true);
          setToken(cachedToken);
          return { success: true, user, cached: true };
        } catch (e) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      return { success: false, message: "Backend unavailable", cached: false };
    }

    const token = getToken();
    
    if (!token) {
      setUserData(null);
      setIsLoggedIn(false);
      return { success: false, message: "No token found" };
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      // ✅ FIXED: Using /api/auth/me endpoint
      const response = await axios.get(`/api/auth/me`, {
        timeout: 10000,
        headers: {
          "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
        }
      });
      
      if (response.data.success && response.data.user) {
        const user = response.data.user;
        
        const processedUser = {
          ...user,
          id: user.id || user._id,
          _id: user._id || user.id,
          isAccountVerified: user.isAccountVerified || false
        };
        
        setUserData(processedUser);
        setIsLoggedIn(true);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(processedUser));
        
        console.log("✅ User authenticated:", processedUser.name, 
          "- Verified:", processedUser.isAccountVerified ? '✅' : '❌');
        
        return { success: true, user: processedUser };
      }
    } catch (error) {
      console.warn("⚠️ Auth check failed:", error.response?.data?.message || error.message);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        setToken(null);
        localStorage.removeItem("user");
        setUserData(null);
        setIsLoggedIn(false);
      }
    }

    setUserData(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common['Authorization'];
    
    return { success: false, message: "Not authenticated" };
  }, [backendAvailable, getToken, setToken]);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");
      const loginStatus = urlParams.get("login");
      const source = urlParams.get("source");
      const token = urlParams.get("token");

      if (error) {
        const errorMessages = {
          oauth_failed: "Google login failed. Please try again.",
          no_code: "Authentication incomplete. Please try again.",
          user_cancelled: "Login cancelled.",
          invalid_state: "Security validation failed. Please try again.",
          token_expired: "Authentication session expired. Please try again.",
          auth_failed: "Authentication failed. Please try again."
        };

        toast.error(errorMessages[error] || "Authentication failed");
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (token) {
        setToken(token);
      }

      if (loginStatus === "success") {
        toast.success(
          source === "google"
            ? "Logged in successfully with Google!"
            : "Logged in successfully!"
        );
        
        await fetchUserData();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, [fetchUserData, setToken]);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      console.log("🚀 Initializing application...");
      console.log("📡 Backend URL:", backendUrl);

      const isBackendOk = await testBackendConnection();

      if (isBackendOk) {
        await initializeCsrfToken();
        await fetchUserData();
      } else {
        const cachedUser = localStorage.getItem("user");
        const cachedToken = localStorage.getItem("token");
        
        if (cachedUser && cachedToken) {
          try {
            const user = JSON.parse(cachedUser);
            setUserData(user);
            setIsLoggedIn(true);
            setToken(cachedToken);
            toast.info("📱 Running in offline mode with cached user data");
          } catch (e) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        }
      }

      setIsLoading(false);
      setAuthChecked(true);
      console.log("✅ App initialization complete", isBackendOk ? "(online)" : "(offline)");
    };

    initializeApp();
  }, [backendUrl, testBackendConnection, initializeCsrfToken, fetchUserData, setToken]);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (backendAvailable) {
        const token = getToken();
        await axios.post(`/api/auth/logout`, {}, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            "X-CSRF-Token": axios.defaults.headers.common["X-CSRF-Token"] || "",
          }
        });
      }
    } catch (error) {
      console.log("Logout error:", error.message);
    } finally {
      setUserData(null);
      setIsLoggedIn(false);
      setToken(null);
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
  }, [backendAvailable, getToken, setToken]);

  // Demo login
  const demoLogin = useCallback((userType = "customer") => {
    const demoUsers = {
      customer: {
        _id: "demo-customer-" + Date.now(),
        id: "demo-customer-" + Date.now(),
        name: "Demo Customer",
        email: "customer@example.com",
        role: "customer",
        isAccountVerified: true,
        avatar: null,
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      admin: {
        _id: "demo-admin-" + Date.now(),
        id: "demo-admin-" + Date.now(),
        name: "Demo Admin",
        email: "admin@example.com",
        role: "admin",
        isAccountVerified: true,
        avatar: null,
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      unverified: {
        _id: "demo-unverified-" + Date.now(),
        id: "demo-unverified-" + Date.now(),
        name: "Unverified User",
        email: "unverified@example.com",
        role: "customer",
        isAccountVerified: false,
        avatar: null,
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    };

    const user = demoUsers[userType] || demoUsers.customer;
    const demoToken = `demo-${userType}-${Date.now()}`;
    
    setUserData(user);
    setIsLoggedIn(true);
    setToken(demoToken);
    localStorage.setItem("user", JSON.stringify(user));
    
    toast.success(`🎭 Logged in as ${user.name} (Demo Mode)`);
    
    return { success: true, user };
  }, [setToken]);

  const value = useMemo(() => ({
    backendUrl,
    backendAvailable,
    csrfToken,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData: fetchUserData,
    logout,
    demoLogin,
    isLoading,
    authChecked,
    getToken,
    setToken,
    refreshCsrfToken: initializeCsrfToken,
    isAuthenticated: !!isLoggedIn && !!userData,
    isEmailVerified: userData?.isAccountVerified || false
  }), [
    backendUrl, backendAvailable, csrfToken, isLoggedIn, userData,
    isLoading, authChecked, fetchUserData, logout, demoLogin,
    getToken, setToken, initializeCsrfToken
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-ping opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 animate-spin-slow"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                K
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">KwetuShop</h2>
          <p className="text-gray-600 mb-6">Loading your experience...</p>
          
          {!backendAvailable && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full">
              <span className="text-lg">⚠️</span>
              <span className="text-sm font-medium">Server unreachable - using cached data</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};