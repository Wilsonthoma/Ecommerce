// src/components/layout/ProductReviews.jsx
import React, { useState } from 'react';
import { FiUser, FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Button from '../ui/Button';
import RatingStars from '../ui/RatingStars';
import SectionHeader from '../ui/SectionHeader';

const ProductReviews = ({
  reviews = [],
  totalReviews = 0,
  averageRating = 0,
  ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  userHasReviewed = false,
  isLoggedIn = false,
  showReviewForm = false,
  setShowReviewForm,
  userRating,
  setUserRating,
  reviewText,
  setReviewText,
  submittingReview,
  onSubmitReview,
  onEditReview,
  onDeleteReview,
  formatDate,
  headerImage
}) => {
  return (
    <div className="mt-8">
      <SectionHeader 
        title="REVIEWS"
        image={headerImage}
        showImage={false}
      />
      
      {/* Rating Summary */}
      <div className="p-3 mb-3 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <div className="flex items-center gap-4">
          <div className="w-16 text-center">
            <div className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</div>
            <RatingStars rating={averageRating} size="small" />
            <p className="text-xs text-gray-400">{totalReviews}</p>
          </div>
          
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-2 text-xs text-gray-300">{star}</span>
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    style={{ width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-4 text-xs text-gray-400">{ratingDistribution[star]}</span>
              </div>
            ))}
          </div>
          
          <div className="w-20">
            {userHasReviewed ? (
              <div className="text-xs text-yellow-500 text-center py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/30">
                Already Reviewed
              </div>
            ) : !showReviewForm ? (
              <Button
                onClick={() => setShowReviewForm(true)}
                variant="primary"
                size="sm"
                className="w-full"
              >
                Write Review
              </Button>
            ) : (
              <Button
                onClick={() => setShowReviewForm(false)}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && !userHasReviewed && (
        <div className="p-3 mb-3 border border-gray-700 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          <RatingStars 
            rating={userRating} 
            interactive={true} 
            size="medium"
            onRatingChange={setUserRating}
          />
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="3"
            className="w-full px-3 py-2 mt-2 text-sm text-white border border-gray-700 rounded bg-gradient-to-br from-gray-800 to-gray-900"
            placeholder="Share your experience..."
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => setShowReviewForm(false)} variant="secondary" size="sm">
              Cancel
            </Button>
            <Button onClick={onSubmitReview} disabled={submittingReview} variant="primary" size="sm">
              {submittingReview ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-2">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review._id || review.id}
              review={review}
              isLoggedIn={isLoggedIn}
              onEdit={() => onEditReview(review)}
              onDelete={() => onDeleteReview(review._id)}
              formatDate={formatDate}
            />
          ))
        ) : (
          <div className="p-4 text-center testimonial-card">
            <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewCard = ({ review, isLoggedIn, onEdit, onDelete, formatDate }) => {
  const isOwner = isLoggedIn; // Add logic to check if current user owns this review

  return (
    <div className="p-3 testimonial-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
            <FiUser className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{review.userName || 'Anonymous'}</p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <FiCalendar className="w-2.5 h-2.5" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-1 text-gray-400 hover:text-yellow-500">
              <FiEdit2 className="w-3 h-3" />
            </button>
            <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500">
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      <RatingStars rating={review.rating} size="small" />
      <p className="mt-1 text-xs text-gray-300">{review.comment || review.review}</p>
    </div>
  );
};

export default ProductReviews;