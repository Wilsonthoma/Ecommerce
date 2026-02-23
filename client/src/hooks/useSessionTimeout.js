// src/hooks/useSessionTimeout.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const useSessionTimeout = (checkInterval = 60000) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiry = () => {
      // Check both localStorage and sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        try {
          // Decode JWT token
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          // Check if token is expired
          if (payload.exp * 1000 < Date.now()) {
            // Clear all storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('wishlist');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('redirectAfterLogin');
            
            toast.error('Session expired. Please login again.', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
            
            navigate('/login');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          // If token is malformed, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }
    };

    // Check immediately
    checkTokenExpiry();
    
    // Check at regular intervals
    const interval = setInterval(checkTokenExpiry, checkInterval);

    return () => clearInterval(interval);
  }, [navigate, checkInterval]);
};

export default useSessionTimeout;