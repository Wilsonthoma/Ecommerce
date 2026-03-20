// src/components/auth/SocialLoginButtons.jsx
import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const SocialLoginButtons = ({ 
  onGoogleClick, 
  loading = false,
  disabled = false
}) => {
  return (
    <>
      <button
        onClick={onGoogleClick}
        disabled={disabled || loading}
        className="flex items-center justify-center w-full gap-2 px-3 py-2 mb-3 text-xs font-medium text-white transition-all border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700 hover:border-yellow-500/50 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <FcGoogle className="w-4 h-4" />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 text-gray-400 bg-gray-900/95">or</span>
        </div>
      </div>
    </>
  );
};

export default SocialLoginButtons;