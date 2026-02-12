import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import orderService from '../../services/orders.js';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getById(id);
      if (response.success) {
        setOrder(response.data || response);
      } else {
        throw new Error(response.message || 'Failed to fetch order');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Change order status to ${newStatus}?`)) return;

    setUpdating(true);
    try {
      const response = await orderService.updateStatus(id, newStatus);
      if (response.success) {
        toast.success('Order status updated');
        await fetchOrder(); // Refresh order data
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>No order found</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Order #{order._id}</h1>
      <p>Status: {order.status}</p>
      <button
        disabled={updating}
        onClick={() => handleStatusUpdate('Shipped')}
        className="px-4 py-2 text-white bg-blue-600 rounded"
      >
        Mark as Shipped
      </button>
      {/* Render more order details as needed */}
    </div>
  );
};

export default OrderDetails; // ✅ Default export added
