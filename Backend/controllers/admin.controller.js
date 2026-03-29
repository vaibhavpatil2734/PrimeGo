const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const logActivity = require("../utils/logActivity");

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const totalUsers = await User.countDocuments();

    // Get orders by status (excluding cancelled)
    const orderStats = await Order.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate pending and delivered counts
    const pendingOrders = (orderStats.find(s => s._id === "PLACED")?.count || 0) +
                          (orderStats.find(s => s._id === "PAID")?.count || 0) +
                          (orderStats.find(s => s._id === "SHIPPED")?.count || 0);
    const deliveredOrders = orderStats.find(s => s._id === "DELIVERED")?.count || 0;

    // Get total revenue from delivered orders
    const revenueData = await Order.aggregate([
      { $match: { status: "DELIVERED" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get recent orders for the graph (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrdersByDate = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        totalOrders,
        totalProducts,
        totalUsers,
        pendingOrders,
        deliveredOrders,
        totalRevenue
      },
      recentOrdersByDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get product status statistics for dashboard
 */
const getProductStatusStats = async (req, res) => {
  try {
    // Get counts for different product statuses
    const activeWithGoodStock = await Product.countDocuments({ 
      isActive: true, 
      isDeleted: false,
      stock: { $gt: 10 }
    });
    
    const lowStock = await Product.countDocuments({ 
      isActive: true, 
      isDeleted: false,
      stock: { $gt: 0, $lte: 10 }
    });
    
    const outOfStock = await Product.countDocuments({ 
      isActive: true, 
      isDeleted: false,
      stock: { $lte: 0 }
    });
    
    const inactiveProducts = await Product.countDocuments({ 
      isActive: false, 
      isDeleted: false
    });

    res.json({
      activeWithGoodStock,
      lowStock,
      outOfStock,
      inactiveProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get order status statistics for dashboard
 */
const getOrderStatusStats = async (req, res) => {
  try {
    // Get counts for different order statuses
    const placedOrders = await Order.countDocuments({ status: "PLACED" });
    const shippedOrders = await Order.countDocuments({ status: "SHIPPED" });
    const deliveredOrders = await Order.countDocuments({ status: "DELIVERED" });
    const cancelledOrders = await Order.countDocuments({ status: "CANCELLED" });

    res.json({
      placed: placedOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get system status (MongoDB and Cloudinary)
 */
const getSystemStatus = async (req, res) => {
  try {
    const mongoose = require("mongoose");

    // Check MongoDB connection status
    const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    // Check Cloudinary connection
    const { testCloudinaryConnection, isCloudinaryConfigured } = require("../config/cloudinary");
    
    let cloudinaryStatus = "not_configured";
    let cloudinaryMessage = "";
    
    if (isCloudinaryConfigured()) {
      const cloudinaryTest = await testCloudinaryConnection();
      if (cloudinaryTest.success) {
        cloudinaryStatus = "live";
        cloudinaryMessage = "Connected successfully";
      } else {
        cloudinaryStatus = "error";
        cloudinaryMessage = cloudinaryTest.error?.message || "Connection failed";
      }
    } else {
      cloudinaryMessage = "Cloudinary credentials not configured";
    }

    res.json({
      mongodb: {
        status: mongoStatus,
        message: mongoStatus === "connected" ? "MongoDB is connected" : "MongoDB is disconnected"
      },
      cloudinary: {
        status: cloudinaryStatus,
        message: cloudinaryMessage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all users (Admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ date: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user by ID (Admin)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update user role (Admin)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['Customer', 'Admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { role }, 
      { new: true, runValidators: false }
    );

    await logActivity(req, 'UPDATE', 'User', id, `Role changed to ${role}`);

    // Generate new token with updated role
    const jwt = require('jsonwebtoken');
    const newToken = jwt.sign({ _id: updatedUser._id, role: updatedUser.role }, process.env.JWT_SECRET);

    res.json({ 
      message: "User role updated", 
      user: updatedUser,
      newToken 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/**
 * Delete user (Admin)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await logActivity(req, 'DELETE', 'User', id);

    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getProductStatusStats,
  getOrderStatusStats,
  getSystemStatus,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};
