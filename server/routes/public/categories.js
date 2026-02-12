import express from 'express';
import Product from '../../models/Product.js';

const router = express.Router();

// GET all categories with counts
router.get('/', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $match: {
          // Optional: add filters if needed, e.g., only in-stock products
          inStock: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET single category details
router.get('/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find({ 
        category: categoryName,
        inStock: true 
      })
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt')
        .select('name price image rating category')
        .lean(),
      Product.countDocuments({ 
        category: categoryName,
        inStock: true 
      })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      category: categoryName,
      count: products.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      products
    });
  } catch (err) {
    console.error('Error fetching category products:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category products'
    });
  }
});

export default router;