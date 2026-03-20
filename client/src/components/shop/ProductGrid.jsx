// src/components/shop/ProductGrid.jsx
import React from 'react';
import ProductCard from '../ui/ProductCard';

const ProductGrid = ({ products, columns = 3 }) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
  };

  return (
    <div className={`grid gap-2 sm:gap-3 ${gridCols[columns] || gridCols[3]}`}>
      {products.map((product, index) => (
        <div 
          key={product._id || product.id} 
          className="relative group"
          data-aos="fade-up"
          data-aos-duration="600"
          data-aos-delay={index * 30}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
          <div className="relative">
            <ProductCard product={product} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;