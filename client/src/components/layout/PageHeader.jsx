// src/components/layout/PageHeader.jsx
import React from 'react';

const PageHeader = ({ title, subtitle, image, gradient = "from-yellow-600/20 via-orange-600/20 to-red-600/20" }) => {
  return (
    <div 
      className="relative w-full overflow-hidden h-36 sm:h-44 md:h-48"
      data-aos="fade-in"
      data-aos-duration="1500"
    >
      <div className="absolute inset-0">
        <img 
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} mix-blend-overlay`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>
      
      <div className="absolute inset-0 flex items-center">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6">
          <div 
            className="max-w-2xl"
            data-aos="fade-right"
            data-aos-duration="1200"
          >
            <div className="section-title-wrapper">
              <h1 className="section-title">{title}</h1>
            </div>
            {subtitle && (
              <p className="mt-2 text-xs text-gray-300 sm:text-sm">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;