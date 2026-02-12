// src/App.jsx
import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

// 🌐 Global Components
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";

// 📦 Context Providers
import { AppContextProvider } from "./context/AppContext.jsx"; 
import { CartProvider } from "./context/CartContext.jsx";

// 📄 Page Components (Lazy loaded for better performance)
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const EmailVerify = React.lazy(() => import("./pages/EmailVerify"));
const Resetpassword = React.lazy(() => import("./pages/Resetpassword"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Shop = React.lazy(() => import("./pages/Shop"));
const Product = React.lazy(() => import("./pages/Product"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const OrderConfirmation = React.lazy(() => import("./pages/OrderConfirmation"));

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <AppContextProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          
          {/* The Navbar is rendered here, making it visible on ALL routes. */}
          <Navbar />
          
          {/* Toast Containers for global notifications */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          
          {/* React Hot Toast Container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
              error: {
                duration: 4000,
              },
            }}
          />
          
          <main className="flex-grow">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                
                {/* Public Routes */}
                <Route path="/" element={<Home />} /> 
                <Route path="/login" element={<Login />} />
                <Route path="/email-verify" element={<EmailVerify />} />
                <Route path="/reset-password" element={<Resetpassword />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                
                {/* Dashboard route - temporarily public */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/cart" element={<Cart />} />
                
                {/* Checkout route - temporarily public */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/:orderId?" element={<Checkout />} />
                
                {/* User routes - temporarily public */}
                <Route path="/orders" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">My Orders</h1>
                    <p className="text-gray-600">Orders page is under construction</p>
                  </div>
                } />
                
                <Route path="/profile" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">My Profile</h1>
                    <p className="text-gray-600">Profile page is under construction</p>
                  </div>
                } />
                
                <Route path="/wishlist" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">My Wishlist</h1>
                    <p className="text-gray-600">Wishlist page is under construction</p>
                  </div>
                } />
                
                <Route path="/settings" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Account Settings</h1>
                    <p className="text-gray-600">Settings page is under construction</p>
                  </div>
                } />
                
                <Route path="/track-order/:orderId" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Track Order</h1>
                    <p className="text-gray-600">Order tracking page is under construction</p>
                  </div>
                } />
                
                <Route path="/track-order" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Track Order</h1>
                    <p className="text-gray-600">Enter your order number to track</p>
                    <input 
                      type="text" 
                      placeholder="Order Number" 
                      className="w-full max-w-md p-3 mt-4 border border-gray-300 rounded-lg"
                    />
                  </div>
                } />
                
                {/* Other public routes */}
                <Route path="/about" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">About Us</h1>
                    <p className="text-gray-600">About page is under construction</p>
                  </div>
                } />
                
                <Route path="/contact" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Contact Us</h1>
                    <p className="text-gray-600">Contact page is under construction</p>
                  </div>
                } />
                
                <Route path="/privacy" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
                    <p className="text-gray-600">Privacy policy page is under construction</p>
                  </div>
                } />
                
                <Route path="/terms" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Terms of Service</h1>
                    <p className="text-gray-600">Terms of service page is under construction</p>
                  </div>
                } />
                
                <Route path="/faq" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Frequently Asked Questions</h1>
                    <p className="text-gray-600">FAQ page is under construction</p>
                  </div>
                } />
                
                <Route path="/returns" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Return & Refund Policy</h1>
                    <p className="text-gray-600">Return policy page is under construction</p>
                  </div>
                } />
                
                <Route path="/shipping" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Shipping Information</h1>
                    <p className="text-gray-600">Shipping info page is under construction</p>
                  </div>
                } />
                
                <Route path="/help" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Help Center</h1>
                    <p className="text-gray-600">Help center page is under construction</p>
                  </div>
                } />
                
                <Route path="/blog" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Blog</h1>
                    <p className="text-gray-600">Blog page is under construction</p>
                  </div>
                } />
                
                <Route path="/deals" element={
                  <div className="container px-4 py-8 mx-auto">
                    <h1 className="mb-6 text-3xl font-bold">Hot Deals</h1>
                    <p className="text-gray-600">Deals page is under construction</p>
                  </div>
                } />
                
                {/* Catch-all for 404/Not Found pages */}
                <Route path="*" element={
                  <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>
                      <h2 className="mb-4 text-2xl font-semibold text-gray-600">Page Not Found</h2>
                      <p className="mb-8 text-gray-500">
                        The page you are looking for doesn't exist or has been moved.
                      </p>
                      <a 
                        href="/" 
                        className="inline-block px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Go Back Home
                      </a>
                    </div>
                  </div>
                } />
                
              </Routes>
            </Suspense>
          </main>
          
          {/* The Footer is rendered globally at the bottom */}
          <Footer />
          
        </div>
      </CartProvider>
    </AppContextProvider>
  );
};

export default App;