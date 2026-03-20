import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },

  description: {
    type: String,
    required: [true, 'Product description is required'],
  },

  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },

  // Pricing
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },

  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },

  costPerItem: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },

  // Identifiers
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  barcode: {
    type: String,
    trim: true
  },

  // Stock Management
  trackQuantity: {
    type: Boolean,
    default: true
  },

  quantity: {
    type: Number,
    default: 0,
    min: 0
  },

  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },

  allowOutOfStockPurchase: {
    type: Boolean,
    default: false
  },

  // ✅ 6 MAIN ELECTRONICS CATEGORIES
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Cameras',
      'Headphones',
      'Speakers'
    ]
  },

  subcategory: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) return true;
        
        const validSubcategories = {
          'Smartphones': [
            'Android Phones', 'iPhones', 'Foldable Phones', 'Gaming Phones',
            'Budget Smartphones', 'Premium Smartphones'
          ],
          'Laptops': [
            'Gaming Laptops', 'Business Laptops', 'Ultrabooks', '2-in-1 Laptops',
            'Student Laptops', 'Workstation Laptops', 'Chromebooks'
          ],
          'Tablets': [
            'iPad', 'Android Tablets', 'Windows Tablets', 'Kids Tablets',
            'Drawing Tablets', 'E-Readers'
          ],
          'Cameras': [
            'DSLR Cameras', 'Mirrorless Cameras', 'Point & Shoot', 'Action Cameras',
            'Professional Cameras', 'Camera Lenses', 'Camera Accessories'
          ],
          'Headphones': [
            'Wireless Headphones', 'Wired Headphones', 'Noise Cancelling', 'Earbuds',
            'Over-Ear', 'On-Ear', 'Sports Headphones', 'Gaming Headsets'
          ],
          'Speakers': [
            'Bluetooth Speakers', 'Smart Speakers', 'Home Theater Systems', 'Portable Speakers',
            'Soundbars', 'Studio Monitors', 'Party Speakers', 'Outdoor Speakers'
          ]
        };
        
        const validForCategory = validSubcategories[this.category] || [];
        return validForCategory.includes(value);
      },
      message: props => `${props.value} is not a valid subcategory for ${this.category}`
    }
  },

  // Tags & Vendor
  tags: [{
    type: String,
    trim: true
  }],

  vendor: {
    type: String,
    trim: true
  },

  // Product Badges
  featured: {
    type: Boolean,
    default: false
  },

  isTrending: {
    type: Boolean,
    default: false
  },

  isFlashSale: {
    type: Boolean,
    default: false
  },

  isJustArrived: {
    type: Boolean,
    default: false
  },

  flashSaleEndDate: {
    type: Date
  },

  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    altText: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    publicId: String
  }],

  thumbnail: String,

  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'out_of_stock'],
    default: 'draft'
  },

  visible: {
    type: Boolean,
    default: true
  },

  // SEO
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title should not exceed 60 characters']
  },

  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description should not exceed 160 characters']
  },

  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },

  // Shipping Fields
  requiresShipping: {
    type: Boolean,
    default: true
  },

  weight: {
    type: Number,
    min: 0,
    default: 0
  },

  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz'],
    default: 'kg'
  },

  dimensions: {
    length: { type: Number, default: 0, min: 0 },
    width: { type: Number, default: 0, min: 0 },
    height: { type: Number, default: 0, min: 0 },
    unit: {
      type: String,
      enum: ['cm', 'm', 'in'],
      default: 'cm'
    }
  },

  freeShipping: {
    type: Boolean,
    default: false
  },

  flatShippingRate: {
    type: Number,
    min: 0
  },

  estimatedDeliveryMin: {
    type: Number,
    min: 1
  },

  estimatedDeliveryMax: {
    type: Number,
    min: 1
  },

  // Notes
  notes: {
    type: String,
    trim: true
  },

  // Ratings & Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  reviewsCount: {
    type: Number,
    default: 0
  },

  // Sales tracking
  totalSold: {
    type: Number,
    default: 0
  },

  totalRevenue: {
    type: Number,
    default: 0
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

productSchema.virtual('inStock').get(function() {
  if (!this.trackQuantity) return true;
  if (this.allowOutOfStockPurchase) return true;
  return this.quantity > 0;
});

productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || null);
});

productSchema.virtual('isOnSale').get(function() {
  return this.discountPercentage > 0;
});

productSchema.virtual('hasActiveFlashSale').get(function() {
  if (!this.isFlashSale) return false;
  if (!this.flashSaleEndDate) return true;
  return new Date() < new Date(this.flashSaleEndDate);
});

// ✅ ADDED: Frontend-friendly virtuals
productSchema.virtual('isFeatured').get(function() {
  return this.featured;
});

productSchema.virtual('stock').get(function() {
  return this.quantity;
});

productSchema.virtual('image').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || this.thumbnail || null);
});

productSchema.virtual('hasImages').get(function() {
  return this.images && this.images.length > 0;
});

productSchema.virtual('imageUrls').get(function() {
  return this.images ? this.images.map(img => img.url) : [];
});

// Pre-save hooks
productSchema.pre('save', function(next) {
  if (this.trackQuantity) {
    if (this.quantity === 0 && !this.allowOutOfStockPurchase) {
      this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock' && this.quantity > 0) {
      this.status = 'active';
    }
  }
  next();
});

productSchema.pre('save', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  next();
});

productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryCount = this.images.filter(img => img.isPrimary).length;
    if (primaryCount > 1) {
      this.images.forEach(img => img.isPrimary = false);
      this.images[0].isPrimary = true;
    } else if (primaryCount === 0 && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ status: 1 });
productSchema.index({ visible: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ isFlashSale: 1 });
productSchema.index({ isJustArrived: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ sku: 1 });
productSchema.index({ slug: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;