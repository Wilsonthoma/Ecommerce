// src/components/layout/TestimonialsSection.jsx
import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import SectionHeader from "../ui/SectionHeader";
import { testimonials } from "../../utils/constants";

const TestimonialsSection = ({ 
  headerImage,
  showHeader = true,
  className = "",
  items = testimonials
}) => {
  return (
    <section className={`py-20 bg-black border-t border-gray-800 ${className}`}>
      <div className="px-6 mx-auto max-w-7xl">
        {showHeader && (
          <SectionHeader 
            title="HEAR WHAT THEY ARE SAYING"
            image={headerImage}
            alt="What people say about us"
          />
        )}
        
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {items.map((testimonial, index) => (
            <div 
              key={index} 
              className="p-4 transition-all duration-500 rounded-lg sm:p-6 bg-gray-900/50 hover:scale-105 hover:bg-gray-800/50"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay={300 + (index * 150)}
              data-aos-once="false"
            >
              <div className="flex items-center gap-3 mb-3 sm:gap-4 sm:mb-4">
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full sm:w-12 sm:h-12"
                />
                <div>
                  <div className="text-sm font-medium text-white sm:text-base">{testimonial.name}</div>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      i < testimonial.rating ? 
                        <FaStar key={i} className="w-3 h-3 text-yellow-500 sm:w-4 sm:h-4" /> :
                        <FaRegStar key={i} className="w-3 h-3 text-gray-600 sm:w-4 sm:h-4" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-gray-400 sm:text-sm">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;