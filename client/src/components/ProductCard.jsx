// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';

const ProductCard = ({ product, onAddToCart, showWishlist = true }) => {
  const formatKES = (price) => {
    if (!price && price !== 0) return "KSh 0";
    return `KSh ${Math.round(price).toLocaleString()}`;
  };

  const discountPercentage = product.discountPrice && product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <AiFillStar
          key={i}
          className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg group rounded-xl hover:shadow-xl">
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded top-3 left-3">
            {discountPercentage}% OFF
          </div>
        )}
        
        {/* Stock Status */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            product.stock > 10 ? 'bg-green-100 text-green-800' :
            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </span>
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-300 opacity-0 bg-black/40 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-3 transition-colors bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add to Cart"
          >
            <FiShoppingCart className="w-5 h-5 text-gray-700" />
          </button>
          <Link
            to={`/product/${product._id}`}
            className="p-3 transition-colors bg-white rounded-full hover:bg-gray-100"
            title="View Details"
          >
            <FiEye className="w-5 h-5 text-gray-700" />
          </Link>
          {showWishlist && (
            <button
              className="p-3 transition-colors bg-white rounded-full hover:bg-gray-100"
              title="Add to Wishlist"
            >
              <FiHeart className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="mb-2">
          <span className="px-2 py-1 text-xs font-medium text-blue-600 rounded bg-blue-50">
            {product.category || 'Uncategorized'}
          </span>
        </div>
        
        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="mb-2 font-semibold text-gray-900 transition-colors line-clamp-1 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {renderStars(product.rating || 4.5)}
          </div>
          <span className="text-sm text-gray-500">
            ({product.reviews || product.reviewCount || 0})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatKES(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatKES(product.price)}
                </span>
              )}
            </div>
            {product.discountPrice && (
              <p className="mt-1 text-xs text-green-600">
                Save {formatKES(product.price - product.discountPrice)}
              </p>
            )}
          </div>
          
          {/* Quick Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Quick Add to Cart"
          >
            <FiShoppingCart className="w-5 h-5" />
          </button>
        </div>
        
        {/* Additional Info */}
        {product.brand && (
          <p className="mt-3 text-xs text-gray-500">
            Brand: <span className="font-medium">{product.brand}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;