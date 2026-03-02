// server/routes/public/products.js - FIXED with rating logging
import express from 'express';
import Product from '../../models/Product.js';

const router = express.Router();

// Query validation middleware
const validateProductQuery = (req, res, next) => {
  const { page = 1, limit = 20, minPrice, maxPrice } = req.query;
  
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number'
    });
  }
  
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
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

// Helper function to enhance product with calculated fields
const enhanceProduct = (product) => {
  const productObj = { ...product };
  
  // Log rating for debugging
  console.log(`📊 Product ${product.name} - Rating: ${product.rating}, Reviews: ${product.reviewsCount}`);
  
  // Calculate discount percentage from comparePrice
  if (product.comparePrice && product.comparePrice > product.price) {
    productObj.discountPercentage = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    productObj.isOnSale = true;
  } else {
    productObj.discountPercentage = 0;
    productObj.isOnSale = false;
  }
  
  // Calculate inStock status
  if (!product.trackQuantity) {
    productObj.inStock = true;
  } else if (product.allowOutOfStockPurchase) {
    productObj.inStock = true;
  } else {
    productObj.inStock = product.quantity > 0;
  }
  
  // Get primary image
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.isPrimary);
    productObj.primaryImage = primaryImage ? primaryImage.url : product.images[0].url;
  } else if (product.thumbnail) {
    productObj.primaryImage = product.thumbnail;
  } else {
    productObj.primaryImage = null;
  }
  
  // Get all image URLs
  productObj.imageUrls = product.images ? product.images.map(img => img.url) : [];
  
  // Check flash sale status
  if (product.isFlashSale && product.flashSaleEndDate) {
    productObj.flashSaleActive = new Date() < new Date(product.flashSaleEndDate);
    if (productObj.flashSaleActive) {
      productObj.flashSaleTimeRemaining = Math.max(0, new Date(product.flashSaleEndDate) - new Date());
    }
  } else {
    productObj.flashSaleActive = product.isFlashSale;
  }
  
  // Format estimated delivery
  if (product.estimatedDeliveryMin && product.estimatedDeliveryMax) {
    productObj.estimatedDeliveryRange = `${product.estimatedDeliveryMin}-${product.estimatedDeliveryMax} days`;
  }
  
  // Format shipping rate
  if (product.freeShipping) {
    productObj.shippingRate = 0;
    productObj.shippingText = 'Free Shipping';
  } else if (product.flatShippingRate) {
    productObj.shippingRate = product.flatShippingRate;
    productObj.shippingText = `KSh ${product.flatShippingRate.toLocaleString()}`;
  } else {
    productObj.shippingRate = null;
    productObj.shippingText = 'Shipping calculated at checkout';
  }
  
  return productObj;
};

// GET all products with comprehensive filtering
router.get('/', validateProductQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      category,
      subcategory,
      featured,
      isTrending,
      isFlashSale,
      isJustArrived,
      minPrice,
      maxPrice,
      search,
      inStock,
      onSale,
      vendor,
      minRating,
      status = 'active'
    } = req.query;

    const query = { 
      status: 'active',
      visible: true 
    };

    if (category && category !== 'all' && category !== 'null' && category !== '') {
      query.category = category;
    }

    if (subcategory && subcategory !== '' && subcategory !== 'null') {
      query.subcategory = subcategory;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (isTrending === 'true') {
      query.isTrending = true;
    }

    if (isFlashSale === 'true') {
      query.isFlashSale = true;
      query.$or = [
        { flashSaleEndDate: { $gt: new Date() } },
        { flashSaleEndDate: { $exists: false } }
      ];
    }

    if (isJustArrived === 'true') {
      query.isJustArrived = true;
    }

    if (vendor && vendor !== '' && vendor !== 'null') {
      query.vendor = vendor;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { tags: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex },
        { vendor: searchRegex },
        { sku: searchRegex }
      ];
    }

    if (inStock === 'true') {
      query.$or = [
        { trackQuantity: false },
        { quantity: { $gt: 0 } },
        { allowOutOfStockPurchase: true }
      ];
    } else if (inStock === 'false') {
      query.trackQuantity = true;
      query.quantity = { $lte: 0 };
      query.allowOutOfStockPurchase = false;
    }

    if (onSale === 'true') {
      query.comparePrice = { $gt: 0 };
      query.price = { $lt: '$comparePrice' };
    }

    if (minRating && !isNaN(parseFloat(minRating))) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortOption = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortOption[field.substring(1)] = -1;
        } else {
          sortOption[field] = 1;
        }
      });
    } else {
      sortOption = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOption)
        .select('-__v -createdBy')
        .lean(),
      Product.countDocuments(query)
    ]);

    const enhancedProducts = products.map(enhanceProduct);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: parseInt(page),
      products: enhancedProducts
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products'
    });
  }
});

