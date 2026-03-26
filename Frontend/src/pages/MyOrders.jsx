import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OrderTracking from "../components/common/OrderTracking";
import orderService from "../services/order.service";
import { getProfile, isAuthenticated } from "../services/auth.service";

const getFinalItemPrice = (item) => {
  const product = item.productId;
  return product?.discountPrice && product.discountPrice > 0
    ? product.discountPrice
    : item.price || product?.price || 0;
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrders, setTrackingOrders] = useState({}); // {orderId: boolean}
  const [trackingData, setTrackingData] = useState({}); // {orderId: trackingResult}
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchUserAndOrders();
  }, [navigate, refreshKey]);

  const fetchUserAndOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // Get user profile first
      const userData = await getProfile();
      if (!userData?._id) {
        throw new Error("Invalid user data");
      }
      setUserId(userData._id);

      // Then fetch orders for this user
      const result = await orderService.getUserOrders(userData._id);
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.error || "Failed to load orders");
      }
    } catch (err) {
      const errorMsg =
        err.response?.status === 401
          ? "Please login again"
          : err.response?.data?.message || "Failed to load orders";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.06)] overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="bg-black p-4 sm:p-6 md:p-8 text-center relative"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
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
                animate={{ opacity: 1, height: "auto" }}
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

            {orders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No Orders Yet
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  You haven't placed any orders yet.
                </p>
                <motion.button
                  onClick={() => navigate("/products")}
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
                    className={`rounded-2xl p-6 border-2 border-gray-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-gray-300/70 backdrop-blur-sm bg-white/80 ${order.status?.toUpperCase() === "CANCELLED" ? "opacity-60 bg-gradient-to-br from-gray-50/80 to-gray-100/60 shadow-gray-200/50" : "bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 shadow-lg hover:shadow-xl hover:-translate-y-1"}`}
                  >
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-3 sm:p-4 md:p-6 border-b-2 border-gray-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 shadow-inner">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold tracking-wider text-gray-500 uppercase break-words">
                            Order #{" "}
                            {order.orderNumber ||
                              order._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row flex-1 min-w-0 gap-2 sm:gap-3 lg:gap-4 w-full lg:w-auto">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 min-w-0">
                          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase flex-shrink-0">
                            Date
                          </p>
                          <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 break-words">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 min-w-[70px]">
                          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                            Status
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide shadow-sm ${
                              order.status?.toUpperCase() === "DELIVERED"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : order.status?.toUpperCase() === "SHIPPED"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : order.status?.toUpperCase() === "PLACED"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : order.status?.toUpperCase() ===
                                        "CANCELLED"
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {order.status?.toUpperCase() || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 mt-2 sm:mt-0">
                        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                          Total
                        </p>
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          ₹{order.items?.reduce((total, item) => total + getFinalItemPrice(item) * item.quantity, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-3 sm:p-4 md:p-5">
                      <div
                        className={`gap-3 sm:gap-4 md:gap-6 ${order.status?.toUpperCase() === "CANCELLED" ? "border-dashed border-2 border-gray-400 rounded-2xl p-3 sm:p-4 bg-gray-50/50 flex flex-col sm:flex-row flex-wrap items-start sm:items-center" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xl:gap-4 items-start sm:items-center"}`}
                      >
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 sm:gap-3 w-full"
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                              {item.productId?.images?.[0]?.url ? (
                                <img
                                  src={item.productId.images[0].url}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg
                                  className="w-6 h-6 md:w-7 md:h-7 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 break-words leading-tight line-clamp-2">
                                {item.title || item.productId?.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="flex items-center sm:ml-auto mt-2 sm:mt-0">
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">
                              +{order.items.length - 3} more items
                            </span>
                          </div>
                        )}
                      </div>

                      {order.status?.toUpperCase() === "PLACED" && (
                        <div className="w-full mt-4 pt-2 flex justify-center">
                          <motion.button
                            onClick={async () => {
                              const result = await orderService.cancelOrder(
                                order._id,
                                "Cancelled from MyOrders page",
                              );
                              if (result.success) {
                                setRefreshKey((prev) => prev + 1);
                              } else {
                                setError(
                                  result.error || "Failed to cancel order",
                                );
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-3 sm:mt-4 bg-red-500 hover:bg-red-600 text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Cancel Order
                          </motion.button>
                        </div>
                      )}
                      {order.status?.toUpperCase() !== "CANCELLED" ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                              const isVisible = trackingOrders[order._id];
                              setTrackingOrders((prev) => ({
                                ...prev,
                                [order._id]: !isVisible,
                              }));

                              // Fetch tracking if not loaded and has trackingId
                              if (!isVisible && !trackingData[order._id] && order.trackingId) {
                                setTrackingData((prev) => ({ ...prev, [order._id]: { loading: true } }));
                                const result = await orderService.getOrderTracking(order._id);
                                setTrackingData((prev) => ({ 
                                  ...prev, 
                                  [order._id]: result 
                                }));
                              }

                              const trackingElement = document.getElementById(
                                `tracking-${order._id}`,
                              );
                              if (trackingElement) {
                                trackingElement.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                              }
                            }}
                            className="w-full mt-3 sm:mt-4 bg-black text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            {trackingData[order._id]?.loading ? "Loading..." :
                              trackingOrders[order._id] ? "Hide Tracking" : "Track Order"}
                          </motion.button>

                          {(order.trackingId || order.awbCode) && (
                            <motion.a
                              href={`https://shiprocket.co/tracking/${order.trackingId || order.awbCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2 block text-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Track on Shiprocket ({order.awbCode || order.trackingId})
                            </motion.a>
                          )}
                          {order.labelPdf && (
                            <motion.a
                              href={order.labelPdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full mt-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded flex items-center justify-center gap-2"
                            >
                              📄 Download Label
                            </motion.a>
                          )}
                          {order.invoicePdf && (
                            <motion.a
                              href={order.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full mt-1 bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-2 px-4 rounded flex items-center justify-center gap-2"
                            >
                              💰 Download Invoice
                            </motion.a>
                          )}
                          {order.courierName && (
                            <div className="mt-2 text-xs text-gray-600 text-center">
                              🚚 {order.courierName} | AWB: {order.awbCode}
                            </div>
                          )}
                          {order.pickupBooked && (
                            <div className="mt-1 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-center">
                              📅 Pickup Scheduled
                            </div>
                          )}

                          <AnimatePresence>
                            {trackingOrders[order._id] && (
                              <motion.div
                                id={`tracking-${order._id}`}
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{
                                  opacity: 1,
                                  height: "auto",
                                  scale: 1,
                                }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="flex justify-center mb-6 mx-auto max-w-sm sm:max-w-md"
                              >
                                <OrderTracking
                                  order={order}
                                  status={order.status}
                                  trackingData={trackingData[order._id]}
                                />

                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : null}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setSelectedOrder(
                            selectedOrder?._id === order._id ? null : order,
                          )
                        }
                        className="w-full mt-3 sm:mt-4 bg-black text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        {selectedOrder?._id === order._id
                          ? "Hide Details"
                          : "View Details"}
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${selectedOrder?._id === order._id ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </motion.button>

                      {/* Order Details */}
                      <AnimatePresence>
                        {selectedOrder?._id === order._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="space-y-4 sm:space-y-3">
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider px-1">
                                Order Details
                              </h4>

                              {/* Shipping Address */}
                              {order.shippingAddressId && (
                                <div className="bg-white/80 p-3 sm:p-4 rounded-xl border border-gray-200">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                                    Shipping Address
                                  </p>
                                  <div className="space-y-1 text-sm">
                                    <p className="text-gray-900 font-medium break-words">
                                      {order.shippingAddressId.name || "N/A"}
                                    </p>
                                    <p className="text-gray-600 break-words">
                                      {order.shippingAddressId.phone || "N/A"}
                                    </p>
                                    <p className="text-gray-600 break-words">
                                      {order.shippingAddressId.line1 || "N/A"}
                                    </p>
                                    <p className="text-gray-600">
                                      {order.shippingAddressId.city || ""},{" "}
                                      {order.shippingAddressId.state || ""}{" "}
                                      {order.shippingAddressId.postalCode || ""}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Items List */}
                              <div className="bg-white/80 p-3 sm:p-4 rounded-xl border border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                                  Items ({order.items?.length || 0})
                                </p>
                                <div className="space-y-3">
                                  {order.items?.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100 last:border-b-0 gap-2 sm:gap-4"
                                    >
                                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                          {item.productId?.images?.[0]?.url ? (
                                            <img
                                              src={item.productId.images[0].url}
                                              alt={item.title}
                                              className="w-full h-full object-cover rounded-lg"
                                            />
                                          ) : (
                                            <svg
                                              className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium text-gray-900 break-words leading-tight line-clamp-2">
                                            {item.title ||
                                              item.productId?.title}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            ₹{getFinalItemPrice(item).toFixed(0)} x{" "}
                                            {item.quantity}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-sm font-bold text-gray-900 text-right sm:text-left">
                                        ₹{(getFinalItemPrice(item) * item.quantity).toFixed(2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="bg-white/80 p-3 sm:p-4 rounded-xl border border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                                  Order Summary
                                </p>
                                <div className="space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                                    <span className="text-gray-600">
                                      Subtotal
                                    </span>
                                    <span className="text-gray-900 font-medium">
                                      ₹{order.items?.reduce((total, item) => total + getFinalItemPrice(item) * item.quantity, 0).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="text-gray-900 font-medium">
                                      ₹{order.tax?.toFixed(2) || "0.00"}
                                    </span>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm font-bold border-t border-gray-200 pt-2 sm:pt-3 mt-1 sm:mt-2">
                                    <span className="text-gray-900 tracking-wide">
                                      Total Amount
                                    </span>
                                    <span className="text-gray-900 text-lg">
                                      ₹{order.items?.reduce((total, item) => total + getFinalItemPrice(item) * item.quantity, 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Info */}
                              {order.payment && (
                                <div className="bg-white/80 p-3 sm:p-4 rounded-xl border border-gray-200">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                                    Payment Details
                                  </p>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex flex-col sm:flex-row sm:justify-between">
                                      <span className="text-gray-600 font-medium">
                                        Method
                                      </span>
                                      <span className="text-gray-900 uppercase font-mono">
                                        {order.payment.provider}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between">
                                      <span className="text-gray-600">
                                        Transaction ID
                                      </span>
                                      <span className="text-gray-900 font-mono text-xs break-all">
                                        {order.payment.transactionId}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                                      <span className="text-gray-600">
                                        Status
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-bold uppercase mt-1 sm:mt-0 ${order.payment.status === "PAID" ? "bg-green-100 text-green-800 border border-green-200" : "bg-yellow-100 text-yellow-800 border border-yellow-200"}`}
                                      >
                                        {order.payment.status}
                                      </span>
                                    </div>
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
