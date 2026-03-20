// server/models/Category.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Cameras',
      'Headphones',
      'Speakers'
    ],
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  subcategories: [{
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  if (this.subcategories && this.subcategories.length > 0) {
    this.subcategories.forEach(sub => {
      if (!sub.slug) {
        sub.slug = sub.name.toLowerCase().replace(/\s+/g, '-');
      }
    });
  }
  next();
});

// Static method to get active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort('order');
};

// Static method to seed default categories
categorySchema.statics.seedCategories = async function() {
  const categories = [
    {
      name: 'Smartphones',
      image: 'https://images.pexels.com/photos/6214386/pexels-photo-6214386.jpeg',
      order: 1,
      description: 'Latest smartphones from top brands including iPhone, Samsung, Google Pixel, Xiaomi, and more. Experience cutting-edge technology, powerful cameras, and lightning-fast performance.',
      subcategories: [
        { name: 'Android Phones' },
        { name: 'iPhones' },
        { name: 'Foldable Phones' },
        { name: 'Gaming Phones' },
        { name: 'Budget Smartphones' },
        { name: 'Premium Smartphones' }
      ]
    },
    {
      name: 'Laptops',
      image: 'https://images.pexels.com/photos/5632379/pexels-photo-5632379.jpeg',
      order: 2,
      description: 'High-performance laptops for work, gaming, and creativity. Choose from top brands like Dell, HP, Lenovo, Apple MacBook, ASUS, and Acer. Find the perfect laptop for your needs.',
      subcategories: [
        { name: 'Gaming Laptops' },
        { name: 'Business Laptops' },
        { name: 'Ultrabooks' },
        { name: '2-in-1 Laptops' },
        { name: 'Student Laptops' },
        { name: 'Workstation Laptops' },
        { name: 'Chromebooks' }
      ]
    },
    {
      name: 'Tablets',
      image: 'https://images.pexels.com/photos/5926443/pexels-photo-5926443.jpeg',
      order: 3,
      description: 'Versatile tablets for entertainment, productivity, and creativity. Shop iPad, Samsung Galaxy Tab, Huawei MatePad, Amazon Fire, and drawing tablets for artists and professionals.',
      subcategories: [
        { name: 'iPad' },
        { name: 'Android Tablets' },
        { name: 'Windows Tablets' },
        { name: 'Kids Tablets' },
        { name: 'Drawing Tablets' },
        { name: 'E-Readers' }
      ]
    },
    {
      name: 'Cameras',
      image: 'https://images.pexels.com/photos/7007177/pexels-photo-7007177.jpeg',
      order: 4,
      description: 'Professional and consumer cameras for photography and videography. Explore DSLR, mirrorless, action cameras from Canon, Nikon, Sony, GoPro, and more. Capture every moment in stunning detail.',
      subcategories: [
        { name: 'DSLR Cameras' },
        { name: 'Mirrorless Cameras' },
        { name: 'Point & Shoot' },
        { name: 'Action Cameras' },
        { name: 'Professional Cameras' },
        { name: 'Camera Lenses' },
        { name: 'Camera Accessories' }
      ]
    },
    {
      name: 'Headphones',
      image: 'https://images.pexels.com/photos/5447382/pexels-photo-5447382.jpeg',
      order: 5,
      description: 'Premium audio experience with our collection of headphones and earbuds. Find wireless, noise-cancelling, and gaming headsets from Sony, Bose, Apple AirPods, Samsung, and JBL.',
      subcategories: [
        { name: 'Wireless Headphones' },
        { name: 'Wired Headphones' },
        { name: 'Noise Cancelling' },
        { name: 'Earbuds' },
        { name: 'Over-Ear' },
        { name: 'On-Ear' },
        { name: 'Sports Headphones' },
        { name: 'Gaming Headsets' }
      ]
    },
    {
      name: 'Speakers',
      image: 'https://images.pexels.com/photos/6207752/pexels-photo-6207752.jpeg',
      order: 6,
      description: 'Powerful speakers for home, portable, and professional audio needs. Shop Bluetooth speakers, smart speakers, soundbars, and home theater systems from JBL, Sony, Bose, Sonos, and more.',
      subcategories: [
        { name: 'Bluetooth Speakers' },
        { name: 'Smart Speakers' },
        { name: 'Home Theater Systems' },
        { name: 'Portable Speakers' },
        { name: 'Soundbars' },
        { name: 'Studio Monitors' },
        { name: 'Party Speakers' },
        { name: 'Outdoor Speakers' }
      ]
    }
  ];

  for (const cat of categories) {
    // Check if category exists
    const existing = await this.findOne({ name: cat.name });
    
    if (existing) {
      // Update existing category
      existing.image = cat.image;
      existing.order = cat.order;
      existing.description = cat.description;
      existing.subcategories = cat.subcategories;
      await existing.save();
      console.log(`✅ Updated category: ${cat.name}`);
    } else {
      // Create new category
      await this.create(cat);
      console.log(`✅ Created category: ${cat.name}`);
    }
  }
  
  console.log('\n🎉 6 Electronics categories seeded successfully!');
  return await this.getActiveCategories();
};

