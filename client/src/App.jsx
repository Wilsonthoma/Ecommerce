// src/App.jsx - NO LOADING EFFECTS
import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

// 🌐 Global Components
import ProtectedRoute from "./components/ProtectedRoute";

// 📦 Context Providers
import { AppContextProvider } from "./context/AppContext.jsx"; 
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

// 📄 Page Components
import Home from "./pages/Home";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";
import EmailVerify from "./pages/EmailVerify";
import Resetpassword from "./pages/Resetpassword";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Returns from "./pages/Returns";
import Shipping from "./pages/Shipping";
import Blog from "./pages/Blog";
import Deals from "./pages/Deals";
import HelpCenter from "./pages/HelpCenter";
import TrackOrder from "./pages/TrackOrder";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AddressBook from "./pages/AddressBook";
import PaymentMethods from "./pages/PaymentMethods";

const App = () => {
  return (
    <AppContextProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="flex flex-col min-h-screen bg-black">
            <Layout>
              <Routes>
                {/* ===== PUBLIC ROUTES ===== */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/email-verify" element={<EmailVerify />} />
                <Route path="/verify-email" element={<EmailVerify />} />
                <Route path="/reset-password" element={<Resetpassword />} />
                <Route path="/forgot-password" element={<Resetpassword />} />
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
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/checkout/:orderId?" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                <Route path="/address-book" element={<ProtectedRoute><AddressBook /></ProtectedRoute>} />
                <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
                
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
                        className="inline-block px-6 py-3 text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 hover:shadow-lg hover:shadow-yellow-500/25"
                      >
                        Go Back Home
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </Layout>
          </div>
        </WishlistProvider>
      </CartProvider>
    </AppContextProvider>
  );
};

export default App;