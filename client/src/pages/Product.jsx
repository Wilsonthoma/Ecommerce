import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
// ... icon imports remain the same ...

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        
        if (response.data.success) {
          setProduct(response.data.product);
          setRelatedProducts(response.data.relatedProducts || []);
          
          // Set default selections
          if (response.data.product.colors?.length > 0) {
            setSelectedColor(response.data.product.colors[0]);
          }
          if (response.data.product.sizes?.length > 0) {
            setSelectedSize(response.data.product.sizes[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fallback to mock data if API fails
        const mockProduct = {
          _id: id,
          name: "Premium Wireless Headphones",
          description: "Experience crystal-clear sound with our premium wireless headphones.",
          longDescription: "These premium wireless headphones deliver exceptional audio quality with advanced noise cancellation technology.",
          price: 199.99,
          discountPrice: 149.99,
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop",
          ],
          category: "Electronics",
          subCategory: "Audio",
          brand: "AudioTech",
          stock: 25,
          rating: 4.5,
          reviews: 128,
          sku: "ATH-M50X-BT",
          colors: ["Black", "Silver"],
          sizes: ["Standard"],
          features: [
            "Active Noise Cancellation",
            "30-hour Battery Life",
            "Memory Foam Ear Cushions"
          ],
          specifications: {
            "Driver Diameter": "40mm",
            "Frequency Response": "20Hz - 20kHz",
            "Weight": "265g"
          },
          slug: "premium-wireless-headphones"
        };
        
        setProduct(mockProduct);
        setSelectedColor(mockProduct.colors[0]);
        setSelectedSize(mockProduct.sizes[0]);
        
        // Mock related products
        const mockRelated = [
          { _id: '2', name: "Bluetooth Earbuds", price: 89.99, discountPrice: 79.99, image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e4?w=400&h=400&fit=crop", category: "Electronics", stock: 15, rating: 4.3, slug: "bluetooth-earbuds" },
          { _id: '3', name: "Wired Gaming Headset", price: 129.99, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop", category: "Gaming", stock: 8, rating: 4.7, slug: "wired-gaming-headset" },
        ];
        
        setRelatedProducts(mockRelated);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  // Handle quantity changes
  const handleQuantityChange = (change) => {
    if (!product) return;
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + change));
    setQuantity(newQuantity);
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      const cartQuantity = getItemQuantity(product._id, selectedSize, selectedColor);
      const newTotalQuantity = cartQuantity + quantity;
      
      if (newTotalQuantity > product.stock) {
        alert(`Only ${product.stock} items available in stock. You already have ${cartQuantity} in your cart.`);
        return;
      }
      
      await addToCart(product, quantity, selectedSize, selectedColor);
      // Reset quantity after adding
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy now function
  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  // Format KES price
  const formatKES = (price) => {
    if (!price) return "KSh 0";
    return `KSh ${Math.round(price * 120).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Product not found</h2>
          <p className="mb-4 text-gray-600">The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="font-medium text-blue-600 hover:text-blue-800">
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Calculate discount percentage
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <Link to="/shop" className="text-gray-500 hover:text-gray-700">
                Shop
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <Link to={`/shop?category=${product.category?.toLowerCase()}`} className="text-gray-500 hover:text-gray-700">
                {product.category}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li className="font-medium text-gray-900 truncate">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="p-4 mb-4 bg-white shadow-sm rounded-2xl">
              <div className="overflow-hidden aspect-square rounded-xl">
                <img
                  src={product.images[selectedImage] || product.image}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 pb-2 overflow-x-auto">
              {product.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-blue-600 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="p-8 bg-white shadow-sm rounded-2xl">
              {/* Brand */}
              <div className="mb-4">
                <span className="text-sm tracking-wider text-gray-500 uppercase">
                  {product.brand}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-700">
                    {product.rating?.toFixed(1) || '4.5'}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({product.reviews || product.reviewCount || 0} reviews)
                </span>
                <span className={`font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatKES(product.discountPrice || product.price)}
                  </span>
                  {product.discountPrice && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">
                        {formatKES(product.price)}
                      </span>
                      <span className="px-3 py-1 text-sm font-bold text-red-800 bg-red-100 rounded-full">
                        Save {discountPercentage}%
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  SKU: {product.sku || 'N/A'}
                </p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Description</h3>
                <p className="leading-relaxed text-gray-600">
                  {product.longDescription || product.description}
                </p>
              </div>

              {/* Features */}
              {product.features?.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Key Features</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedColor === color
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-6 h-6 border rounded-full"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        <span className="font-medium">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                          selectedSize === size
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-6">
                {/* Quantity */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-16 px-6 py-3 text-lg font-medium text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-3 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.stock} available
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex items-center justify-center flex-1 gap-3 py-4 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex-1 py-4 font-semibold text-white transition-colors bg-gray-900 rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                  <button className="p-4 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Heart className="w-6 h-6 text-gray-600" />
                  </button>
                  <button className="p-4 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Share2 className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-500">Over KSh 6,000</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-gray-900">30-Day Returns</p>
                  <p className="text-xs text-gray-500">Easy returns</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-gray-900">2-Year Warranty</p>
                  <p className="text-xs text-gray-500">Quality guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12 bg-white shadow-sm rounded-2xl">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button className="px-8 py-4 font-medium text-blue-600 border-b-2 border-blue-600">
                Specifications
              </button>
              <button className="px-8 py-4 font-medium text-gray-500 hover:text-gray-700">
                Reviews ({product.reviews || 0})
              </button>
              <button className="px-8 py-4 font-medium text-gray-500 hover:text-gray-700">
                Shipping & Returns
              </button>
            </nav>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 gap-8">
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="pb-4 border-b border-gray-100">
                  <dt className="text-sm text-gray-500">{key}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;