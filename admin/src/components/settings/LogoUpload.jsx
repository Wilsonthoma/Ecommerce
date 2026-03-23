
import React, { useState } from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const LogoUpload = ({ logoPreview, storeLogo, onLogoChange, onUrlChange }) => {
  const [logoFile, setLogoFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setLogoFile(file);
      onLogoChange(file);
    }
  };

  const getPlaceholderSVG = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5Mb2dvPC90ZXh0Pjwvc3ZnPg==';
  };

  const getImageUrl = () => {
    if (logoPreview) return logoPreview;
    if (storeLogo) return storeLogo;
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="p-6 bg-gray-700/50 rounded-xl">
      <h3 className="flex items-center mb-4 text-lg font-semibold text-white">
        <BuildingStorefrontIcon className="w-5 h-5 mr-2 text-yellow-500" />
        Store Logo
      </h3>
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-800 border-2 border-gray-600 border-dashed rounded-lg">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Store Logo" 
                className="object-contain w-full h-full p-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getPlaceholderSVG();
                }}
              />
            ) : (
              <div className="p-4 text-center">
                <BuildingStorefrontIcon className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-500">No logo uploaded</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Upload Logo
          </label>
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer">
              <div className="px-4 py-2 text-white transition-colors bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600">
                Choose File
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {logoFile && (
              <span className="text-sm text-gray-400">{logoFile.name}</span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Recommended: 300x300px, PNG or JPG, max 5MB
          </p>
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Or enter logo URL
            </label>
            <input
              type="url"
              value={storeLogo || ''}
              onChange={(e) => onUrlChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
