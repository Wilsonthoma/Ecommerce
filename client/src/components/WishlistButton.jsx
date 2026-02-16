// src/components/WishlistButton.jsx - TRANSFORMED with oraimo black gradients and glowing effects
import React from 'react';
import { FiHeart } from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const WishlistButton = ({ product, variant = 'icon', className = '' }) => {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to use wishlist');
      navigate('/login');
      return;
    }

    await toggleWishlist(product);
  };

  // Icon only variant (for cards) - ORAIMO Style
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`group relative p-2.5 transition-all rounded-full shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] ${className}`}
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
        <FiHeart
          className={`relative w-5 h-5 transition-all group-hover:scale-110 ${
            inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-white'
          }`}
        />
      </button>
    );
  }

  // Full button variant (for product page) - ORAIMO Style
  return (
    <button
      onClick={handleClick}
      className={`group relative flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all rounded-full overflow-hidden ${
        inWishlist
          ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]'
          : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
      } ${className}`}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity`}></div>
      
      {/* Content */}
      <span className="relative flex items-center gap-2">
        <FiHeart
          className={`w-5 h-5 transition-all ${
            inWishlist ? 'fill-white text-white' : 'text-gray-400 group-hover:text-red-500'
          }`}
        />
        <span>{inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
        <BsArrowRight className={`w-4 h-4 transition-all ${
          inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
        }`} />
      </span>
    </button>
  );
};

export default WishlistButton;