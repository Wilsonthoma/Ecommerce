// src/components/ui/SectionHeader.jsx
import React from 'react';

const SectionHeader = ({ 
  title, 
  subtitle, 
  image, 
  alt, 
  imagePosition = "top",
  showImage = true 
}) => {
  return (
    <>
      {showImage && image && (
        <div 
          className="relative w-full mb-12 overflow-hidden rounded-2xl h-96"
          data-aos="zoom-in"
          data-aos-duration="1200"
          data-aos-delay="200"
          data-aos-once="false"
        >
          <img 
            src={image}
            alt={alt || title}
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
            onError={(e) => {
              e.target.src = "https://images.pexels.com/photos/6349119/pexels-photo-6349119.jpeg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
      )}
      
      <div 
        className="section-header-container"
        data-aos="fade-down"
        data-aos-duration="1000"
        data-aos-delay="300"
        data-aos-once="false"
      >
        <div className="section-title-wrapper">
          <h2 className="section-title">{title}</h2>
        </div>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
    </>
  );
};

export default SectionHeader;