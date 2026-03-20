// src/components/orders/OrderFilters.jsx
import React from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';

const OrderFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  onRefresh,
  onClearFilters
}) => {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-white">Your Orders</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            className="p-1.5 text-gray-400 transition-colors rounded-lg hover:text-yellow-500 hover:bg-white/5"
            title="Refresh"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-2 py-1.5 text-[10px] text-gray-400 transition-colors rounded-lg hover:text-yellow-500 hover:bg-white/5"
          >
            <FiFilter className="w-3 h-3" />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? <FiChevronUp className="w-2.5 h-2.5" /> : <FiChevronDown className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-2">
        <FiSearch className="absolute w-3 h-3 text-gray-500 -translate-y-1/2 left-2.5 top-1/2" />
        <input
          type="text"
          placeholder="Search by order ID or product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-1.5 pl-8 pr-3 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-3 mb-3 border border-gray-700 rounded-lg stat-card animate-fadeIn">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block mb-0.5 text-[10px] text-gray-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-1.5 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block mb-0.5 text-[10px] text-gray-400">Date</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-2 py-1.5 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">7 Days</option>
                <option value="month">30 Days</option>
                <option value="3months">3 Months</option>
              </select>
            </div>

            <div>
              <label className="block mb-0.5 text-[10px] text-gray-400">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2 py-1.5 text-xs text-white border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-1 focus:ring-yellow-500/50"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                className="w-full px-3 py-1.5 text-[10px] font-medium text-gray-300 transition-colors border border-gray-700 rounded-lg hover:text-white hover:bg-white/5"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;