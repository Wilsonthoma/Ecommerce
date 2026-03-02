// src/pages/OAuthCallback.jsx - COMPLETE FIXED VERSION with LoadingSpinner
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import clientApi from '../services/client/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const loginStatus = params.get('login');
      const source = params.get('source');
      const error = params.get('error');

      console.log('📍 OAuth Callback:', { token: !!token, loginStatus, source, error });

      if (error) {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (token && loginStatus === 'success' && !toastShown.current) {
        toastShown.current = true;
        
        try {
          localStorage.setItem('token', token);
          clientApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          toast.success(
            source === 'google' 
              ? 'Logged in successfully with Google! 🎉' 
              : 'Logged in successfully! 🎉'
          );

          const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.removeItem('redirectAfterLogin');
          
          console.log('📍 Redirecting to:', redirectTo);
          
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 100);
        } catch (err) {
          console.error('Failed to process login:', err);
          toast.error('Login successful but failed to redirect');
          window.location.href = '/dashboard';
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <LoadingSpinner message="Completing authentication..." size="lg" />
    </div>
  );
};

export default OAuthCallback;