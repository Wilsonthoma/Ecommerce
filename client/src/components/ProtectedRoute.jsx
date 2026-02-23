// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AppContext);
  const location = useLocation();

  if (!isLoggedIn) {
    // Save the intended destination and redirect to login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;