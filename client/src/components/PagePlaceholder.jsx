// src/components/PagePlaceholder.jsx - Updated with yellow-orange theme
import React from "react";
import { useLocation } from "react-router-dom";

const PagePlaceholder = ({ title }) => {
  const location = useLocation();
  const pageTitle = title || location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2) || "Page";

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-black">
      <div className="max-w-2xl px-4 mx-auto text-center">
        <div className="relative inline-block mb-6">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600">
            <span className="text-4xl">🚧</span>
          </div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full opacity-30 blur-xl"></div>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-white">{pageTitle}</h1>
        <p className="mb-8 text-gray-400">
          This page is currently under construction. We're working hard to bring you an amazing experience!
        </p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 text-white transition-all rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 group"
        >
          <span>Return Home</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default PagePlaceholder;