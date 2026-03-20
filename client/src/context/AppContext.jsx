// src/context/AppContext.jsx - COMPLETE FIXED VERSION
import { createContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import clientApi, { setAuthToken, clearAuthData } from "../services/client/api";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);

  const logoutInProgress = useRef(false);

  const getToken = useCallback(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }, []);

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

  const initializeCsrfToken = useCallback(async () => {
    if (!backendAvailable) return null;

    try {
      const response = await clientApi.get(`/auth/csrf-token`, { 
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.data?.csrfToken) {
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

  // ✅ NEW: Refresh user data function
  const refreshUserData = useCallback(async () => {
    const token = getToken();
    if (!token) return null;
    
    try {
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
        sessionStorage.setItem("user", JSON.stringify(processedUser));
        console.log("✅ User data refreshed:", processedUser.name);
        return processedUser;
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearAuthData();
        setUserData(null);
        setIsLoggedIn(false);
      }
    }
    return null;
  }, [getToken]);

  // ✅ NEW: Set auth token function
  const setAuthToken = useCallback((token, remember = false) => {
    if (token) {
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      clientApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // ✅ NEW: Clear auth data function
  const clearAuth = useCallback(() => {
    clearAuthData();
    setUserData(null);
    setIsLoggedIn(false);
  }, []);

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
    refreshUserData,      // ✅ Added
    setAuthToken,          // ✅ Added
    clearAuth,             // ✅ Added
    logout,
    isLoading,
    authChecked,
    getToken,
    isAuthenticated: !!isLoggedIn && !!userData,
    isEmailVerified: userData?.isAccountVerified || false
  }), [
    backendUrl, 
    backendAvailable, 
    csrfToken, 
    isLoggedIn, 
    userData,
    isLoading, 
    authChecked, 
    fetchUserData, 
    refreshUserData,       // ✅ Added to dependencies
    setAuthToken,          // ✅ Added to dependencies
    clearAuth,             // ✅ Added to dependencies
    logout, 
    getToken
  ]);

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};