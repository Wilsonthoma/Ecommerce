// src/components/Logo.jsx - IMPROVED with larger sizes
import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Logo = ({ 
  size = "md", 
  showText = true, 
  clickable = true,
  className = ""
}) => {
  const navigate = useNavigate();

  // Size configurations - INCREASED ALL SIZES
  const sizes = {
    sm: {
      container: "w-12 h-12",      // Increased from w-8 h-8
      logo: "w-8 h-8",             // Increased from w-5 h-5
      text: "text-xl",              // Increased from text-lg
    },
    md: {
      container: "w-16 h-16",       // Increased from w-12 h-12
      logo: "w-12 h-12",            // Increased from w-8 h-8
      text: "text-2xl",             // Increased from text-2xl (same)
    },
    lg: {
      container: "w-24 h-24",       // Increased from w-16 h-16
      logo: "w-20 h-20",            // Increased from w-10 h-10
      text: "text-3xl",             // Increased from text-3xl (same)
    },
    xl: {
      container: "w-32 h-32",       // Increased from w-24 h-24
      logo: "w-28 h-28",            // Increased from w-16 h-16
      text: "text-5xl",             // Increased from text-4xl
    },
    xxl: {                          // NEW: Extra large size
      container: "w-40 h-40",
      logo: "w-36 h-36",
      text: "text-6xl",
    },
    hero: {                          // NEW: Hero section size
      container: "w-48 h-48",
      logo: "w-44 h-44",
      text: "text-7xl",
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
      className={`flex items-center gap-4 ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={handleClick}
      role={clickable ? 'button' : 'presentation'}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && navigate('/') : undefined}
    >
      {/* Logo container */}
      <div className={`${selectedSize.container} flex items-center justify-center`}>
        <img 
          src={assets.logo} 
          alt="KwetuShop" 
          className={`${selectedSize.logo} object-contain`}
        />
      </div>
      
      {showText && (
        <span className={`font-bold ${selectedSize.text} text-white`}>
          KwetuShop
        </span>
      )}
    </div>
  );
};

// Compact logo for navbar (medium size with no text)
export const NavbarLogo = () => {
  return <Logo size="md" showText={false} clickable={true} />;
};

// Logo with text for navbar (medium size)
export const NavbarLogoWithText = () => {
  return <Logo size="md" showText={true} clickable={true} />;
};

// Full logo for footer (large size)
export const FooterLogo = () => {
  return <Logo size="lg" showText={true} clickable={false} />;
};

// Mobile logo (smaller with text)
export const MobileLogo = () => {
  return <Logo size="sm" showText={true} clickable={true} />;
};

// Hero section logo (extra large)
export const HeroLogo = () => {
  return <Logo size="hero" showText={true} clickable={false} />;
};

// Dashboard logo (large with text)
export const DashboardLogo = () => {
  return <Logo size="lg" showText={true} clickable={true} />;
};

export default Logo;