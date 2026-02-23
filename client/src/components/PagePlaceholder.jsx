import React from "react";
import { useLocation } from "react-router-dom";

const PagePlaceholder = ({ title }) => {
  const location = useLocation();
  const pageTitle = title || location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2) || "Page";

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-black">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
            <span className="text-4xl">🚧</span>
          </div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full opacity-30 blur-xl"></div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{pageTitle}</h1>
        <p className="text-gray-400 mb-8">
          This page is currently under construction. We're working hard to bring you an amazing experience!
        </p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all group"
        >
          <span>Return Home</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default PagePlaceholder;
