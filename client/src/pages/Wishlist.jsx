// src/pages/Wishlist.jsx - TRANSFORMED with oraimo black gradients and glowing effects
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiTrash2, 
  FiArrowLeft,
  FiChevronRight,
  FiEye,
  FiX,
  FiStar,
  FiPackage
} from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { BsArrowRight, BsLightningCharge } from 'react-icons/bs';
import { toast } from 'react-toastify';

// Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';

const Wishlist = () => {
  const navigate = useNavigate();
  const { 
    wishlistItems, 
    wishlistCount, 
    loading, 
    removeFromWishlist, 
    clearWishlist 
  } = useWishlist();
  const { addToCart } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Format KES currency
  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  // Get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return FALLBACK_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    return `${API_URL}/uploads/products/${imagePath}`;
  };

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<AiFillStar key={i} className="w-3 h-3 text-yellow-400" />);
      } else {
        stars.push(<AiFillStar key={i} className="w-3 h-3 text-gray-600" />);
      }
    }
    return stars;
  };

  // Handle add to cart
  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const success = await addToCart(product, 1);
    if (success) {
      // Optional: Remove from wishlist after adding to cart
      // removeFromWishlist(product._id || product.id);
    }
  };

  // Handle remove from wishlist
  const handleRemove = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(productId);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item._id || item.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle select item
  const handleSelectItem = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedItems.includes(productId)) {
      setSelectedItems(prev => prev.filter(id => id !== productId));
      setSelectAll(false);
    } else {
      setSelectedItems(prev => [...prev, productId]);
    }
  };

  // Handle bulk remove
  const handleBulkRemove = () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }

    if (window.confirm(`Remove ${selectedItems.length} item(s) from wishlist?`)) {
      selectedItems.forEach(id => removeFromWishlist(id));
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  // Handle add all to cart
  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) return;

    let successCount = 0;
    for (const product of wishlistItems) {
      const success = await addToCart(product, 1);
      if (success) successCount++;
    }

    toast.success(`Added ${successCount} of ${wishlistItems.length} items to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="container px-4 py-8 mx-auto">
          <div className="animate-pulse">
            <div className="w-48 h-8 mb-8 bg-gray-700 rounded glow-text"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                  <div className="w-full h-48 mb-4 bg-gray-700 rounded"></div>
                  <div className="w-3/4 h-4 mb-2 bg-gray-700 rounded"></div>
                  <div className="w-1/2 h-4 mb-4 bg-gray-700 rounded"></div>
                  <div className="w-1/3 h-6 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        <div className="container px-4 py-12 mx-auto">
          <div className="max-w-md mx-auto text-center">
            <div className="relative inline-block mb-6">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-red-600 to-pink-600">
                <FiHeart className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-full opacity-50 blur-xl"></div>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-white glow-text">Your Wishlist is Empty</h1>
            <p className="mb-8 text-gray-400">
              Save items you love to your wishlist and they'll appear here
            </p>
            <Link
              to="/shop"
              className="group relative inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-all rounded-full overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center gap-2">
                <FiShoppingCart className="w-5 h-5" />
                Start Shopping
                <BsArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="container px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/" className="text-gray-400 hover:text-white hover:glow-text transition-colors">Home</Link>
          <FiChevronRight className="w-4 h-4 text-gray-600" />
          <Link to="/shop" className="text-gray-400 hover:text-white hover:glow-text transition-colors">Shop</Link>
          <FiChevronRight className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-white glow-text">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl glow-text">My Wishlist</h1>
            <p className="text-gray-400">{wishlistCount} items saved</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {wishlistItems.length > 0 && (
              <>
                <button
                  onClick={handleAddAllToCart}
                  className="group relative px-4 py-2 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative flex items-center gap-2">
                    <FiShoppingCart className="w-4 h-4" />
                    Add All to Cart
                  </span>
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="group relative px-4 py-2 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative flex items-center gap-2">
                    <FiTrash2 className="w-4 h-4" />
                    Remove Selected ({selectedItems.length})
                  </span>
                </button>
                <button
                  onClick={clearWishlist}
                  className="px-4 py-2 text-sm font-medium text-gray-400 transition-colors border rounded-full border-gray-700 hover:text-white hover:border-gray-600"
                >
                  <FiX className="inline w-4 h-4 mr-1" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Select All */}
        {wishlistItems.length > 0 && (
          <div className="flex items-center gap-2 p-4 mb-4 border rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-0"
            />
            <label className="text-sm font-medium text-white">Select All</label>
          </div>
        )}

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((product) => {
            const productId = product._id || product.id;
            const productImage = product.images?.[0]?.url || product.image || FALLBACK_IMAGE;
            const discountedPrice = product.discountedPrice || product.price;
            const originalPrice = product.price;
            const hasDiscount = discountedPrice < originalPrice;
            const discountPercentage = hasDiscount 
              ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) 
              : 0;

            return (
              <div
                key={productId}
                className="group relative overflow-hidden transition-all duration-300 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:-translate-y-1"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                
                <div className="relative">
                  {/* Select Checkbox */}
                  <div className="absolute z-10 top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(productId)}
                      onChange={(e) => handleSelectItem(productId, e)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemove(productId, e)}
                    className="absolute z-10 p-2 transition-all rounded-full shadow-lg top-2 right-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] group/btn"
                    title="Remove from wishlist"
                  >
                    <FiTrash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                  </button>

                  {/* Image */}
                  <Link to={`/product/${productId}`} className="block">
                    <div className="relative overflow-hidden bg-gray-800 aspect-square">
                      <img
                        src={getFullImageUrl(productImage)}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => e.target.src = FALLBACK_IMAGE}
                      />
                      
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <span className="absolute px-2 py-1 text-xs font-bold text-white rounded-full left-2 top-2 bg-gradient-to-r from-red-600 to-orange-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                          {discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="mb-1 text-sm font-medium text-white transition-colors line-clamp-2 group-hover:text-red-500">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {renderStars(product.rating || 0)}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.reviewsCount || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-white">
                          {formatKES(discountedPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatKES(originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/product/${productId}`);
                          }}
                          className="flex-1 py-2 text-sm font-medium text-gray-400 transition-all border rounded-full border-gray-700 hover:text-white hover:border-gray-600"
                        >
                          <FiEye className="inline w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="group/btn relative flex-1 py-2 text-sm font-medium text-white transition-all rounded-full overflow-hidden"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
                          <span className="relative flex items-center justify-center">
                            <FiShoppingCart className="w-4 h-4 mr-1" />
                            Add
                          </span>
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Shop */}
        <div className="mt-8 text-center">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
            <BsArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 20px currentColor;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;