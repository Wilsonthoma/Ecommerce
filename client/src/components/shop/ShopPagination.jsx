// src/components/shop/ShopPagination.jsx
import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ShopPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-1 p-1 bg-gray-900 border border-gray-800 rounded-lg">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 disabled:opacity-50"
        >
          <FiChevronLeft className="w-3.5 h-3.5" />
        </button>
        
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`relative w-7 h-7 text-[10px] font-medium rounded-lg transition-all md:w-8 md:h-8 ${
              currentPage === pageNum
                ? 'text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {currentPage === pageNum && (
              <>
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600"></span>
                <span className="absolute inset-0 rounded-lg opacity-50 bg-gradient-to-r from-yellow-600 to-orange-600 blur"></span>
              </>
            )}
            <span className="relative">{pageNum}</span>
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5 disabled:opacity-50"
        >
          <FiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ShopPagination;