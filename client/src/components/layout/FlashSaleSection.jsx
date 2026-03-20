// src/components/layout/FlashSaleSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from "../ui/ProductCard";
import HorizontalScroll from "../ui/HorizontalScroll";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import { FiArrowRight } from 'react-icons/fi';

const FlashSaleSection = ({ 
  products, 
  loading, 
  headerImage,
  onProductClick,
  showHeader = true,
  className = ""
}) => {
  const navigate = useNavigate();

  const renderContent = () => {
    if (loading) {
      return [...Array(4)].map((_, i) => (
        <div key={i} className="flex-shrink-0 h-64 bg-gray-900 rounded-lg w-36 sm:w-40 md:w-48 sm:h-72 md:h-80 animate-pulse"></div>
      ));
    }

    if (!products || products.length === 0) {
      return <div className="w-full py-12 text-center text-gray-400">No flash sale products available</div>;
    }

    return products.slice(0, 8).map((product, index) => (
      <div 
        key={product._id || product.id || index} 
        className="flex-shrink-0 cursor-pointer w-36 sm:w-40 md:w-48 group"
        onClick={() => onProductClick(product._id || product.id)}
        data-aos="fade-left"
        data-aos-duration="1000"
        data-aos-delay={300 + (index * 100)}
        data-aos-once="false"
      >
        <ProductCard product={product} />
      </div>
    ));
  };

  return (
    <section className={`py-20 bg-black border-t border-gray-800 ${className}`}>
      <div className="px-6 mx-auto max-w-7xl">
        {showHeader && (
          <SectionHeader 
            title="FLASH SALE"
            image={headerImage}
            alt="Flash sale"
          />
        )}

        <div 
          className="flex flex-col items-center justify-between gap-8 mb-12 md:flex-row"
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-delay="400"
          data-aos-once="false"
        >
          <p className="text-2xl font-semibold text-gray-300">Limited time offers ending soon!</p>
          <Button 
            onClick={() => navigate('/shop?onSale=true')}
            variant="secondary"
            size="md"
            icon={FiArrowRight}
            iconPosition="right"
          >
            SHOP NOW
          </Button>
        </div>

        <HorizontalScroll showArrows={products?.length > 4}>
          {renderContent()}
        </HorizontalScroll>
      </div>
    </section>
  );
};

export default FlashSaleSection;