import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000/api/admin/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('admin_token');
      const storedUser = localStorage.getItem('admin_user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await axios.get(`${API_BASE_URL}/check`, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });
          
          if (response.data.success) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            
            // Set default axios header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } else {
            // Token is invalid, clear storage
            clearAuth();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          clearAuth();
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, admin } = response.data;
        
        // Store in localStorage
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(admin));
        
        // Update state
        setToken(token);
        setUser(admin);
        setIsAuthenticated(true);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('Login successful!');
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          errorMessage = data.error || 'Invalid email or password';
        } else if (status === 403) {
          errorMessage = data.error || 'Account is deactivated';
        } else if (status === 400) {
          errorMessage = data.error || 'Invalid input';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${API_BASE_URL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
    }
  };

  const setupSystem = async (adminData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/setup`, adminData);

      if (response.data.success) {
        const { token, admin } = response.data;
        
        // Store in localStorage
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(admin));
        
        // Update state
        setToken(token);
        setUser(admin);
        setIsAuthenticated(true);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        toast.success('System setup completed successfully!');
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Setup error:', error);
      
      let errorMessage = 'Setup failed. Please try again.';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          errorMessage = data.error || 'Invalid input or system already configured';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const checkSystemSetup = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/check-setup`);
      return response.data;
    } catch (error) {
      console.error('Check setup error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        setupSystem,
        checkSystemSetup,
        clearAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};