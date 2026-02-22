// server/models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    index: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  helpful: {
    type: Number,
    default: 0
  },
  
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  reported: {
    type: Boolean,
    default: false
  },
  
  reportReason: String,
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  
  images: [{
    url: String,
    caption: String
  }],
  
  response: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    respondedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ✅ VIRTUAL: Format date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// ✅ PRE-SAVE: Trim and validate
reviewSchema.pre('save', function(next) {
  this.comment = this.comment.trim();
  
  // Set userName from user if not provided
  if (!this.userName && this.user) {
    // This would need to be populated first
    this.userName = 'Anonymous';
  }
  
  next();
});

// ✅ STATIC: Update product rating - FIXED
reviewSchema.statics.updateProductRating = async function(productId) {
  try {
    // ✅ FIXED: Convert string to ObjectId properly
    const mongoose = require('mongoose');
    const objectId = new mongoose.Types.ObjectId(productId);
    
    const result = await this.aggregate([
      { $match: { product: objectId, status: 'approved' } },
      { 
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      const { averageRating, reviewCount } = result[0];
      const roundedRating = Math.round(averageRating * 10) / 10;
      
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: roundedRating,
        reviewsCount: reviewCount,
        'ratings.average': roundedRating,
        'ratings.count': reviewCount
      });
      
      return { averageRating: roundedRating, reviewCount };
    } else {
      // No reviews, reset to 0
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: 0,
        reviewsCount: 0,
        'ratings.average': 0,
        'ratings.count': 0
      });
      
      return { averageRating: 0, reviewCount: 0 };
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
    throw error;
  }
};

// ✅ POST-SAVE: Update product rating
reviewSchema.post('save', async function() {
  try {
    await this.constructor.updateProductRating(this.product);
  } catch (error) {
    console.error('Error in post-save hook:', error);
  }
});

// ✅ POST-REMOVE: Update product rating
reviewSchema.post('remove', async function() {
  try {
    await this.constructor.updateProductRating(this.product);
  } catch (error) {
    console.error('Error in post-remove hook:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;