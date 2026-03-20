// src/pages/OAuthCallback.jsx - Fixed with proper navigation
import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import clientApi from '../services/client/api';
import { AppContext } from '../context/AppContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserData, getUserData } = useContext(AppContext);
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
        navigate('/login', { replace: true });
        return;
      }

      if (token && loginStatus === 'success' && !toastShown.current) {
        toastShown.current = true;
        
        try {
          // Save token to both storage locations
          localStorage.setItem('token', token);
          sessionStorage.setItem('token', token);
          clientApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data immediately
          const user = await getUserData();
          
          if (user?.success || user?.user) {
            const userData = user.user || user;
            
            // Save user data
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('user', JSON.stringify(userData));
            
            // Single toast message
            toast.success(source === 'google' ? 'Welcome! Logged in with Google 🎉' : 'Welcome back! 🎉');
            
            // Get the redirect URL
            const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
            sessionStorage.removeItem('redirectAfterLogin');
            
            console.log('📍 Navigating to:', redirectTo);
            
            // Use React Router navigation - this will update the URL properly
            navigate(redirectTo, { replace: true });
            
          } else {
            throw new Error('Failed to fetch user data');
          }
          
        } catch (err) {
          console.error('Failed to process login:', err);
          toast.error('Login successful but failed to redirect');
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [location, navigate, getUserData]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <LoadingSpinner message="Completing authentication..." size="lg" />
    </div>
  );
};

export default OAuthCallback;