// src/utils/productNormalizer.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Normalizes product data from API to ensure all fields are present
 * Preserves ALL original fields including ratings
 */
export const normalizeProductData = (product) => {
  if (!product) return null;
  
  console.log('🔄 Normalizing product:', product.name || 'Unnamed', {
    originalQuantity: product.quantity,
    originalStock: product.stock,
    originalPrice: product.price,
    originalRating: product.rating,
    originalReviewsCount: product.reviewsCount
  });
  
  // CRITICAL: Preserve the original _id
  const productId = product._id || product.id;
  
  // Get stock/quantity from ANY available field
  let stockValue = 0;
  if (product.quantity !== undefined && product.quantity !== null) {
    stockValue = Number(product.quantity);
  } else if (product.stock !== undefined && product.stock !== null) {
    stockValue = Number(product.stock);
  } else if (product.inStock !== undefined) {
    stockValue = product.inStock === true ? 10 : 0;
  } else if (product.available !== undefined) {
    stockValue = product.available === true ? 10 : 0;
  } else {
    stockValue = 10;
  }
  
  // Ensure stockValue is a valid number
  if (isNaN(stockValue) || stockValue < 0) {
    stockValue = 0;
  }
  
  // Process images array
  let processedImages = [];
  if (product.images && Array.isArray(product.images)) {
    processedImages = product.images.map(img => {
      if (typeof img === 'string') {
        return img.startsWith('http') ? img : 
               img.startsWith('/uploads') ? `${API_URL}${img}` : 
               `${API_URL}/uploads/products/${img}`;
      } else if (img && typeof img === 'object' && img.url) {
        const url = img.url.startsWith('http') ? img.url :
                   img.url.startsWith('/uploads') ? `${API_URL}${img.url}` :
                   `${API_URL}/uploads/products/${img.url}`;
        return {
          ...img,
          url,
          isPrimary: img.isPrimary || false
        };
      }
      return null;
    }).filter(Boolean);
  }
  
  // Get primary image
  let primaryImage = null;
  if (product.primaryImage) {
    primaryImage = product.primaryImage.startsWith('http') ? product.primaryImage :
                  product.primaryImage.startsWith('/uploads') ? `${API_URL}${product.primaryImage}` :
                  `${API_URL}/uploads/products/${product.primaryImage}`;
  } else if (product.image) {
    primaryImage = product.image.startsWith('http') ? product.image :
                  product.image.startsWith('/uploads') ? `${API_URL}${product.image}` :
                  `${API_URL}/uploads/products/${product.image}`;
  } else if (processedImages.length > 0) {
    const primaryImg = processedImages.find(img => img.isPrimary) || processedImages[0];
    primaryImage = typeof primaryImg === 'string' ? primaryImg : primaryImg.url;
  }
  
  // Calculate discount percentage
  let discountPercentage = 0;
  if (product.comparePrice && product.comparePrice > product.price) {
    discountPercentage = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  } else if (product.discountPercentage) {
    discountPercentage = product.discountPercentage;
  }
  
  // ⭐ CRITICAL: Explicitly extract rating and reviewsCount
  const rating = product.rating !== undefined ? Number(product.rating) : 0;
  const reviewsCount = product.reviewsCount !== undefined ? Number(product.reviewsCount) : 
                      (product.reviews ? Number(product.reviews) : 0);
  
  console.log(`⭐ Rating for ${product.name}: ${rating} (${reviewsCount} reviews)`);
  
  // Build the normalized product object
  const normalized = {
    // IDs - preserve both
    _id: productId,
    id: productId,
    
    // Core fields
    name: product.name || 'Unnamed Product',
    description: product.description || '',
    category: product.category || '',
    subcategory: product.subcategory || '',
    
    // Stock/quantity fields
    quantity: stockValue,
    stock: stockValue,
    
    // Price fields
    price: Number(product.price) || 0,
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    discountPercentage,
    cost: product.cost ? Number(product.cost) : null,
    
    // Images
    images: processedImages,
    image: primaryImage,
    primaryImage,
    
    // Flags
    featured: product.featured || false,
    isTrending: product.isTrending || product.trending || false,
    isFlashSale: product.isFlashSale || product.flashSale || false,
    isJustArrived: product.isJustArrived || product.new || false,
    onSale: product.onSale || false,
    freeShipping: product.freeShipping || false,
    
    // ⭐ CRITICAL: Ratings - explicitly set these
    rating: rating,
    reviewsCount: reviewsCount,
    reviews: product.reviews || [],
    
    // Cache flag (for internal use only)
    _cached: product._cached || false,
    
    // Shipping
    weight: product.weight || 0,
    weightUnit: product.weightUnit || 'kg',
    estimatedDeliveryMin: product.estimatedDeliveryMin || 3,
    estimatedDeliveryMax: product.estimatedDeliveryMax || 7,
    requiresShipping: product.requiresShipping !== false,
    
    // Vendor
    vendor: product.vendor || null,
    vendorId: product.vendorId || product.vendor?._id || null,
    
    // Metadata
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
    slug: product.slug || productId,
    sku: product.sku || '',
    tags: product.tags || [],
    
    // Flash sale specific
    flashSaleEndDate: product.flashSaleEndDate || null,
    
    // Preserve any other fields
    ...product
  };
  
  console.log('✅ Normalized product:', normalized.name, {
    quantity: normalized.quantity,
    stock: normalized.stock,
    price: normalized.price,
    featured: normalized.featured,
    isInStock: normalized.quantity > 0,
    rating: normalized.rating,
    reviewsCount: normalized.reviewsCount,
    cached: normalized._cached
  });
  
  return normalized;
};

// Make sure to export it (this line is important!)
export default normalizeProductData;