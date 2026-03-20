// src/components/ui/Badge.jsx
import React from 'react';

const Badge = ({ type, children, className = '' }) => {
  const variants = {
    discount: 'badge-discount',
    featured: 'badge-primary',
    trending: 'badge-trending',
    flash: 'badge-flash',
    new: 'badge-new',
    inStock: 'bg-green-500/10 text-green-500 border border-green-500/30',
    lowStock: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
    outOfStock: 'bg-red-500/10 text-red-500 border border-red-500/30'
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${variants[type] || variants.featured} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;