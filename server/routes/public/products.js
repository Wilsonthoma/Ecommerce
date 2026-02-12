import express from 'express';
import Product from '../../models/Product.js';

const router = express.Router();

// Query validation middleware
const validateProductQuery = (req, res, next) => {
  const { page = 1, limit = 20, minPrice, maxPrice } = req.query;
  
  // Validate page
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number'
    });
  }
  
  // Validate limit
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  // Validate price range
  if (minPrice && (isNaN(minPrice) || parseFloat(minPrice) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum price must be a non-negative number'
    });
  }
  
  if (maxPrice && (isNaN(maxPrice) || parseFloat(maxPrice) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Maximum price must be a non-negative number'
    });
  }
  
  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum price cannot be greater than maximum price'
    });
  }
  
  next();
};

// GET all products with filtering
router.get('/', validateProductQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      category,
      featured,
      minPrice,
      maxPrice,
      search,
      inStock,
      onSale
    } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'all' && category !== 'null') {
      query.category = category;
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { category: searchRegex }
      ];
    }

    // Stock filter
    if (inStock === 'true' || inStock === 'false') {
      query.inStock = inStock === 'true';
    }

    // On sale filter
    if (onSale === 'true') {
      query.discountPercentage = { $gt: 0 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort)
        .select('-__v')
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calculate discounted prices
    const productsWithDiscount = products.map(product => {
      const productObj = { ...product };
      if (product.discountPercentage > 0) {
        productObj.discountedPrice = product.price * (1 - product.discountPercentage / 100);
        productObj.isOnSale = true;
      } else {
        productObj.discountedPrice = product.price;
        productObj.isOnSale = false;
      }
      return productObj;
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      products: productsWithDiscount
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET featured products
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const featuredProducts = await Product.find({ 
      featured: true,
      inStock: true 
    })
      .limit(Math.min(parseInt(limit), 20))
      .sort('-createdAt')
      .select('name price image category rating discountPercentage')
      .lean();

    // Add discounted price
    const productsWithDiscount = featuredProducts.map(product => {
      const productObj = { ...product };
      if (product.discountPercentage > 0) {
        productObj.discountedPrice = product.price * (1 - product.discountPercentage / 100);
      }
      return productObj;
    });

    res.json({
      success: true,
      count: featuredProducts.length,
      products: productsWithDiscount
    });
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch featured products'
    });
  }
});

// GET top selling products
router.get('/top-selling', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topProducts = await Product.find({ 
      inStock: true 
    })
      .limit(Math.min(parseInt(limit), 20))
      .sort('-salesCount -rating')
      .select('name price image category rating salesCount discountPercentage')
      .lean();

    const productsWithDiscount = topProducts.map(product => {
      const productObj = { ...product };
      if (product.discountPercentage > 0) {
        productObj.discountedPrice = product.price * (1 - product.discountPercentage / 100);
      }
      return productObj;
    });

    res.json({
      success: true,
      count: topProducts.length,
      products: productsWithDiscount
    });
  } catch (err) {
    console.error('Error fetching top selling products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch top selling products'
    });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).select('-__v').lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate discounted price
    if (product.discountPercentage > 0) {
      product.discountedPrice = product.price * (1 - product.discountPercentage / 100);
      product.isOnSale = true;
    } else {
      product.discountedPrice = product.price;
      product.isOnSale = false;
    }

    // Get related products
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      inStock: true
    })
      .limit(4)
      .select('name price image category rating discountPercentage')
      .lean();

    // Add discounted prices to related products
    const relatedWithDiscount = relatedProducts.map(prod => {
      const prodObj = { ...prod };
      if (prod.discountPercentage > 0) {
        prodObj.discountedPrice = prod.price * (1 - prod.discountPercentage / 100);
      }
      return prodObj;
    });

    res.json({
      success: true,
      product,
      relatedProducts: relatedWithDiscount
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details'
    });
  }
});

export default router;