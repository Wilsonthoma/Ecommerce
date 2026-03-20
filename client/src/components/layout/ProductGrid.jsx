// src/components/layout/ProductGrid.jsx
import React from 'react';
import ProductCard from "../ui/ProductCard";  // This will now work with your default export
import { CardSkeleton } from "../ui/LoadingSpinner";

const ProductGrid = ({ 
  products, 
  loading, 
  onProductClick, 
  columns = 4,
  skeletonCount = 4,
  gap = "md:gap-6",
  className = ""
}) => {
  if (loading) {
    return <CardSkeleton count={skeletonCount} />;
  }

  if (!products || products.length === 0) {
    return <div className="py-12 text-center text-gray-400">No products available</div>;
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  return (
    <div className={`grid gap-3 sm:gap-4 ${gap} ${gridCols[columns] || gridCols[4]} ${className}`}>
      {products.slice(0, columns).map((product, index) => (
        <div 
          key={product._id || product.id || index} 
          className="cursor-pointer group"
          onClick={() => onProductClick(product._id || product.id)}
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay={200 + (index * 100)}
          data-aos-once="false"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;