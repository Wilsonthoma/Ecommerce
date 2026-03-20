// src/components/auth/AuthLayout.jsx - No extra header
import React from 'react';

const AuthLayout = ({ children, backgroundImage, gradient }) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Full-page Background Image */}
      <div className="absolute inset-0">
        <img 
          src={backgroundImage}
          alt="Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} mix-blend-overlay`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Animated Glow Orbs */}
      <div className="absolute rounded-full w-96 h-96 bg-yellow-600/30 blur-3xl -top-48 -left-48 animate-pulse"></div>
      <div className="absolute delay-1000 rounded-full w-96 h-96 bg-orange-600/30 blur-3xl -bottom-48 -right-48 animate-pulse"></div>

      {children}
    </div>
  );
};

export default AuthLayout;