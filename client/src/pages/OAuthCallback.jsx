// src/pages/OAuthCallback.jsx - FIXED single toast
import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserData } = useContext(AppContext);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const loginStatus = params.get('login');
      const source = params.get('source');
      const error = params.get('error');

      console.log('📍 OAuth Callback Page:', { token: !!token, loginStatus, source, error });

      if (error) {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (token && loginStatus === 'success') {
        try {
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // ✅ SINGLE TOAST
          toast.success(
            source === 'google' 
              ? 'Logged in successfully with Google! 🎉' 
              : 'Logged in successfully! 🎉'
          );

          await getUserData();
          
          const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
          sessionStorage.removeItem('redirectAfterLogin');
          
          console.log('📍 Redirecting to:', redirectTo);
          navigate(redirectTo, { replace: true });
        } catch (err) {
          console.error('Failed to get user data:', err);
          toast.error('Login successful but failed to load user data');
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [location, navigate, getUserData]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-700 rounded-full border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 blur-xl opacity-20 animate-pulse"></div>
        </div>
        <p className="mt-4 text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;