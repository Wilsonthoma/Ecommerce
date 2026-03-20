// src/components/auth/AuthForm.jsx
import React from 'react';
import { assets } from '../../assets/assets';

const AuthForm = ({ 
  children, 
  onSubmit, 
  isLoading,
  buttonText,
  loadingText = "Processing..."
}) => {
  return (
    <form className="flex flex-col gap-2" onSubmit={onSubmit}>
      {children}
      
      <button
        type="submit"
        disabled={isLoading}
        className="relative w-full py-2 mt-2 overflow-hidden text-xs font-medium text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:shadow-lg hover:shadow-orange-600/20 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            <span>{loadingText}</span>
          </span>
        ) : (
          buttonText
        )}
      </button>
    </form>
  );
};

export default AuthForm;