// client/src/pages/Wishlist.jsx
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
        stars.push(<AiFillStar key={i} className="w-3 h-3 text-gray-300" />);
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
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="animate-pulse">
            <div className="w-48 h-8 mb-8 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 bg-white rounded-lg">
                  <div className="w-full h-48 mb-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-4 mb-4 bg-gray-200 rounded"></div>
                  <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
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
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
              <FiHeart className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-gray-900">Your Wishlist is Empty</h1>
            <p className="mb-8 text-gray-600">
              Save items you love to your wishlist and they'll appear here
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FiShoppingCart className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container px-4 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <FiChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-blue-600">Shop</Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">My Wishlist</h1>
            <p className="text-gray-600">{wishlistCount} items saved</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {wishlistItems.length > 0 && (
              <>
                <button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Add All to Cart
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Remove Selected ({selectedItems.length})
                </button>
                <button
                  onClick={clearWishlist}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FiX className="w-4 h-4" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Select All */}
        {wishlistItems.length > 0 && (
          <div className="flex items-center gap-2 p-4 mb-4 bg-white border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label className="text-sm font-medium">Select All</label>
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
                className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg group hover:shadow-lg"
              >
                {/* Select Checkbox */}
                <div className="absolute z-10 top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(productId)}
                    onChange={(e) => handleSelectItem(productId, e)}
                    className="w-4 h-4 text-blue-600 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemove(productId, e)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove from wishlist"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>

                {/* Image */}
                <Link to={`/product/${productId}`} className="block">
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    <img
                      src={getFullImageUrl(productImage)}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => e.target.src = FALLBACK_IMAGE}
                    />
                    
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <span className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded top-2 left-10">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2">
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
                      <span className="text-lg font-bold text-gray-900">
                        {formatKES(discountedPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
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
                        className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <FiEye className="inline w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <FiShoppingCart className="inline w-4 h-4 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Back to Shop */}
        <div className="mt-8 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;