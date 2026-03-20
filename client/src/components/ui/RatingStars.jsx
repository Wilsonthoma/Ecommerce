// src/components/ui/RatingStars.jsx
import React, { useState } from 'react';
import { AiFillStar } from 'react-icons/ai';

const RatingStars = ({ rating = 0, interactive = false, size = 'small', onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const starSize = sizeClasses[size] || sizeClasses.medium;

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      setSelectedRating(value);
      onRatingChange(value);
    }
  };

  const currentRating = interactive ? (hoverRating || selectedRating) : rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none transition-transform hover:scale-110`}
        >
          <AiFillStar
            className={`${starSize} ${
              star <= currentRating
                ? 'text-yellow-400'
                : 'text-gray-600'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;