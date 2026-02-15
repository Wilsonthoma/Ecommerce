// server/routes/public/reviews.js
import express from 'express';
import Review from '../../models/Review.js';
import Product from '../../models/Product.js';
import { protectUser } from '../../middleware/authMiddleware.js'; // ✅ FIXED: Changed from 'auth.js' to 'authMiddleware.js'

const router = express.Router();

// GET reviews for a product (public)
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get reviews
    const [reviews, total] = await Promise.all([
      Review.find({ product: productId, status: 'approved' })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments({ product: productId, status: 'approved' })
    ]);
    
    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { product: productId, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });
    
    res.json({
      success: true,
      reviews,
      distribution: ratingDistribution,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// GET review summary for a product (public)
router.get('/products/:productId/summary', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId).select('rating reviewsCount');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const distribution = await Review.aggregate([
      { $match: { product: productId, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });
    
    res.json({
      success: true,
      summary: {
        averageRating: product.rating || 0,
        totalReviews: product.reviewsCount || 0,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching review summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review summary'
    });
  }
});

// POST a new review (protected)
router.post('/products/:productId/reviews', protectUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    const userName = req.user.name || req.user.email;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 3 characters'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: userId,
      userName,
      rating,
      comment,
      verified: false
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Error adding review:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

// UPDATE a review (protected)
router.put('/reviews/:reviewId', protectUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    
    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// DELETE a review (protected)
router.delete('/reviews/:reviewId', protectUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.remove();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

export default router;