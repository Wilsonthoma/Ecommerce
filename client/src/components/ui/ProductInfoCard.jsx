// src/components/ui/ProductInfoCard.jsx
import React from 'react';
import { FiTruck, FiShield, FiRefreshCw, FiShare2, FiHeart, FiShoppingCart, FiCreditCard } from 'react-icons/fi';
import Button from './Button';
import Price from './Price';
import QuantitySelector from './QuantitySelector';
import Badge from './Badge';
import RatingStars from './RatingStars';

const ProductInfoCard = ({
  product,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  inWishlist = false,
  isAddingToCart = false,
  stockValue = 0
}) => {
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const isInStock = stockValue > 0;
  const isLowStock = stockValue > 0 && stockValue <= 10;

  return (
    <div className="space-y-4">
      {/* Category Badges */}
      <div className="flex flex-wrap gap-2">
        {product.category && (
          <Badge type="featured">{product.category}</Badge>
        )}
        {product.subcategory && (
          <Badge type="trending">{product.subcategory}</Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="product-title">{product.name}</h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <RatingStars rating={parseFloat(product.rating || 0)} size="medium" />
        <span className="text-xs text-gray-400">
          {product.rating || 0} ({product.reviewsCount || 0} reviews)
        </span>
      </div>

      {/* Price */}
      <Price 
        price={product.price} 
        comparePrice={product.comparePrice} 
        size="xl" 
        quantity={quantity}
      />

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {isInStock ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-500">
              {isLowStock ? `${stockValue} left in stock` : 'In Stock'}
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs font-medium text-red-500">Out of Stock</span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-gray-400">
        {product.description || 'No description available.'}
      </p>

      {/* Actions */}
      {isInStock && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <QuantitySelector 
            quantity={quantity} 
            setQuantity={setQuantity} 
            maxStock={stockValue}
            size="medium"
          />

          <Button
            onClick={onAddToCart}
            disabled={isAddingToCart}
            variant="primary"
            size="md"
            icon={FiShoppingCart}
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>

          <Button
            onClick={onBuyNow}
            variant="secondary"
            size="md"
            icon={FiCreditCard}
          >
            Buy Now
          </Button>

          <Button
            onClick={onWishlistToggle}
            variant={inWishlist ? "primary" : "secondary"}
            size="md"
            icon={FiHeart}
            className={inWishlist ? "btn-wishlist active" : "btn-wishlist"}
          >
            {inWishlist ? 'Remove' : 'Wishlist'}
          </Button>
        </div>
      )}

      {/* Shipping Info */}
      {product.requiresShipping !== false && (
        <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
          {product.freeShipping && <span className="text-green-500">✓ Free Shipping</span>}
          {product.weight > 0 && <span>📦 {product.weight}{product.weightUnit}</span>}
          {product.estimatedDeliveryMin && product.estimatedDeliveryMax && (
            <span>🚚 {product.estimatedDeliveryMin}-{product.estimatedDeliveryMax} days</span>
          )}
        </div>
      )}

      {/* Info Icons */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        <InfoIcon icon={FiTruck} label="Free" sublabel="Shipping" />
        <InfoIcon icon={FiShield} label="2Y" sublabel="Warranty" />
        <InfoIcon icon={FiRefreshCw} label="30D" sublabel="Returns" />
        <InfoIcon icon={FiShare2} label="24/7" sublabel="Support" />
      </div>
    </div>
  );
};

const InfoIcon = ({ icon: Icon, label, sublabel }) => (
  <div className="flex flex-col items-center p-2 info-icon">
    <Icon className="w-4 h-4 text-yellow-500" />
    <span className="text-xs text-white">{label}</span>
    <span className="text-[8px] text-gray-400">{sublabel}</span>
  </div>
);

export default ProductInfoCard;