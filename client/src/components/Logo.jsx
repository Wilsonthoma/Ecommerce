// src/components/Logo.jsx - IMPROVED with assets
import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Logo = ({ 
  size = "md", 
  showText = true, 
  clickable = true,
  withGlow = true,
  className = ""
}) => {
  const navigate = useNavigate();

  // Size configurations
  const sizes = {
    sm: {
      container: "w-8 h-8",
      logo: "w-5 h-5",
      text: "text-lg",
      glow: "w-8 h-8"
    },
    md: {
      container: "w-12 h-12",
      logo: "w-8 h-8",
      text: "text-2xl",
      glow: "w-12 h-12"
    },
    lg: {
      container: "w-16 h-16",
      logo: "w-10 h-10",
      text: "text-3xl",
      glow: "w-16 h-16"
    },
    xl: {
      container: "w-24 h-24",
      logo: "w-16 h-16",
      text: "text-4xl",
      glow: "w-24 h-24"
    }
  };

  const selectedSize = sizes[size] || sizes.md;

  const handleClick = () => {
    if (clickable) {
      navigate('/');
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
      role={clickable ? 'button' : 'presentation'}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && navigate('/') : undefined}
    >
      <div className="relative">
        {/* Logo container with gradient background */}
        <div className={`${selectedSize.container} rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center`}>
          <img 
            src={assets.logo} 
            alt="KwetuShop" 
            className={`${selectedSize.logo} object-contain`}
          />
        </div>
        
        {/* Glow effect */}
        {withGlow && (
          <div className={`absolute -inset-0.5 ${selectedSize.glow} rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 opacity-30 blur transition-opacity group-hover:opacity-50`}></div>
        )}
      </div>
      
      {showText && (
        <span className={`font-bold ${selectedSize.text} bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent`}>
          KwetuShop
        </span>
      )}
    </div>
  );
};

// Compact logo for navbar
export const NavbarLogo = () => {
  return <Logo size="sm" showText={false} withGlow={false} />;
};

// Full logo for footer
export const FooterLogo = () => {
  return <Logo size="lg" showText={true} withGlow={true} clickable={false} />;
};

export default Logo;