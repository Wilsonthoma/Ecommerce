import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ImageGallery = ({ images, primaryImageIndex = 0, showThumbnails = true, className = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState(primaryImageIndex);
  const [showLightbox, setShowLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center ${className}`}>
        <div className="p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  const nextImage = () => setSelectedIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
        <img
          src={currentImage.url}
          alt={currentImage.altText || `Product image ${selectedIndex + 1}`}
          className="object-contain w-full h-auto cursor-pointer max-h-96"
          onClick={() => setShowLightbox(true)}
          onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=Image+Error'}
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute p-2 transition-all -translate-y-1/2 border border-gray-600 rounded-full shadow-lg left-4 top-1/2 bg-gray-800/80 hover:bg-gray-700 hover:scale-105"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="absolute p-2 transition-all -translate-y-1/2 border border-gray-600 rounded-full shadow-lg right-4 top-1/2 bg-gray-800/80 hover:bg-gray-700 hover:scale-105"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/90 text-white text-sm font-medium rounded-full border border-gray-700">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {selectedIndex === primaryImageIndex && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
              Primary
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex py-2 space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={image.altText || `Thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
                onError={(e) => e.target.src = 'https://via.placeholder.com/80x80?text=Thumb'}
              />
              {index === primaryImageIndex && (
                <div className="absolute top-1 left-1">
                  <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                    P
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-95">
          <div className="relative max-w-7xl max-h-[90vh]">
            <img
              src={currentImage.url}
              alt={currentImage.altText || 'Product image'}
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute p-2 text-white transition-colors border border-gray-600 rounded-full top-4 right-4 bg-gray-800/80 hover:bg-gray-700"
              aria-label="Close lightbox"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute p-3 text-white transition-colors -translate-y-1/2 border border-gray-600 rounded-full left-4 top-1/2 bg-gray-800/80 hover:bg-gray-700"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute p-3 text-white transition-colors -translate-y-1/2 border border-gray-600 rounded-full right-4 top-1/2 bg-gray-800/80 hover:bg-gray-700"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute px-4 py-2 text-sm font-medium text-white -translate-x-1/2 border border-gray-700 rounded-full bottom-4 left-1/2 bg-gray-900/90">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;