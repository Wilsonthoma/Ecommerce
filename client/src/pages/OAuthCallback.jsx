// src/pages/OAuthCallback.jsx - COMPLETE FIXED VERSION
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import clientApi from '../services/client/api';

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
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-transparent text-white bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text">
              K
            </span>
          </div>
          <div className="w-20 h-20 border-4 border-t-4 border-gray-700 rounded-full border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;