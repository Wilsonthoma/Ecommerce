import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ImageCropper = ({ image, onCrop, onCancel, aspectRatio = 1 }) => {
  const [crop, setCrop] = useState({ 
    unit: '%', 
    width: 90, 
    aspect: aspectRatio 
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) onCrop(croppedImage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Crop Image</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 transition-colors hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-400">Adjust the crop area and click "Apply Crop"</p>
        </div>

        <div className="p-6">
          <div className="max-h-[60vh] overflow-auto">
            {typeof image === 'string' ? (
              <img src={image} alt="Original" className="h-auto max-w-full" />
            ) : (
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="h-auto max-w-full"
              >
                <img
                  ref={imgRef}
                  src={URL.createObjectURL(image)}
                  alt="Crop me"
                  className="h-auto max-w-full"
                />
              </ReactCrop>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-400">
              <span className="font-medium text-yellow-500">Tip:</span> Drag the corners to adjust the crop area
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-300 transition-colors border border-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                className="px-6 py-2 font-medium text-white transition-colors rounded-lg shadow-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!completedCrop}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;