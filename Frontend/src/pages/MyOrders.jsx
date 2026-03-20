import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OrderTracking from '../components/common/OrderTracking';
import orderService from '../services/order.service';
import { getProfile, isAuthenticated } from '../services/auth.service';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrders, setTrackingOrders] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchUserAndOrders();
  }, [navigate, refreshKey]);

  const fetchUserAndOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Get user profile first
      const userData = await getProfile();
      setUserId(userData._id);
      
      // Then fetch orders for this user
      const result = await orderService.getUserOrders(userData._id);
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.error || 'Failed to load orders');
      }
    } catch (err) {
      console.error('MyOrders fetch error:', err);
      const errorMsg = err.response?.status === 401 ? 'Please login again' : (err.response?.data?.message || 'Failed to load orders');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
}, [orderService, getProfile]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-black font-bold tracking-widest uppercase"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-8 md:py-12 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.06)] overflow-hidden border border-gray-100">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="bg-black p-4 sm:p-6 md:p-8 text-center relative">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-widest uppercase">
                My Orders
              </h1>
            </div>
            <p className="text-gray-400 text-[10px] sm:text-xs tracking-wide uppercase font-medium">
              View and track your orders
            </p>
          </motion.div>

          {/* Content */}
          <motion.div variants={itemVariants} className="p-4 sm:p-6 md:p-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mb-4 text-xs sm:text-sm font-medium text-white bg-red-600 p-3 sm:p-4 rounded-lg text-center flex items-center justify-center gap-2"
              >
                <button
                  onClick={fetchUserAndOrders}
                  className="text-white hover:text-gray-200 underline text-xs"
                >
                  Retry
                </button>
                {error}
              </motion.div>
            )}

            <motion.button
              onClick={fetchUserAndOrders}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m0 0A1.586 1.586 0 0 1 6 6.583V4m0 0h6M6 4h6v5h.582m0 0a1.586 1.586 0 0 1 1.582 1.582V10m-1.582 0H13" />
              </svg>
              Refresh Orders
            </motion.button>

            {orders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 text-sm mb-6">You haven't placed any orders yet.</p>
                <motion.button
                  onClick={() => navigate('/products')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block bg-black text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors cursor-pointer"
                >
                  Start Shopping
                </motion.button>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    className={`rounded-2xl p-6 border-2 border-gray-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-gray-300/70 backdrop-blur-sm ${order.status?.toUpperCase() === 'CANCELLED' ? 'opacity-60 bg-gradient-to-br from-gray-50/80 to-gray-100/60 shadow-gray-200/50' : 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 shadow-lg hover:shadow-xl hover:-translate-y-1'}`}
                  >
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 sm:p-6 border-b-2 border-gray-200 flex flex-wrap items-center justify-between gap-4 shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold tracking-wider text-gray-500 uppercase">
                            Order # {order.orderNumber || order._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex justify-between items-end gap-3 sm:gap-4">
                        {/* Date */}
                        <div className="text-left">
                          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                            Date
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        
                        {/* Status */}
                        <div className="text-right min-w-[80px]">
                          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">
                            Status
                          </p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide shadow-sm ${
                            order.status?.toUpperCase() === 'DELIVERED' ? 'bg-green-100 text-green-800 border border-green-200' :
                            order.status?.toUpperCase() === 'SHIPPED' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            order.status?.toUpperCase() === 'PLACED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            order.status?.toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {order.status?.toUpperCase() || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                          Total
                        </p>
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          ₹{order.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-3 sm:p-4">
                      <div className={`flex flex-wrap items-center ${order.status?.toUpperCase() === 'CANCELLED' ? 'gap-3 border-dashed border-2 border-gray-400 rounded-2xl p-4 bg-gray-50/50' : 'gap-2 sm:gap-4'}`}>
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-2 sm:gap-3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                              {item.productId?.images?.[0]?.url ? (
                                <img src={item.productId.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
                                {item.title || item.productId?.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="ml-auto">
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">
                              +{order.items.length - 3} more items
                            </span>
                          </div>
                        )}
                      </div>

                      {order.status?.toUpperCase() === 'PLACED' && (
                        <motion.button
                          onClick={async () => {
                            const result = await orderService.cancelOrder(order._id, 'Cancelled from MyOrders page');
                            if (result.success) {
                              setRefreshKey(prev => prev + 1);
                            } else {
                              setError(result.error || 'Failed to cancel order');
                            }
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mb-2 bg-red-500 hover:bg-red-600 text-white font-bold tracking-widest uppercase text-xs py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Cancel Order
                        </motion.button>
                      )}
                      {order.status?.toUpperCase() !== 'CANCELLED' ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (order.status?.toUpperCase() === 'CANCELLED') return;
                            setTrackingOrders(prev => ({
                              ...prev,
                              [order._id]: !prev[order._id]
                            }));
                            // Scroll to tracking animation
                            const trackingElement = document.getElementById(`tracking-${order._id}`);
                            if (trackingElement) {
                              trackingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className="w-full mt-6 mb-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold tracking-widest uppercase text-sm py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {trackingOrders[order._id] ? 'Hide Tracking' : 'Track Order'}
                        </motion.button>
                      ) : null // No separate cancelled tag - only status column shows CANCELLED

                          <AnimatePresence>
                        {trackingOrders[order._id] && order.status?.toUpperCase() !== 'CANCELLED' && (
                          <>
                              <motion.div
                                id={`tracking-${order._id}`}
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="flex justify-center mb-6 mx-auto max-w-md"
                              >
                                <OrderTracking status={order.status} size="md" />
                              </motion.div>

                            {/* No seen status badge - removed per feedback */}
                          </>
                        )}
                      </AnimatePresence>
                      
                      {/* View Details Button */}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                        className="w-full mt-3 sm:mt-4 bg-black text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {selectedOrder?._id === order._id ? 'Hide Details' : 'View Details'}
                        <svg className={`w-4 h-4 transition-transform ${selectedOrder?._id === order._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.button>

                      {/* Order Details */}
                      <AnimatePresence>
                        {selectedOrder?._id === order._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Order Details</h4>
                              
                              {/* Shipping Address */}
                              {order.shippingAddressId && (
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                                  <p className="text-sm text-gray-900">{order.shippingAddressId.name || 'N/A'}</p>
                                  <p className="text-sm text-gray-600">{order.shippingAddressId.phone || 'N/A'}</p>
                                  <p className="text-sm text-gray-600">{order.shippingAddressId.line1 || 'N/A'}</p>
                                  <p className="text-sm text-gray-600">{order.shippingAddressId.city}, {order.shippingAddressId.state} {order.shippingAddressId.postalCode}</p>
                                </div>
                              )}

                              {/* Items List */}
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items</p>
                                {order.items?.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                        {item.productId?.images?.[0]?.url ? (
                                          <img src={item.productId.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{item.title || item.productId?.title}</p>
                                        <p className="text-xs text-gray-500">₹{item.price} x {item.quantity}</p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Order Summary */}
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Summary</p>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Subtotal</span>
                                  <span className="text-gray-900">₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Tax</span>
                                  <span className="text-gray-900">₹{order.tax?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                                  <span className="text-gray-900">Total</span>
                                  <span className="text-gray-900">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                              </div>

                              {/* Payment Info */}
                              {order.payment && (
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment</p>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Provider</span>
                                    <span className="text-gray-900 uppercase">{order.payment.provider}</span>
                                  </div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Transaction ID</span>
                                    <span className="text-gray-900 font-mono text-xs">{order.payment.transactionId}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      {order.payment.status}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MyOrders;
