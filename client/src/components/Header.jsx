import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets.js"; // Update path if necessary
import { AppContext } from "../context/AppContext.jsx"; // Update path if necessary
import { motion } from "framer-motion";
import { FiArrowRight, FiShoppingBag, FiGift, FiPercent, FiStar } from "react-icons/fi";
import { BsStars } from "react-icons/bs";

const Header = () => {
  const { userData: user } = useContext(AppContext);
  const [currentDeal, setCurrentDeal] = useState(0);

  const deals = [
    "🎁 Free Shipping on Orders Over $50",
    "🔥 Flash Sale: Up to 60% Off Electronics",
    "⭐ New User Deal: Get 20% Off First Purchase",
    "🚚 Same-Day Delivery Available"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDeal(prev => (prev + 1) % deals.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleExplore = () => {
    // Scrolls to the element with class 'product-section'
    const productsSection = document.querySelector('.product-section'); 
    if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { value: "10K+", label: "Happy Customers", icon: <FiStar /> },
    { value: "500+", label: "Quality Products", icon: <FiShoppingBag /> },
    { value: "24/7", label: "Support", icon: <FiGift /> },
    { value: "50%", label: "Discount", icon: <FiPercent /> }
  ];

  return (
    // Note: Removed pt-24/pt-28 padding to let the Navbar sit right at the top
    <section className="relative overflow-hidden px-4 py-16 md:py-20 text-gray-800">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left"
        >
          {/* Deal Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full text-white shadow-lg">
              <BsStars className="animate-pulse" />
              <motion.div
                key={currentDeal}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="font-medium"
              >
                {deals[currentDeal]}
              </motion.div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6"
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600">
              Hello, {user ? user.name.split(' ')[0] : "Guest"}!
            </span>
            <span className="block mt-2 text-3xl md:text-4xl lg:text-5xl text-gray-700">
              Ready to <span className="relative inline-block">
                <span className="relative z-10">Discover</span>
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-400/30 to-emerald-400/30 -rotate-1" />
              </span> Something New?
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600 mb-8 lg:mb-10 max-w-2xl"
          >
            Explore curated collections, exclusive deals, and personalized recommendations tailored for you.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 lg:mb-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${
                    index === 0 ? 'from-blue-500 to-cyan-500' :
                    index === 1 ? 'from-purple-500 to-pink-500' :
                    index === 2 ? 'from-emerald-500 to-green-500' :
                    'from-orange-500 to-red-500'
                  } text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={handleExplore}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-medium text-lg"
            >
              <span>Start Shopping</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => window.location.href = '/deals'}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-medium text-lg"
            >
              <FiGift className="group-hover:scale-110 transition-transform" />
              <span>View Deals</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Right Hero Image */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-1 relative"
        >
          <div className="relative">
            <img src={assets.header_img} alt="Shopping Experience" className="relative w-full max-w-lg mx-auto rounded-3xl shadow-2xl border-8 border-white" />
            {/* Floating Cards */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-6 -left-6 md:-top-10 md:-left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-lg">
                  <FiStar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">4.8/5</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Header;