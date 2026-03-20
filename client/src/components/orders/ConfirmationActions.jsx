// src/components/orders/ConfirmationActions.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiUser, FiPrinter, FiDownload, FiTruck } from 'react-icons/fi';

const ConfirmationActions = ({
  orderId,
  onPrintReceipt,
  onDownloadInvoice,
  onTrackOrder,
  printing = false,
  showPrint = true,
  showDownload = true,
  showTrack = true,
  showContinueShopping = true,
  showViewOrders = true,
  showContactSupport = true
}) => {
  return (
    <>
      <div className="flex flex-wrap justify-center gap-4 mt-12 print:hidden">
        {showPrint && (
          <button
            onClick={onPrintReceipt}
            disabled={printing}
            className="flex items-center gap-2 px-8 py-3 font-semibold text-white transition-all border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700"
          >
            <FiPrinter />
            {printing ? 'Printing...' : 'Print Receipt'}
          </button>
        )}
        
        {showDownload && (
          <button
            onClick={onDownloadInvoice}
            className="flex items-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <FiDownload />
            Download Invoice
          </button>
        )}
        
        {showTrack && (
          <button
            onClick={onTrackOrder}
            className="flex items-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <FiTruck />
            Track Order
          </button>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row print:hidden">
        {showContinueShopping && (
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <FiShoppingBag />
            Continue Shopping
          </Link>
        )}
        
        {showViewOrders && (
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all border border-gray-700 rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700"
          >
            <FiPackage />
            View All Orders
          </Link>
        )}
        
        {showContactSupport && (
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg bg-gray-800/95 backdrop-blur-sm hover:bg-gray-700"
          >
            <FiUser />
            Contact Support
          </Link>
        )}
      </div>
    </>
  );
};

export default ConfirmationActions;