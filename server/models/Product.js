import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
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

  sku: {
    type: String,
    unique: true,
    sparse: true
  },

  barcode: String,

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
    default: 10
  },

  allowOutOfStockPurchase: {
    type: Boolean,
    default: false
  },

  weight: Number,

  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz'],
    default: 'kg'
  },

  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'm', 'in'],
      default: 'cm'
    }
  },

  hasVariants: {
    type: Boolean,
    default: false
  },

  variants: [{
    name: String,
    price: Number,
    sku: String,
    quantity: Number,
    image: String
  }],

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'electronics', 'clothing', 'jewelry',
      'food', 'footwear', 'fabric',
      'home', 'beauty', 'other'
    ]
  },

  subcategory: String,

  tags: [String],

  vendor: String,

  collectionName: String, // renamed to avoid using reserved 'collection'

  images: [{
    url: String,
    altText: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  thumbnail: String,

  seoTitle: String,
  seoDescription: String,

  slug: {
    type: String,
    unique: true,
    sparse: true
  },

  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'out_of_stock'],
    default: 'draft'
  },

  visible: {
    type: Boolean,
    default: true
  },

  featured: {
    type: Boolean,
    default: false
  },

  totalSold: {
    type: Number,
    default: 0
  },

  totalRevenue: {
    type: Number,
    default: 0
  },

  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },

  notes: String,

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
  return !this.trackQuantity || this.quantity > 0;
});

productSchema.virtual('lowStock').get(function() {
  return this.trackQuantity && this.quantity <= this.lowStockThreshold && this.quantity > 0;
});

productSchema.virtual('outOfStock').get(function() {
  return this.trackQuantity && this.quantity === 0;
});

productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || null);
});

// Pre-save hooks
productSchema.pre('save', function(next) {
  if (this.trackQuantity) {
    if (this.quantity === 0) {
      this.status = 'out_of_stock';
    } else {
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

// Indexes (no duplicates)
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ status: 1 });
productSchema.index({ visible: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ totalSold: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
