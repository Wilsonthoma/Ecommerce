import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

const EmptyState = ({ message, icon, children }) => {
  if (React.isValidElement(message)) return message;

  return (
    <div className="py-12 text-center bg-gray-800 border border-gray-700 rounded-xl">
      {icon || (
        <div className="mb-4 text-gray-600">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      )}
      <h3 className="mb-1 text-lg font-medium text-white">No data available</h3>
      <div className="text-gray-400">{message}</div>
      {children}
    </div>
  );
};

const DataTable = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  selectedRowId,
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  selectable = false,
  onSelect,
  selectedRows = [],
  actions,
}) => {
  const handleRowClick = (row) => {
    if (onRowClick) onRowClick(row);
  };

  const handleSelectAll = (e) => {
    if (onSelect) {
      if (e.target.checked) onSelect(data.map(row => row.id || row._id));
      else onSelect([]);
    }
  };

  const handleSelectRow = (rowId) => {
    if (onSelect) {
      if (selectedRows.includes(rowId)) onSelect(selectedRows.filter(id => id !== rowId));
      else onSelect([...selectedRows, rowId]);
    }
  };

  const renderCell = (row, column) => {
    const value = row[column.key];
    if (column.render) return column.render(value, row);
    if (column.format) return column.format(value);
    return value || '-';
  };

  if (loading) {
    return (
      <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="medium" text="Loading data..." />
        </div>
      </div>
    );
  }

  if (!loading && (!data || data.length === 0)) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              {selectable && (
                <th className="w-12 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">
                  <input
                    type="checkbox"
                    className="text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${column.className || ''}`}
                  style={column.style || {}}
                >
                  {column.title}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {data.map((row, index) => (
              <tr
                key={row.id || row._id || index}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-700' : ''}
                  ${selectedRowId === (row.id || row._id) ? 'bg-yellow-600/10' : ''}
                  transition-colors
                `}
                onClick={() => handleRowClick(row)}
              >
                {selectable && (
                  <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                      checked={selectedRows.includes(row.id || row._id)}
                      onChange={() => handleSelectRow(row.id || row._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${column.cellClassName || 'text-gray-300'}`}
                    style={column.cellStyle || {}}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700 sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-medium text-white">{totalItems}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-400">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange && onItemsPerPageChange(Number(e.target.value))}
                  className="block w-full py-1 pl-3 pr-10 text-sm text-white bg-gray-700 border-gray-600 rounded-lg focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => onPageChange && onPageChange(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400 bg-gray-700 border border-gray-600 rounded-l-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDoubleLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onPageChange && onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => onPageChange && onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onPageChange && onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-400 bg-gray-700 border border-gray-600 rounded-r-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDoubleRightIcon className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;