// Static method to update product counts for all categories
categorySchema.statics.updateProductCounts = async function() {
  const Product = mongoose.model('Product');
  const categories = await this.find();
  
  for (const category of categories) {
    // Count products in this category
    const count = await Product.countDocuments({
      category: category.name,
      status: 'active',
      visible: true
    });
    
    category.productCount = count;
    
    // Update subcategory counts
    for (const sub of category.subcategories) {
      const subCount = await Product.countDocuments({
        category: category.name,
        subcategory: sub.name,
        status: 'active',
        visible: true
      });
      sub.count = subCount;
    }
    
    await category.save();
    console.log(`📊 ${category.name}: ${count} products`);
  }
  
  console.log('✅ Category product counts updated');
};

// Static method to get category with product count
categorySchema.statics.getCategoryWithCount = async function(slug) {
  const category = await this.findOne({ slug, isActive: true });
  if (!category) return null;
  
  const Product = mongoose.model('Product');
  const productCount = await Product.countDocuments({
    category: category.name,
    status: 'active',
    visible: true
  });
  
  const categoryObj = category.toObject();
  categoryObj.productCount = productCount;
  
  // Update subcategory counts
  for (const sub of categoryObj.subcategories) {
    const subCount = await Product.countDocuments({
      category: category.name,
      subcategory: sub.name,
      status: 'active',
      visible: true
    });
    sub.count = subCount;
  }
  
  return categoryObj;
};

// Static method to get categories with counts
categorySchema.statics.getCategoriesWithCounts = async function() {
  const categories = await this.getActiveCategories();
  const Product = mongoose.model('Product');
  
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category.name,
        status: 'active',
        visible: true
      });
      
      const categoryObj = category.toObject();
      categoryObj.productCount = productCount;
      
      // Update subcategory counts
      for (const sub of categoryObj.subcategories) {
        const subCount = await Product.countDocuments({
          category: category.name,
          subcategory: sub.name,
          status: 'active',
          visible: true
        });
        sub.count = subCount;
      }
      
      return categoryObj;
    })
  );
  
  return categoriesWithCounts;
};

// Static method to get category by name
categorySchema.statics.getCategoryByName = async function(name) {
  return this.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, isActive: true });
};

// Virtual: Category URL
categorySchema.virtual('url').get(function() {
  return `/shop?category=${this.slug}`;
});

// Virtual: Has products
categorySchema.virtual('hasProducts').get(function() {
  return this.productCount > 0;
});

// Instance method: Update product count for this category
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  this.productCount = await Product.countDocuments({
    category: this.name,
    status: 'active',
    visible: true
  });
  return this.save();
};

// Instance method: Get products in this category
categorySchema.methods.getProducts = async function(limit = 20, skip = 0) {
  const Product = mongoose.model('Product');
  return Product.find({
    category: this.name,
    status: 'active',
    visible: true
  })
  .sort('-createdAt')
  .skip(skip)
  .limit(limit);
};

// Instance method: Get popular products in this category
categorySchema.methods.getPopularProducts = async function(limit = 8) {
  const Product = mongoose.model('Product');
  return Product.find({
    category: this.name,
    status: 'active',
    visible: true
  })
  .sort('-totalSold', '-rating')
  .limit(limit);
};

// Indexes for performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model('Category', categorySchema);

// Create the model and export
export default Category;