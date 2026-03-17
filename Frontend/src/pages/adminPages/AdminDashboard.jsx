import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import adminService from "../../services/admin.service";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [productStatus, setProductStatus] = useState({
    activeWithGoodStock: 0,
    lowStock: 0,
    outOfStock: 0,
    inactiveProducts: 0,
  });
  const [orderStatus, setOrderStatus] = useState({
    placed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [systemStatus, setSystemStatus] = useState({
    mongodb: { status: "unknown", message: "Loading..." },
    cloudinary: { status: "unknown", message: "Loading..." },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResult = await adminService.getStats();
      if (statsResult.success) {
        setStats(statsResult.data.stats);
      }

      // Fetch product status
      const productStatusResult = await adminService.getProductStatus();
      if (productStatusResult.success) {
        setProductStatus(productStatusResult.data);
      }

      // Fetch order status
      const orderStatusResult = await adminService.getOrderStatus();
      if (orderStatusResult.success) {
        setOrderStatus(orderStatusResult.data);
      }

      // Fetch system status
      const statusResult = await adminService.getSystemStatus();
      if (statusResult.success) {
        setSystemStatus(statusResult.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for product status pie chart
  const productStatusData = [
    { name: "Active (Good Stock)", value: productStatus.activeWithGoodStock, color: "#10b981" },
    { name: "Low Stock", value: productStatus.lowStock, color: "#f59e0b" },
    { name: "Out of Stock", value: productStatus.outOfStock, color: "#ef4444" },
    { name: "Inactive", value: productStatus.inactiveProducts, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  // Prepare data for order status pie chart
  const orderStatusData = [
    { name: "Placed", value: orderStatus.placed, color: "#3b82f6" },
    { name: "Shipped", value: orderStatus.shipped, color: "#8b5cf6" },
    { name: "Delivered", value: orderStatus.delivered, color: "#10b981" },
    { name: "Cancelled", value: orderStatus.cancelled, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
      case "live":
        return "text-green-600";
      case "disconnected":
      case "error":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const statsData = [
    { title: "Total Users", value: stats.totalUsers.toLocaleString() },
    { title: "Products", value: stats.totalProducts.toLocaleString() },
    { title: "Orders", value: stats.totalOrders.toLocaleString() },
    { title: "Revenue", value: formatCurrency(stats.totalRevenue) },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2 md:space-y-6 md:p-6">
      <h2 className="text-xl font-semibold md:text-2xl">Admin Dashboard</h2>

      {/* System Info - Now at Top with Graphics */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shadow-lg md:p-6">
        <h3 className="mb-3 font-semibold text-white md:mb-4">System Status</h3>
        <div className="flex flex-wrap gap-3 text-sm md:gap-6">
          {/* MongoDB Status */}
          <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur-sm">
            <div className={`h-3 w-3 rounded-full ${systemStatus.mongodb.status === "connected" ? "animate-pulse bg-green-400" : "bg-red-400"}`}></div>
            <span className="text-white">
              <span className="font-medium">MongoDB:</span> {systemStatus.mongodb.status === "connected" ? "Connected" : "Offline"}
            </span>
          </div>
          {/* Cloudinary Status */}
          <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur-sm">
            <div className={`h-3 w-3 rounded-full ${systemStatus.cloudinary.status === "live" ? "animate-pulse bg-green-400" : "bg-yellow-400"}`}></div>
            <span className="text-white">
              <span className="font-medium">Cloudinary:</span> {systemStatus.cloudinary.status === "live" ? "Live" : systemStatus.cloudinary.status === "not_configured" ? "Not Configured" : "Offline"}
            </span>
          </div>
          {/* Version */}
          <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-white">
              <span className="font-medium">Version:</span> v1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
        {statsData.map((item) => (
          <div key={item.title} className="rounded-xl bg-white p-3 shadow md:rounded-2xl md:p-5">
            <p className="text-xs text-gray-500 md:text-sm">{item.title}</p>
            <p className="mt-1 text-xl font-bold md:mt-2 md:text-2xl">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Product Status and Order Status Pie Charts */}
      <div className="grid grid-cols-1 gap-3 md:gap-6 lg:grid-cols-2">
        {/* Product Status Pie Chart */}
        <div className="rounded-xl bg-white p-3 shadow md:rounded-2xl md:p-6">
          <h3 className="mb-2 font-semibold md:mb-4">Product Status</h3>
          {productStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} md:height={250}>
              <PieChart>
                <Pie
                  data={productStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {productStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-gray-500 md:h-[250px]">
              No product data available
            </div>
          )}

          {/* Product Status Legend at Bottom */}
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs md:mt-4 md:gap-4 md:text-sm">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 md:h-3 md:w-3"></div>
              <span className="text-gray-600">Active: {productStatus.activeWithGoodStock}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500 md:h-3 md:w-3"></div>
              <span className="text-gray-600">Low: {productStatus.lowStock}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 md:h-3 md:w-3"></div>
              <span className="text-gray-600">Out: {productStatus.outOfStock}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-500 md:h-3 md:w-3"></div>
              <span className="text-gray-600">Inactive: {productStatus.inactiveProducts}</span>
            </div>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="rounded-xl bg-white p-3 shadow md:rounded-2xl md:p-6">
          <h3 className="mb-2 font-semibold md:mb-4">Order Status</h3>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} md:height={250}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-gray-500 md:h-[250px]">
              No order data available
            </div>
          )}

          {/* Order Status Legend at Bottom */}
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs md:mt-4 md:gap-4 md:text-sm">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 md:h-3 md:w-3"></div>
              <span className="text-gray-600">Placed: {orderStatus.placed}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500 md:h-3 md:w-3"></div>
              <span className="text-gray-600">Shipped: {orderStatus.shipped}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 md:h-3 md:w-3"></div>
              <span className="text-gray-600">Delivered: {orderStatus.delivered}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 md:h-3 md:w-3"></div>
              <span className="text-gray-600">Cancelled: {orderStatus.cancelled}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
