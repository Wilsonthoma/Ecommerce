// src/components/Logo.jsx - IMPROVED with yellow-orange theme and better accessibility
import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Logo = ({ 
  size = "md", 
  showText = true, 
  clickable = true,
  showGradient = false,  // NEW: Optional gradient effect
  className = ""
}) => {
  const navigate = useNavigate();

  // Size configurations
  const sizes = {
    sm: {
      container: "w-12 h-12",
      logo: "w-8 h-8",
      text: "text-xl",
      gap: "gap-2",
    },
    md: {
      container: "w-16 h-16",
      logo: "w-12 h-12",
      text: "text-2xl",
      gap: "gap-3",
    },
    lg: {
      container: "w-24 h-24",
      logo: "w-20 h-20",
      text: "text-3xl",
      gap: "gap-4",
    },
    xl: {
      container: "w-32 h-32",
      logo: "w-28 h-28",
      text: "text-5xl",
      gap: "gap-5",
    },
    xxl: {
      container: "w-40 h-40",
      logo: "w-36 h-36",
      text: "text-6xl",
      gap: "gap-6",
    },
    hero: {
      container: "w-48 h-48",
      logo: "w-44 h-44",
      text: "text-7xl",
      gap: "gap-8",
    }
  };

  const selectedSize = sizes[size] || sizes.md;

  const handleClick = () => {
    if (clickable) {
      navigate('/');
    }
  };

  const handleKeyDown = (e) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      navigate('/');
    }
  };

  return (
    <div 
      className={`
        flex items-center 
        ${selectedSize.gap} 
        ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity group' : ''} 
        ${className}
      `}
      onClick={handleClick}
      role={clickable ? 'button' : 'presentation'}
      tabIndex={clickable ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      {/* Logo container with optional gradient background */}
      <div className={`
        ${selectedSize.container} 
        flex items-center justify-center
        ${showGradient ? 'rounded-full bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-1' : ''}
      `}>
        {showGradient && (
          <div className="absolute inset-0 transition-opacity rounded-full opacity-0 bg-gradient-to-r from-yellow-600 to-orange-600 group-hover:opacity-30 blur-xl"></div>
        )}
        <img 
          src={assets.logo} 
          alt="KwetuShop" 
          className={`${selectedSize.logo} object-contain`}
        />
      </div>
      
      {showText && (
        <span className={`
          font-bold ${selectedSize.text} 
          ${showGradient ? 'text-gradient-yellow-orange' : 'text-white'}
          group-hover:glow-text transition-all
        `}>
          KwetuShop
        </span>
      )}
    </div>
  );
};

// ==================== PRESET LOGO VARIANTS ====================

// Compact logo for navbar (no text)
export const NavbarLogo = () => {
  return <Logo size="md" showText={false} clickable={true} />;
};

// Navbar logo with text
export const NavbarLogoWithText = () => {
  return <Logo size="md" showText={true} clickable={true} />;
};

// Footer logo
export const FooterLogo = () => {
  return <Logo size="lg" showText={true} clickable={false} />;
};

// Mobile menu logo
export const MobileLogo = () => {
  return <Logo size="sm" showText={true} clickable={true} />;
};

// Hero section logo
export const HeroLogo = () => {
  return <Logo size="hero" showText={true} clickable={false} showGradient={true} />;
};

// Dashboard logo
export const DashboardLogo = () => {
  return <Logo size="lg" showText={true} clickable={true} />;
};

// Login page logo (centered, no click)
export const LoginLogo = () => {
  return <Logo size="md" showText={true} clickable={false} className="justify-center" />;
};

// Checkout logo (compact with gradient)
export const CheckoutLogo = () => {
  return <Logo size="sm" showText={true} clickable={true} showGradient={true} />;
};

// Auth pages logo (no text, centered)
export const AuthLogo = () => {
  return <Logo size="lg" showText={false} clickable={true} showGradient={true} />;
};

export default Logo;