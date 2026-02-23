// src/context/AppContext.jsx - Use clientApi instead of default axios
import { createContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import clientApi, { setAuthToken, clearAuthData } from "../services/client/api"; // ✅ Use clientApi
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Global states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);

  // Refs to prevent duplicate actions
  const logoutInProgress = useRef(false);

  // Token management - now uses clientApi
  const getToken = useCallback(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }, []);

  // Test backend connection using clientApi
  const testBackendConnection = useCallback(async () => {
    try {
      const response = await clientApi.get(`/health`, { 
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

  // Initialize CSRF token using clientApi
  const initializeCsrfToken = useCallback(async () => {
    if (!backendAvailable) return null;

    try {
      const response = await clientApi.get(`/auth/csrf-token`, { 
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.data?.csrfToken) {
        // Set in clientApi headers
        clientApi.defaults.headers.common["X-CSRF-Token"] = response.data.csrfToken;
        setCsrfToken(response.data.csrfToken);
        console.log("✅ CSRF token initialized");
        return response.data.csrfToken;
      }
    } catch (error) {
      console.warn("⚠️ CSRF token not available, continuing without CSRF");
    }
    return null;
  }, [backendAvailable]);

  // ✅ Fetch user data using clientApi
  const fetchUserData = useCallback(async () => {
    if (!backendAvailable) {
      const cachedUser = localStorage.getItem("user");
      const cachedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (cachedUser && cachedToken) {
        try {
          const user = JSON.parse(cachedUser);
          setUserData(user);
          setIsLoggedIn(true);
          return { success: true, user, cached: true };
        } catch (e) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
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

    try {
      // ✅ Using clientApi
      const response = await clientApi.get(`/auth/me`);
      
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
        localStorage.setItem("user", JSON.stringify(processedUser));
        
        console.log("✅ User authenticated:", processedUser.name);
        return { success: true, user: processedUser };
      }
    } catch (error) {
      console.warn("⚠️ Auth check failed:", error.response?.data?.message || error.message);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearAuthData();
        setUserData(null);
        setIsLoggedIn(false);
      }
    }

    setUserData(null);
    setIsLoggedIn(false);
    clearAuthData();
    return { success: false, message: "Not authenticated" };
  }, [backendAvailable, getToken]);

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
        const cachedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (cachedUser && cachedToken) {
          try {
            const user = JSON.parse(cachedUser);
            setUserData(user);
            setIsLoggedIn(true);
            toast.info("📱 Running in offline mode with cached user data");
          } catch (e) {
            clearAuthData();
          }
        }
      }

      setIsLoading(false);
      setAuthChecked(true);
      console.log("✅ App initialization complete", isBackendOk ? "(online)" : "(offline)");
    };

    initializeApp();
  }, [backendUrl, testBackendConnection, initializeCsrfToken, fetchUserData]);

  // ✅ Logout using clientApi
  const logout = useCallback(async () => {
    if (logoutInProgress.current) {
      console.log("Logout already in progress, skipping...");
      return;
    }

    logoutInProgress.current = true;

    try {
      if (backendAvailable) {
        await clientApi.post(`/auth/logout`, {});
      }
    } catch (error) {
      console.log("Logout error:", error.message);
    } finally {
      clearAuthData();
      setUserData(null);
      setIsLoggedIn(false);
      
      toast.success("Logged out successfully!");

      logoutInProgress.current = false;

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
  }, [backendAvailable]);

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
    isLoading,
    authChecked,
    getToken,
    isAuthenticated: !!isLoggedIn && !!userData,
    isEmailVerified: userData?.isAccountVerified || false
  }), [
    backendUrl, backendAvailable, csrfToken, isLoggedIn, userData,
    isLoading, authChecked, fetchUserData, logout, getToken
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-700 rounded-full border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading your experience...</p>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};