import express from 'express';
import mongoose from 'mongoose';
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

const router = express.Router();

// GET all categories with counts (using Category model)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getCategoriesWithCounts();
    
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

// GET single category details by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get category with product count
    const category = await Category.getCategoryWithCount(slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get products in this category
    const [products, total] = await Promise.all([
      Product.find({ 
        category: category.name,
        status: 'active',
        visible: true 
      })
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt')
        .select('name price comparePrice images rating reviewsCount slug quantity trackQuantity allowOutOfStockPurchase featured isTrending isFlashSale isJustArrived')
        .lean(),
      Product.countDocuments({ 
        category: category.name,
        status: 'active',
        visible: true 
      })
    ]);

    // Enhance products with calculated fields
    const enhancedProducts = products.map(product => ({
      ...product,
      discountPercentage: product.comparePrice && product.comparePrice > product.price 
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0,
      primaryImage: product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || null,
      inStock: product.quantity > 0 || !product.trackQuantity || product.allowOutOfStockPurchase,
      isOnSale: product.comparePrice && product.comparePrice > product.price,
      isFeatured: product.featured,
      imageUrls: product.images?.map(img => img.url) || []
    }));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        productCount: category.productCount,
        subcategories: category.subcategories
      },
      products: enhancedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Error fetching category products:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category products'
    });
  }
});

// GET category by name (alternative)
router.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const category = await Category.getCategoryByName(name);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        productCount: category.productCount,
        subcategories: category.subcategories
      }
    });
  } catch (err) {
    console.error('Error fetching category by name:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
});

// GET subcategory products
router.get('/:categorySlug/:subcategorySlug', async (req, res) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find the category
    const category = await Category.findOne({ slug: categorySlug, isActive: true });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Find the subcategory
    const subcategory = category.subcategories.find(sub => sub.slug === subcategorySlug);
    
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    
    const [products, total] = await Promise.all([
      Product.find({ 
        category: category.name,
        subcategory: subcategory.name,
        status: 'active',
        visible: true 
      })
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt')
        .select('name price comparePrice images rating reviewsCount slug quantity trackQuantity allowOutOfStockPurchase featured isTrending isFlashSale isJustArrived')
        .lean(),
      Product.countDocuments({ 
        category: category.name,
        subcategory: subcategory.name,
        status: 'active',
        visible: true 
      })
    ]);
    
    const enhancedProducts = products.map(product => ({
      ...product,
      discountPercentage: product.comparePrice && product.comparePrice > product.price 
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0,
      primaryImage: product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || null,
      inStock: product.quantity > 0 || !product.trackQuantity || product.allowOutOfStockPurchase,
      isOnSale: product.comparePrice && product.comparePrice > product.price,
      isFeatured: product.featured,
      imageUrls: product.images?.map(img => img.url) || []
    }));
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug
      },
      subcategory: {
        name: subcategory.name,
        slug: subcategory.slug,
        count: subcategory.count
      },
      products: enhancedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Error fetching subcategory products:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategory products'
    });
  }
});

// GET categories stats (for admin dashboard)
router.get('/stats/all', async (req, res) => {
  try {
    const categories = await Category.getCategoriesWithCounts();
    
    const stats = {
      totalCategories: categories.length,
      categoriesWithProducts: categories.filter(c => c.productCount > 0).length,
      totalProducts: categories.reduce((sum, c) => sum + c.productCount, 0),
      categories
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Error fetching category stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category stats'
    });
  }
});

export default router;