// server/models/Review.js - COMPLETELY FIXED with working rating updates
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
  if (this.comment) {
    this.comment = this.comment.trim();
  }
  next();
});

// ✅ STATIC: Update product rating - FULLY FIXED with better error handling
reviewSchema.statics.updateProductRating = async function(productId) {
  try {
    console.log(`📊 Updating rating for product: ${productId}`);
    
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error('❌ Invalid product ID format:', productId);
      return { averageRating: 0, reviewCount: 0 };
    }
    
    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(productId);
    
    // Aggregate approved reviews for this product
    const result = await this.aggregate([
      { 
        $match: { 
          product: objectId, 
          status: 'approved' 
        } 
      },
      { 
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Aggregation result:', JSON.stringify(result, null, 2));

    // Get the Product model
    const Product = mongoose.model('Product');
    
    if (result.length > 0) {
      const { averageRating, reviewCount } = result[0];
      // Round to 1 decimal place
      const roundedRating = Math.round(averageRating * 10) / 10;
      
      console.log(`✅ Updating product ${productId} with rating: ${roundedRating}, count: ${reviewCount}`);
      
      // Update only the fields that exist in Product schema
      const updateResult = await Product.findByIdAndUpdate(
        productId, 
        {
          $set: {
            rating: roundedRating,
            reviewsCount: reviewCount
          }
        },
        { new: true } // Return the updated document
      );
      
      if (updateResult) {
        console.log('📊 Updated product:', {
          name: updateResult.name,
          rating: updateResult.rating,
          reviewsCount: updateResult.reviewsCount
        });
      } else {
        console.log('❌ Product not found for update:', productId);
      }
      
      return { averageRating: roundedRating, reviewCount };
    } else {
      // No reviews, reset to 0
      console.log(`ℹ️ No reviews for product ${productId}, resetting rating to 0`);
      
      const updateResult = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            rating: 0,
            reviewsCount: 0
          }
        },
        { new: true }
      );
      
      if (updateResult) {
        console.log('📊 Reset product:', {
          name: updateResult.name,
          rating: updateResult.rating,
          reviewsCount: updateResult.reviewsCount
        });
      }
      
      return { averageRating: 0, reviewCount: 0 };
    }
  } catch (error) {
    console.error('❌ Error updating product rating:', error);
    throw error;
  }
};

// ✅ POST-SAVE: Update product rating
reviewSchema.post('save', async function() {
  try {
    console.log(`🔄 Post-save hook triggered for review ${this._id}`);
    await this.constructor.updateProductRating(this.product);
  } catch (error) {
    console.error('❌ Error in post-save hook:', error);
  }
});

// ✅ POST-REMOVE: Update product rating
reviewSchema.post('remove', async function() {
  try {
    console.log(`🔄 Post-remove hook triggered for review ${this._id}`);
    await this.constructor.updateProductRating(this.product);
  } catch (error) {
    console.error('❌ Error in post-remove hook:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;