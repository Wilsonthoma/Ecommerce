// src/components/layout/RelatedProducts.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import Price from '../ui/Price';

const RelatedProducts = ({ products = [], onProductClick, headerImage }) => {
  const navigate = useNavigate();

  const handleClick = (productId) => {
    if (onProductClick) {
      onProductClick(productId);
    } else {
      navigate(`/product/${productId}`);
    }
    window.scrollTo(0, 0);
  };

  if (!products.length) return null;

  return (
    <div className="mt-8">
      <SectionHeader 
        title="YOU MAY ALSO LIKE"
        image={headerImage}
        showImage={false}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.slice(0, 4).map((product) => {
          const productImage = product.primaryImage || 
            product.images?.[0]?.url || 
            product.image || 
            '/fallback-image.jpg';
          
          return (
            <div
              key={product._id || product.id}
              onClick={() => handleClick(product._id || product.id)}
              className="cursor-pointer group"
            >
              <div className="relative mb-1 overflow-hidden border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 aspect-square">
                <img 
                  src={productImage} 
                  alt={product.name} 
                  className="object-cover w-full h-full transition-transform group-hover:scale-110" 
                />
              </div>
              <h3 className="text-xs font-medium text-white truncate group-hover:text-yellow-500">
                {product.name}
              </h3>
              <Price price={product.price} comparePrice={product.comparePrice} size="small" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;