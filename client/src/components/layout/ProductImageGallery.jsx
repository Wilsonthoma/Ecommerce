// src/components/layout/ProductImageGallery.jsx
import React, { useState } from 'react';
import { FiMaximize2, FiMinimize2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Badge from '../ui/Badge';

const ProductImageGallery = ({ images = [], productName, hasDiscount, discountPercentage, flashSaleActive, isTrending, isNew }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleMouseMove = (e) => {
    if (!isZooming) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZooming(!isZooming);
    if (!isZooming) {
      setZoomPosition({ x: 50, y: 50 });
    }
  };

  const nextImage = () => {
    setSelectedIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  const prevImage = () => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const currentImage = images[selectedIndex];

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative w-56 h-56 mx-auto overflow-hidden border border-gray-700 lg:mx-0 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 sm:w-64 sm:h-64 lg:w-72 lg:h-72">
          <div 
            className="relative w-full h-full cursor-zoom-in group"
            onClick={() => setLightboxOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZooming(false)}
          >
            {currentImage && !imageErrors[selectedIndex] ? (
              <img
                src={currentImage.url}
                alt={currentImage.altText || productName}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZooming ? 'scale-150' : 'scale-100'
                }`}
                style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
                onError={() => handleImageError(selectedIndex)}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-800">
                <img src="/fallback-image.jpg" alt="Fallback" className="object-cover w-full h-full opacity-70" />
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="absolute z-10 flex flex-wrap gap-1 top-2 left-2">
            {hasDiscount && <Badge type="discount">-{discountPercentage}%</Badge>}
            {flashSaleActive && <Badge type="flash">⚡ Flash</Badge>}
            {isTrending && <Badge type="trending">🔥 Trending</Badge>}
            {isNew && <Badge type="new">New</Badge>}
          </div>

          {/* Zoom Controls */}
          <div className="absolute z-10 bottom-2 right-2">
            <button
              onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
              className="p-1.5 transition-all border rounded-full bg-black/50 backdrop-blur-md border-white/10 hover:border-yellow-500/50"
            >
              {isZooming ? (
                <FiMinimize2 className="w-3 h-3 text-white" />
              ) : (
                <FiMaximize2 className="w-3 h-3 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex w-56 gap-2 mx-auto lg:w-72 lg:mx-0">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`w-12 h-12 rounded-lg overflow-hidden border ${
                  selectedIndex === index ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-gray-700'
                }`}
              >
                <img src={image.url} alt="" className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/95 backdrop-blur-xl" onClick={() => setLightboxOpen(false)}>
          <div className="relative flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 blur-3xl"></div>
            <div className="relative w-full max-w-4xl">
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3">
                <div className="px-3 py-1 border rounded-full bg-black/50 border-white/10">
                  <span className="text-sm text-white">{selectedIndex + 1} / {images.length}</span>
                </div>
                <button onClick={() => setLightboxOpen(false)} className="p-2 transition-all border rounded-full bg-black/50 border-white/10 hover:border-red-500/50">
                  <FiX className="w-5 h-5 text-white" />
                </button>
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute p-2 transition-all -translate-y-1/2 border rounded-full left-4 top-1/2 bg-black/50 border-white/10 hover:border-yellow-500/50">
                    <FiChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={nextImage} className="absolute p-2 transition-all -translate-y-1/2 border rounded-full right-4 top-1/2 bg-black/50 border-white/10 hover:border-yellow-500/50">
                    <FiChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
              <div className="flex items-center justify-center min-h-[70vh]">
                <img src={currentImage?.url} alt={productName} className="max-w-full max-h-[70vh] object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;