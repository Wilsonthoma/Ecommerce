// client/src/components/WishlistButton.jsx
import React from 'react';
import { FiHeart } from 'react-icons/fi';
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

  // Icon only variant (for cards)
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform ${className}`}
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <FiHeart
          className={`w-5 h-5 ${
            inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
          }`}
        />
      </button>
    );
  }

  // Full button variant (for product page)
  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
        inWishlist
          ? 'border-red-300 text-red-600 hover:bg-red-50'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      } ${className}`}
    >
      <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
      <span>{inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
    </button>
  );
};

export default WishlistButton;