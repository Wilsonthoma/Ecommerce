// src/components/shop/ProductListView.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import Price, { formatKES } from '../ui/Price';

const ProductListView = ({ products, onAddToCart }) => {
  return (
    <div className="space-y-2">
      {products.map((product, index) => (
        <div 
          key={product._id || product.id} 
          className="relative group"
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay={index * 30}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
          <div className="relative overflow-hidden bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="flex-shrink-0 overflow-hidden bg-gray-800 h-28 md:w-28 md:h-auto">
                <img
                  src={product.primaryImage || (product.images && product.images[0]?.url) || product.image || 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Product Details */}
              <div className="flex-1 min-w-0 p-3">
                <div className="flex flex-col items-start justify-between gap-2 md:flex-row">
                  <div className="flex-1 w-full md:w-auto">
                    <h3 className="mb-1 text-sm font-semibold text-white truncate">
                      <Link to={`/product/${product._id || product.id}`} className="transition-colors hover:text-yellow-500">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mb-2 text-xs text-gray-400 line-clamp-2">
                      {product.description || product.shortDescription || 'No description available'}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-white">{product.rating || 0}</span>
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500 truncate">
                        {product.category || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <Price price={product.discountedPrice || product.price} size="lg" />
                    {product.discountPercentage > 0 && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatKES(product.price)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onAddToCart(product)}
                    className="flex items-center gap-1 btn-primary text-xs px-3 py-1.5"
                  >
                    <FiShoppingCart className="w-3 h-3" />
                    <span>Add to Cart</span>
                  </button>
                  <Link
                    to={`/product/${product._id || product.id}`}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductListView;