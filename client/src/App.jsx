// src/App.jsx - ENHANCED with improved loading spinners
import React, { Suspense, useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingSpinner, { AppPreloader, PageLoader, ContentLoader } from "./components/LoadingSpinner";

// 🌐 Global Components
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout";
import PagePlaceholder from "./components/PagePlaceholder";

// 📦 Context Providers
import { AppContextProvider } from "./context/AppContext.jsx"; 
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

// 📄 Page Components (Lazy loaded)
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const OAuthCallback = React.lazy(() => import("./pages/OAuthCallback"));
const EmailVerify = React.lazy(() => import("./pages/EmailVerify"));
const Resetpassword = React.lazy(() => import("./pages/Resetpassword"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Shop = React.lazy(() => import("./pages/Shop"));
const Product = React.lazy(() => import("./pages/Product"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const OrderConfirmation = React.lazy(() => import("./pages/OrderConfirmation"));
const Wishlist = React.lazy(() => import("./pages/Wishlist"));

// Lazy load with error handling
const lazyWithRetry = (importFn) => {
  return React.lazy(() => {
    return new Promise((resolve) => {
      importFn()
        .then(resolve)
        .catch(() => {
          console.warn('Page failed to load, using placeholder');
          resolve({ default: PagePlaceholder });
        });
    });
  });
};

// Pages that might not exist yet
const Orders = lazyWithRetry(() => import("./pages/Orders"));
const OrderDetails = lazyWithRetry(() => import("./pages/OrderDetails"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const AddressBook = lazyWithRetry(() => import("./pages/AddressBook"));
const PaymentMethods = lazyWithRetry(() => import("./pages/PaymentMethods"));
const TrackOrder = lazyWithRetry(() => import("./pages/TrackOrder"));
const Deals = lazyWithRetry(() => import("./pages/Deals"));
const HelpCenter = lazyWithRetry(() => import("./pages/HelpCenter"));
const About = lazyWithRetry(() => import("./pages/About"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Privacy = lazyWithRetry(() => import("./pages/Privacy"));
const Terms = lazyWithRetry(() => import("./pages/Terms"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const Returns = lazyWithRetry(() => import("./pages/Returns"));
const Shipping = lazyWithRetry(() => import("./pages/Shipping"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));

// App initialization state
const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate initial app loading (remove this in production if not needed)
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return <AppPreloader />;
  }

  return children;
};

// Wrapper component to use hooks that need router context
const AppContent = () => {
  useSessionTimeout();
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<Resetpassword />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        
        {/* Public Info Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/track-order/:orderId" element={<TrackOrder />} />
        
        {/* ===== PROTECTED ROUTES ===== */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/checkout/:orderId?" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/address-book" element={
          <ProtectedRoute>
            <AddressBook />
          </ProtectedRoute>
        } />
        
        <Route path="/payment-methods" element={
          <ProtectedRoute>
            <PaymentMethods />
          </ProtectedRoute>
        } />
        
        {/* 404 - Not Found */}
        <Route path="*" element={
          <div className="min-h-[60vh] flex items-center justify-center bg-black">
            <div className="text-center">
              <h1 className="mb-4 text-6xl font-bold text-white">404</h1>
              <h2 className="mb-4 text-2xl font-semibold text-gray-400">Page Not Found</h2>
              <p className="mb-8 text-gray-500">
                The page you are looking for doesn't exist or has been moved.
              </p>
              <a 
                href="/" 
                className="inline-block px-6 py-3 text-white transition-all bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full hover:from-indigo-700 hover:to-blue-700 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              >
                Go Back Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <AppContextProvider>
      <CartProvider>
        <WishlistProvider>
          <AppInitializer>
            <div className="flex flex-col min-h-screen bg-black">
              
              <Navbar />
              
              {/* ✅ ToastContainer has been removed from here */}
              
              <main className="flex-grow">
                <AppContent />
              </main>
              
              <Footer />
              
            </div>
          </AppInitializer>
        </WishlistProvider>
      </CartProvider>
    </AppContextProvider>
  );
};

export default App;