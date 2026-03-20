// src/components/ui/HorizontalScroll.jsx
import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const HorizontalScroll = ({ 
  children, 
  onScroll, 
  showArrows = true,
  itemWidth = 48,
  scrollAmount = 400,
  className = "",
  arrowClassName = ""
}) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -scrollAmount : scrollAmount;
      scrollRef.current.scrollBy({ 
        left: amount, 
        behavior: "smooth" 
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={scrollRef} 
        className="flex gap-3 pb-4 overflow-x-auto sm:gap-4 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
        onScroll={onScroll}
      >
        {children}
      </div>
      
      {showArrows && (
        <>
          <button 
            onClick={() => scroll("left")}
            className={`absolute left-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group ${arrowClassName}`}
          >
            <FiChevronLeft className="w-6 h-6 text-white transition-colors group-hover:text-yellow-500" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className={`absolute right-0 p-3 transition-all -translate-y-1/2 border border-gray-800 rounded-full top-1/2 bg-black/50 hover:bg-black/80 group ${arrowClassName}`}
          >
            <FiChevronRight className="w-6 h-6 text-white transition-colors group-hover:text-yellow-500" />
          </button>
        </>
      )}
    </div>
  );
};

export default HorizontalScroll;