// GET featured products
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const featuredProducts = await Product.find({ 
      featured: true,
      status: 'active',
      visible: true
    })
      .limit(Math.min(parseInt(limit), 20))
      .sort('-createdAt')
      .lean();

    const enhancedProducts = featuredProducts.map(enhanceProduct);

    res.json({
      success: true,
      count: enhancedProducts.length,
      products: enhancedProducts
    });
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch featured products'
    });
  }
});

// GET trending products
router.get('/trending', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const trendingProducts = await Product.find({ 
      isTrending: true,
      status: 'active',
      visible: true
    })
      .limit(Math.min(parseInt(limit), 20))
      .sort('-createdAt')
      .lean();

    const enhancedProducts = trendingProducts.map(enhanceProduct);

    res.json({
      success: true,
      count: enhancedProducts.length,
      products: enhancedProducts
    });
  } catch (err) {
    console.error('Error fetching trending products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch trending products'
    });
  }
});

// GET flash sale products
router.get('/flash-sale', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const flashSaleProducts = await Product.find({ 
      isFlashSale: true,
      status: 'active',
      visible: true,
      $or: [
        { flashSaleEndDate: { $gt: new Date() } },
        { flashSaleEndDate: { $exists: false } }
      ]
    })
      .limit(Math.min(parseInt(limit), 20))
      .sort('-createdAt')
      .lean();

    const enhancedProducts = flashSaleProducts.map(enhanceProduct);

    res.json({
      success: true,
      count: enhancedProducts.length,
      products: enhancedProducts
    });
  } catch (err) {
    console.error('Error fetching flash sale products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch flash sale products'
    });
  }
});

// GET just arrived products
router.get('/just-arrived', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const justArrivedProducts = await Product.find({ 
      isJustArrived: true,
      status: 'active',
      visible: true
    })
      .limit(Math.min(parseInt(limit), 20))
      .sort('-createdAt')
      .lean();

    const enhancedProducts = justArrivedProducts.map(enhanceProduct);

    res.json({
      success: true,
      count: enhancedProducts.length,
      products: enhancedProducts
    });
  } catch (err) {
    console.error('Error fetching just arrived products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch just arrived products'
    });
  }
});

// GET product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({ 
      slug,
      status: 'active',
      visible: true 
    }).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const enhancedProduct = enhanceProduct(product);

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: 'active',
      visible: true
    })
      .limit(4)
      .lean();

    const enhancedRelated = relatedProducts.map(enhanceProduct);

    res.json({
      success: true,
      product: enhancedProduct,
      relatedProducts: enhancedRelated
    });
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details'
    });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({ 
      _id: id,
      status: 'active',
      visible: true 
    }).lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const enhancedProduct = enhanceProduct(product);

    const relatedProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      status: 'active',
      visible: true
    })
      .limit(4)
      .lean();

    const enhancedRelated = relatedProducts.map(enhanceProduct);

    res.json({
      success: true,
      product: enhancedProduct,
      relatedProducts: enhancedRelated
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

// GET all categories with counts
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active', visible: true } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        subcategories: { $addToSet: '$subcategory' }
      }},
      { $sort: { _id: 1 } }
    ]);

    const formattedCategories = categories.map(cat => ({
      name: cat._id,
      count: cat.count,
      subcategories: cat.subcategories.filter(Boolean).sort()
    }));

    res.json({
      success: true,
      categories: formattedCategories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

export default router;