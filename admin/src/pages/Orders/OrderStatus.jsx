import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import orderService from "../../services/orders.js"; // make sure default export exists

const OrderStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch order details
  const fetchOrder = async () => {
    try {
      const response = await orderService.getById(id);
      if (response.success) {
        const orderData = response.data || response;
        setOrder(orderData);
        setSelectedStatus(orderData.status);
        setTrackingNumber(orderData.trackingNumber || '');
        setNotes(orderData.notes || '');
      } else {
        throw new Error(response.message || 'Failed to fetch order');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        status: selectedStatus,
        trackingNumber: trackingNumber.trim(),
        notes: notes.trim(),
      };
      
      const response = await orderService.update(id, updateData);
      if (response.success) {
        toast.success('Order updated successfully');
        navigate(`/admin/orders/${id}`);
      } else {
        throw new Error(response.message || 'Failed to update order');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  // Quick status update
  const quickUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await orderService.updateStatus(id, newStatus);
      if (response.success) {
        toast.success('Order status updated');
        await fetchOrder();
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  // Render
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Order #{order?._id}</h1>
      {/* Form and status controls here */}
      <form onSubmit={handleSubmit}>
        <label>Status:</label>
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">Select status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <label>Tracking Number:</label>
        <input 
          type="text" 
          value={trackingNumber} 
          onChange={(e) => setTrackingNumber(e.target.value)}
        />

        <label>Notes:</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit" disabled={updating}>
          {updating ? 'Updating...' : 'Update Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderStatus;
