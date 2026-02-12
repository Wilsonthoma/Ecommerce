// src/pages/OrderConfirmation.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientOrderService } from '../services/client/orders';
import { toast } from 'react-hot-toast';
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiCreditCard,
  FiPrinter,
  FiDownload,
  FiMail,
  FiPhone,
  FiUser,
  FiShoppingBag,
  FiArrowLeft,
  FiClock,
  FiShield
} from 'react-icons/fi';
import { TbTruckDelivery } from 'react-icons/tb';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await clientOrderService.getOrder(orderId);
      if (response.success) {
        setOrder(response.order);
      } else {
        toast.error('Order not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (shippingInfo) => {
    if (!shippingInfo) return '';
    return `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`;
  };

  const getOrderStatus = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  };

  const getShippingTime = (shippingMethod) => {
    switch (shippingMethod) {
      case 'next_day': return '1 business day';
      case 'express': return '2-3 business days';
      case 'standard': return '5-7 business days';
      default: return '5-7 business days';
    }
  };

  const handlePrintReceipt = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice download started');
    // In a real app, you would generate and download a PDF
    // const pdfUrl = await generateInvoicePDF(order);
    // window.open(pdfUrl, '_blank');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleTrackOrder = () => {
    // Navigate to tracking page or open tracking modal
    toast.success('Tracking information will be sent to your email');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-500">❌</div>
          <h2 className="mb-2 text-2xl font-bold">Order Not Found</h2>
          <p className="mb-6 text-gray-600">The order you're looking for doesn't exist.</p>
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FiHome className="mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatus(order.status);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-blue-50 to-white print:bg-white print:p-0">
      <div className="max-w-4xl px-4 mx-auto print:max-w-none">
        {/* Header */}
        <div className="mb-8 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-6 text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Confirmation</h1>
              <p className="mt-2 text-gray-600">Thank you for your purchase!</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="p-6 mb-8 text-center border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl print:border print:rounded-lg">
          <div className="flex flex-col items-center">
            <FiCheckCircle className="mb-4 text-6xl text-green-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Order Confirmed!</h2>
            <p className="max-w-lg mb-4 text-gray-700">
              Your order <span className="font-bold">#{order.orderNumber || order._id}</span> has been received and is being processed.
              A confirmation email has been sent to <span className="font-semibold">{order.shippingInfo?.email}</span>.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button
                onClick={handlePrintReceipt}
                disabled={printing}
                className="flex items-center gap-2 px-5 py-2 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiPrinter />
                {printing ? 'Printing...' : 'Print Receipt'}
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-5 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <FiDownload />
                Download Invoice
              </button>
              <button
                onClick={handleTrackOrder}
                className="flex items-center gap-2 px-5 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                <TbTruckDelivery className="text-lg" />
                Track Order
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 print:grid-cols-3">
          {/* Left Column - Order Details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Order Items */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl print:shadow-none print:border">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold">
                <FiShoppingBag />
                Order Items
              </h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={item._id || index} className="flex items-center pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full rounded-lg" />
                      ) : (
                        <FiPackage className="text-2xl text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 ml-4">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="mt-1 text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-600">Variant: {item.variant}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl print:shadow-none print:border">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold">
                <FiTruck />
                Shipping & Delivery
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="flex items-center gap-2 mb-3 font-semibold">
                    <FiMapPin />
                    Shipping Address
                  </h4>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="font-medium">{order.shippingInfo?.firstName} {order.shippingInfo?.lastName}</p>
                    <p className="text-gray-700">{order.shippingInfo?.address}</p>
                    <p className="text-gray-700">
                      {order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}
                    </p>
                    <p className="text-gray-700">{order.shippingInfo?.country}</p>
                    <div className="pt-3 mt-3 border-t">
                      <p className="flex items-center gap-2 text-sm">
                        <FiMail className="text-gray-400" />
                        {order.shippingInfo?.email}
                      </p>
                      <p className="flex items-center gap-2 mt-1 text-sm">
                        <FiPhone className="text-gray-400" />
                        {order.shippingInfo?.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 mb-3 font-semibold">
                    <FiClock />
                    Delivery Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Estimated Delivery</span>
                        <span className="font-bold text-blue-700">
                          {getShippingTime(order.shippingMethod)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        You will receive tracking information once your order ships.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <div className="flex items-center gap-2 mb-1">
                        <FiShield className="text-green-600" />
                        <span className="font-medium">Delivery Protection</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your order is protected by our delivery guarantee.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl print:shadow-none print:border">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold">
                <FiDollarSign />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${order.shippingCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${order.tax?.toFixed(2)}</span>
                </div>
                <div className="pt-3 mt-3 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="p-6 bg-white border shadow-sm rounded-2xl print:shadow-none print:border">
              <h3 className="flex items-center gap-2 mb-6 text-xl font-bold">
                <FiCalendar />
                Order Information
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Order Number</div>
                  <div className="font-mono text-lg font-bold">{order.orderNumber || order._id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Order Date</div>
                  <div className="font-medium">{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="flex items-center gap-2 font-medium">
                    <FiCreditCard />
                    {order.paymentMethod === 'credit_card' && 'Credit Card'}
                    {order.paymentMethod === 'paypal' && 'PayPal'}
                    {order.paymentMethod === 'apple_pay' && 'Apple Pay'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payment Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="font-medium capitalize">{order.paymentStatus || 'pending'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-6 border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl print:hidden">
              <h3 className="mb-4 text-lg font-bold">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-white rounded-full">
                    <FiMail className="text-sm text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Confirmation Email</div>
                    <div className="text-sm text-gray-600">Check your inbox for order details</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-white rounded-full">
                    <FiTruck className="text-sm text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Shipping Updates</div>
                    <div className="text-sm text-gray-600">Track your order in real-time</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 mt-1 bg-white rounded-full">
                    <FiUser className="text-sm text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Need Help?</div>
                    <div className="text-sm text-gray-600">
                      Contact support at{' '}
                      <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                        support@example.com
                      </a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-4 mt-12 sm:flex-row print:hidden">
          <button
            onClick={handleContinueShopping}
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FiShoppingBag />
            Continue Shopping
          </button>
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiPackage />
            View All Orders
          </Link>
          <a
            href="/contact"
            className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-gray-800 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <FiUser />
            Contact Support
          </a>
        </div>

        {/* Print-only footer */}
        <div className="hidden pt-8 mt-12 border-t print:block">
          <div className="text-center text-gray-600">
            <p>Thank you for your business!</p>
            <p className="mt-2 text-sm">For any questions, contact support@example.com</p>
            <p className="mt-4 text-xs">Order ID: {order._id} | Printed: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white,
          .print\\:bg-white * {
            visibility: visible;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-lg {
            border-radius: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;