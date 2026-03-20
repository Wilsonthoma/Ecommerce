// src/components/ui/LoadingFallback.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingFallback = ({ message = "Loading...", fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner message={message} size="lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner message={message} size="md" />
    </div>
  );
};

export default LoadingFallback;