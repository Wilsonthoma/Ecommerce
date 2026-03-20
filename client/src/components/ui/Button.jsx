// src/components/ui/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  icon: Icon,
  iconPosition = 'left'
}) => {
  const baseStyles = 'font-medium transition-all rounded-full inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/25',
    secondary: 'border border-white/20 text-white hover:bg-white/10 hover:border-yellow-500/50',
    outline: 'border border-gray-700 text-gray-300 hover:bg-white/10 hover:border-yellow-500/50',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-4 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {Icon && iconPosition === 'left' && <Icon className="mr-2" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="ml-2" />}
    </button>
  );
};

export default Button;