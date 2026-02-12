// OrderList.jsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { orderService } from '../../services/orders';
import DataTable from '../../components/common/DataTable';
import SearchBar from '../../components/common/SearchBar';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS, ORDER_STATUS_COLORS } from '../../utils/constants';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Fetch orders with filters
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      // Add filters if provided
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await orderService.getAll(params);
      
      if (response.success) {
        // Handle different response structures
        const ordersData = response.data?.orders || response.orders || response.data || [];
        setOrders(ordersData);
        
        // Update pagination
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total,
            pages: response.pagination.pages || 1
          }));
        } else if (response.total) {
          // Fallback if pagination object not present
          setPagination(prev => ({
            ...prev,
            total: response.total,
            pages: Math.ceil(response.total / pagination.limit)
          }));
        }
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await orderService.getStatistics();
      if (response.success) {
        setStats({
          total: response.data?.total || response.total || 0,
          pending: response.data?.pending || 0,
          processing: response.data?.processing || 0,
          delivered: response.data?.delivered || 0
        });
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [pagination.page, pagination.limit, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
      fetchOrders();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateStatus(orderId, newStatus);
      if (response.success) {
        toast.success('Order status updated');
        fetchOrders(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const formatOrderNumber = (id) => {
    if (!id) return 'N/A';
    // Extract last 8 characters for display
    const shortId = id.length > 8 ? id.slice(-8) : id;
    return `ORD-${shortId.toUpperCase()}`;
  };

  const getStatusBadge = (status) => {
    const statusText = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        ORDER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {statusText}
      </span>
    );
  };

  const columns = [
    {
      key: 'orderNumber',
      title: 'Order ID',
      render: (_, order) => formatOrderNumber(order._id || order.orderNumber)
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (_, order) => (
        <div>
          <div className="font-medium text-gray-900">
            {order.customer?.name || order.customerName || 'Guest Customer'}
          </div>
          <div className="text-sm text-gray-500">
            {order.customer?.email || order.customerEmail || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (date) => formatDate(date),
    },
    {
      key: 'total',
      title: 'Amount',
      render: (_, order) => {
        const total = order.totalAmount || order.total || 0;
        return formatCurrency(total);
      },
      className: 'text-right',
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'items',
      title: 'Items',
      render: (_, order) => (
        <span className="text-gray-600">{order.items?.length || 0} items</span>
      ),
    },
  ];

  const actions = (order) => (
    <div className="flex items-center gap-2">
      <Link
        to={`/admin/orders/${order._id}`}
        className="p-1 text-gray-400 transition-colors hover:text-gray-600"
        title="View Details"
      >
        <EyeIcon className="w-5 h-5" />
      </Link>
      {order.status === ORDER_STATUS.PENDING && (
        <button
          onClick={() => handleStatusUpdate(order._id, ORDER_STATUS.PROCESSING)}
          className="p-1 text-blue-600 transition-colors hover:text-blue-800"
          title="Mark as Processing"
        >
          <CheckCircleIcon className="w-5 h-5" />
        </button>
      )}
      {order.status === ORDER_STATUS.PROCESSING && (
        <button
          onClick={() => handleStatusUpdate(order._id, ORDER_STATUS.SHIPPED)}
          className="p-1 text-green-600 transition-colors hover:text-green-800"
          title="Mark as Shipped"
        >
          <TruckIcon className="w-5 h-5" />
        </button>
      )}
      {(order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PROCESSING) && (
        <button
          onClick={() => handleStatusUpdate(order._id, ORDER_STATUS.CANCELLED)}
          className="p-1 text-red-600 transition-colors hover:text-red-800"
          title="Cancel Order"
        >
          <XCircleIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center card">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="text-center card">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="text-center card">
          <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          <div className="text-sm text-gray-600">Processing</div>
        </div>
        <div className="text-center card">
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <SearchBar
              placeholder="Search orders by ID, customer name, or email..."
              onSearch={setSearchQuery}
              delay={500}
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
              }}
              className="input-field min-w-[140px]"
            >
              <option value="">All Status</option>
              {Object.values(ORDER_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden card">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found. Try adjusting your search filters."
          pagination={true}
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          onItemsPerPageChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
          onRowClick={(order) => window.location.href = `/admin/orders/${order._id}`}
          actions={actions}
        />
      </div>
    </div>
  );
};

export default OrderList;