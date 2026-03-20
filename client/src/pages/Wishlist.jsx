// src/pages/Wishlist.jsx - Using reusable components
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { clientProductService } from '../services/client/products';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner, { CardSkeleton } from '../components/ui/LoadingSpinner';
import TopBar from '../components/ui/TopBar';
import PageHeader from '../components/layout/PageHeader';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiTrash2, 
  FiArrowLeft,
  FiChevronRight,
  FiX,
  FiPackage
} from 'react-icons/fi';
import { BsArrowRight } from 'react-icons/bs';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Header image
const wishlistHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

// Normalize product data function
const normalizeProductData = (product, cached = false) => {
  if (!product) return null;
  return {
    ...product,
    _id: product._id || product.id,
    id: product.id || product._id,
    quantity: product.quantity !== undefined ? product.quantity : (product.stock !== undefined ? product.stock : 10),
    stock: product.stock !== undefined ? product.stock : (product.quantity !== undefined ? product.quantity : 10),
    price: product.price || 0,
    comparePrice: product.comparePrice || null,
    images: product.images || [],
    image: product.image || null,
    rating: product.rating || 0,
    reviewsCount: product.reviewsCount || product.reviews || 0,
    featured: product.featured || false,
    isTrending: product.isTrending || false,
    isFlashSale: product.isFlashSale || false,
    isJustArrived: product.isJustArrived || false,
    _cached: cached
  };
};

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, wishlistCount, loading: wishlistLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  // States
  const [initialLoad, setInitialLoad] = useState(true);
  const [enhancedProducts, setEnhancedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 30,
      easing: 'ease-out-cubic',
    });
  }, []);

  // Fetch enhanced product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!wishlistItems.length) {
        setEnhancedProducts([]);
        setInitialLoad(false);
        return;
      }

      setLoadingProducts(true);
      try {
        const productIds = wishlistItems.map(item => item._id || item.id).filter(Boolean);
        
        if (productIds.length === 0) {
          setEnhancedProducts(wishlistItems.map(p => normalizeProductData(p)));
          setInitialLoad(false);
          setLoadingProducts(false);
          return;
        }
        
        const response = await clientProductService.getProductsByIds?.(productIds);
        
        if (response?.success) {
          const enhancedMap = {};
          response.products.forEach(p => { enhancedMap[p.id] = p; });
          
          const merged = wishlistItems.map(item => {
            const itemId = item._id || item.id;
            const enhanced = enhancedMap[itemId];
            return normalizeProductData(enhanced || item);
          });
          setEnhancedProducts(merged);
        } else {
          setEnhancedProducts(wishlistItems.map(p => normalizeProductData(p)));
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setEnhancedProducts(wishlistItems.map(p => normalizeProductData(p)));
      } finally {
        setLoadingProducts(false);
        setInitialLoad(false);
      }
    };

    fetchProductDetails();
  }, [wishlistItems]);

  // Update select all
  useEffect(() => {
    const items = enhancedProducts.length ? enhancedProducts : wishlistItems;
    setSelectAll(selectedItems.length === items.length && items.length > 0);
  }, [selectedItems, enhancedProducts, wishlistItems]);

  const handleRemove = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(productId);
    setSelectedItems(prev => prev.filter(id => id !== productId));
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const items = enhancedProducts.length ? enhancedProducts : wishlistItems;
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : items.map(item => item._id || item.id));
  };

  const handleSelectItem = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItems(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleBulkRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }
    if (window.confirm(`Remove ${selectedItems.length} item(s) from wishlist?`)) {
      selectedItems.forEach(id => removeFromWishlist(id));
      setSelectedItems([]);
    }
  };

  const handleAddAllToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const items = enhancedProducts.length ? enhancedProducts : wishlistItems;
    if (items.length === 0) return;

    let successCount = 0;
    for (const product of items) {
      const productId = product._id || product.id;
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      const success = await addToCart(product, 1);
      if (success) successCount++;
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
    toast.success(`Added ${successCount} of ${items.length} items to cart`);
  };

  const handleClearAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Clear your entire wishlist?')) {
      clearWishlist();
      setSelectedItems([]);
    }
  };

  const displayItems = enhancedProducts.length ? enhancedProducts : wishlistItems;

  // Loading state
  if ((wishlistLoading || (loadingProducts && initialLoad)) && wishlistItems.length > 0) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="MY WISHLIST" 
          subtitle="Loading your wishlist..."
          image={wishlistHeaderImage}
        />
        <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
          <CardSkeleton count={Math.min(wishlistItems.length, 8)} />
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <PageHeader 
          title="MY WISHLIST" 
          subtitle="Your saved items will appear here"
          image={wishlistHeaderImage}
        />
        <div className="container px-3 py-10 mx-auto">
          <div className="max-w-md mx-auto text-center" data-aos="zoom-in">
            <div className="relative inline-block mb-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
                <FiHeart className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-50 blur-xl"></div>
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">Your Wishlist is Empty</h1>
            <p className="mb-5 text-xs text-gray-400">Save items you love to your wishlist and they'll appear here</p>
            <Link to="/shop" className="relative inline-flex items-center gap-1.5 px-5 py-2.5 overflow-hidden text-sm font-medium text-white transition-all rounded-full group">
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
              <span className="relative flex items-center gap-1.5">
                <FiShoppingCart className="w-4 h-4" />
                Start Shopping
                <BsArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <PageHeader 
        title="MY WISHLIST" 
        subtitle={`${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'} saved`}
        image={wishlistHeaderImage}
      />

      <div className="container px-3 py-5 mx-auto max-w-7xl sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-4 text-xs">
          <Link to="/" className="text-gray-400 transition-colors hover:text-yellow-500">Home</Link>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <Link to="/shop" className="text-gray-400 transition-colors hover:text-yellow-500">Shop</Link>
          <FiChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-medium text-white">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-bold text-white md:text-xl">My Wishlist</h1>
            <p className="text-xs text-gray-400">{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved</p>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            <button onClick={handleAddAllToCart} className="relative px-3 py-1.5 overflow-hidden text-xs font-medium text-white transition-all rounded-full group">
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600"></span>
              <span className="relative flex items-center gap-1">
                <FiShoppingCart className="w-3 h-3" />
                Add All
              </span>
            </button>
            <button onClick={handleBulkRemove} className="relative px-3 py-1.5 overflow-hidden text-xs font-medium text-white transition-all rounded-full group">
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600"></span>
              <span className="relative flex items-center gap-1">
                <FiTrash2 className="w-3 h-3" />
                Remove ({selectedItems.length})
              </span>
            </button>
            <button onClick={handleClearAll} className="px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors border border-gray-700 rounded-full hover:text-white hover:border-yellow-500/50">
              <FiX className="inline w-3 h-3 mr-0.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Select All */}
        {displayItems.length > 0 && (
          <div className="flex items-center gap-1.5 p-2 mb-3 bg-gray-900 border border-gray-700 rounded-lg">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-3.5 h-3.5 text-yellow-600 bg-gray-700 border-gray-600 rounded cursor-pointer focus:ring-yellow-500" />
            <label className="text-xs font-medium text-white cursor-pointer" onClick={handleSelectAll}>Select All ({displayItems.length} items)</label>
          </div>
        )}

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayItems.map((product, index) => {
            const productId = product._id || product.id;
            return (
              <div key={productId} className="relative group" data-aos="fade-up" data-aos-delay={index * 50}>
                <button onClick={(e) => handleRemove(productId, e)} className="absolute z-10 p-1 transition-all rounded-full shadow-lg -top-1.5 -right-1.5 bg-gray-900 border border-gray-700 hover:border-yellow-500/50" title="Remove from wishlist">
                  <FiTrash2 className="w-3 h-3 text-gray-400 transition-colors hover:text-yellow-500" />
                </button>
                <div className="absolute z-10 -top-1.5 -left-1.5">
                  <input type="checkbox" checked={selectedItems.includes(productId)} onChange={(e) => handleSelectItem(productId, e)} className="w-3.5 h-3.5 text-yellow-600 bg-gray-700 border-gray-600 rounded cursor-pointer focus:ring-yellow-500" />
                </div>
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>

        {/* Back to Shop */}
        <div className="mt-6 text-center">
          <Link to="/shop" className="inline-flex items-center gap-1 text-xs text-gray-400 transition-colors group hover:text-yellow-500">
            <FiArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
            Continue Shopping
            <BsArrowRight className="w-3 h-3 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;