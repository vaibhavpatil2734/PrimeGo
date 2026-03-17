import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import orderService from "../../services/order.service";
import { Search, ChevronDown, ChevronUp, Eye, Edit3, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Orders" },
  { value: "PLACED", label: "Order Placed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "ALL", label: "All Payments" },
  { value: "PAID", label: "Paid" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery" },
];

const ITEMS_PER_PAGE = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, paymentStatusFilter]);

  // Reset displayed count when filters or search change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchTerm, statusFilter, paymentStatusFilter]);

  const handleShowMore = () => {
    setDisplayedCount(prev => prev + ITEMS_PER_PAGE);
  };

  // Get paginated orders
  const displayedOrders = filteredOrders.slice(0, displayedCount);
  const hasMoreOrders = displayedCount < filteredOrders.length;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderService.getAllOrders();
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.error || "Failed to load orders");
      }
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by order status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (order) => order.status?.toUpperCase() === statusFilter
      );
    }

    // Filter by payment status
    if (paymentStatusFilter !== "ALL") {
      filtered = filtered.filter(
        (order) => order.paymentStatus?.toUpperCase() === paymentStatusFilter
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(term) ||
          order._id?.toLowerCase().includes(term) ||
          order.userId?.name?.toLowerCase().includes(term) ||
          order.userId?.email?.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId) => {
    if (!newStatus) return;

    try {
      setUpdating(true);
      const result = await orderService.updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setEditingStatus(null);
        setNewStatus("");
      } else {
        setError(result.error || "Failed to update status");
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status?.toUpperCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      PAID: "bg-green-100 text-green-800 border-green-200",
      UNPAID: "bg-red-100 text-red-800 border-red-200",
      CASH_ON_DELIVERY: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colors[paymentStatus?.toUpperCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    const labels = {
      PAID: "Paid",
      UNPAID: "Unpaid",
      CASH_ON_DELIVERY: "COD",
    };
    return labels[paymentStatus?.toUpperCase()] || "Unknown";
  };

  // Mobile Card View Component
  const MobileOrderCard = ({ order }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Order Number
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {order.orderNumber || `#${order._id?.slice(-8).toUpperCase()}`}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(
            order.status
          )}`}
        >
          {order.status || "PLACED"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Customer
          </p>
          <p className="text-sm text-gray-900 truncate" title={order.userId?.name || order.userId?.email || "Unknown"}>
            {order.userId?.name || order.userId?.email || "Unknown"}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total
          </p>
          <p className="text-sm font-bold text-gray-900">
            ₹{order.totalAmount?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Items
          </p>
          <p className="text-sm text-gray-900">
            {order.items?.length || 0} items
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </p>
          <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Payment
          </p>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${getPaymentStatusColor(
              order.paymentStatus
            )}`}
          >
            {getPaymentStatusLabel(order.paymentStatus)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() =>
            setSelectedOrder(selectedOrder?._id === order._id ? null : order)
          }
          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye size={14} />
          {selectedOrder?._id === order._id ? "Hide" : "View"} Details
        </button>
        <button
          onClick={() => {
            setEditingStatus(order._id);
            setNewStatus(order.status || "PLACED");
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Edit3 size={14} />
          Update Status
        </button>
      </div>

      {/* Status Update Dropdown */}
      <AnimatePresence>
        {editingStatus === order._id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-gray-100"
          >
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {STATUS_OPTIONS.slice(1).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleStatusUpdate(order._id)}
                disabled={updating}
                className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {updating ? "..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditingStatus(null);
                  setNewStatus("");
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details */}
      <AnimatePresence>
        {selectedOrder?._id === order._id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-gray-100 space-y-3"
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Customer Details
              </p>
              <p className="text-sm text-gray-900">
                {order.userId?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                {order.userId?.email || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Items
              </p>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-700">
                      {item.title} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>

            {/* Payment Status */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Payment Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${getPaymentStatusColor(
                  order.paymentStatus
                )}`}
              >
                {getPaymentStatusLabel(order.paymentStatus)}
              </span>
            </div>

            {order.payment && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Payment Details
                </p>
                <p className="text-sm text-gray-600">
                  Provider: {order.payment.provider}
                </p>
                {order.payment.transactionId && (
                  <p className="text-sm text-gray-600">
                    Transaction ID: {order.payment.transactionId}
                  </p>
                )}
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                    order.payment.status === "PAID"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.payment.status}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold">{filteredOrders.length}</span> orders
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by order number, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[180px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
          />
        </div>

        {/* Payment Status Filter */}
        <div className="relative min-w-[180px]">
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.orderNumber ||
                          `#${order._id?.slice(-8).toUpperCase()}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {order.userId?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.userId?.email || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {order.items?.length || 0} items
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">
                        {order.items
                          ?.map((item) => item.title)
                          .slice(0, 2)
                          .join(", ")}
                        {order.items?.length > 2 && ` +${order.items.length - 2}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{order.totalAmount?.toFixed(2) || "0.00"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {editingStatus === order._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          >
                            {STATUS_OPTIONS.slice(1).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStatusUpdate(order._id)}
                            disabled={updating}
                            className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {updating ? "..." : "Save"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingStatus(null);
                              setNewStatus("");
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status || "PLACED"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(order.createdAt).split(",")[1]}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setSelectedOrder(
                              selectedOrder?._id === order._id ? null : order
                            )
                          }
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          {selectedOrder?._id === order._id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingStatus(order._id);
                            setNewStatus(order.status || "PLACED");
                          }}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded Order Details */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 bg-gray-50"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Info */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Customer Details
                  </h4>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOrder.userId?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.userId?.email || "N/A"}
                  </p>
                  {selectedOrder.userId?.phone && (
                    <p className="text-sm text-gray-600">
                      {selectedOrder.userId.phone}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 md:col-span-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-500">
                            Qty: {item.quantity}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{item.price} each
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{selectedOrder.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Payment Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getPaymentStatusColor(
                          selectedOrder.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                      </span>
                    </div>
                    {selectedOrder.payment && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Provider</span>
                          <span className="text-sm font-medium text-gray-900 uppercase">
                            {selectedOrder.payment.provider}
                          </span>
                        </div>
                        {selectedOrder.payment.transactionId && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Transaction ID
                            </span>
                            <span className="text-sm font-mono text-gray-900">
                              {selectedOrder.payment.transactionId?.slice(0, 20)}
                              ...
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              selectedOrder.payment.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedOrder.payment.status}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Order Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{selectedOrder.subtotal?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{selectedOrder.tax?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{selectedOrder.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {displayedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          displayedOrders.map((order) => (
            <MobileOrderCard key={order._id} order={order} />
          ))
        )}
      </div>

      {/* Tablet View - Simplified Table */}
      <div className="hidden md:block lg:hidden">
        {displayedOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.orderNumber ||
                          `#${order._id?.slice(-8).toUpperCase()}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.userId?.name || order.userId?.email || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        ₹{order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            setSelectedOrder(
                              selectedOrder?._id === order._id ? null : order
                            )
                          }
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Show More Button */}
      {hasMoreOrders && (
        <div className="flex justify-center py-4 border-t border-gray-200">
          <button
            onClick={handleShowMore}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Show More ({filteredOrders.length - displayedCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
