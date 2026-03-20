// src/components/layout/ProductSection.jsx
import React from 'react';
import ProductGrid from './ProductGrid';
import SectionHeader from "../ui/SectionHeader";

const ProductSection = ({ 
  title, 
  products, 
  loading, 
  headerImage,
  onProductClick,
  columns = 4,
  alt,
  showImage = true,
  className = "",
  sectionClassName = "py-20 bg-black"
}) => {
  return (
    <section className={`${sectionClassName} ${className}`}>
      <div className="px-6 mx-auto max-w-7xl">
        <SectionHeader 
          title={title}
          image={headerImage}
          alt={alt || title}
          showImage={showImage}
        />

        <ProductGrid 
          products={products}
          loading={loading}
          onProductClick={onProductClick}
          columns={columns}
        />
      </div>
    </section>
  );
};

export default ProductSection;