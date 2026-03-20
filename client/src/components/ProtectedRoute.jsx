// src/components/ProtectedRoute.jsx - Enhanced with loading state and better redirect handling
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isLoggedIn, loading } = useContext(AppContext);
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner message="Verifying authentication..." size="lg" />
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!isLoggedIn) {
    // Save the intended destination for after login
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Logged in - render children
  return children;
};

export default ProtectedRoute;