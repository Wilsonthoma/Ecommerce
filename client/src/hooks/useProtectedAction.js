// src/hooks/useProtectedAction.js
import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const useProtectedAction = () => {
  const { isLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const executeProtectedAction = (action, message = 'Please login to continue') => {
    if (!isLoggedIn) {
      toast.error(message);
      // Save the current page and redirect to login
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }
    
    return action();
  };

  return executeProtectedAction;
};

export default useProtectedAction;