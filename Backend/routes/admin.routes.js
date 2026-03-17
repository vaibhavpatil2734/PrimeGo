const express = require("express");
const {
  getDashboardStats,
  getProductStatusStats,
  getOrderStatusStats,
  getSystemStatus,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} = require("../controllers/admin.controller");

const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Get dashboard statistics
router.get("/stats", auth, adminAuth, getDashboardStats);

// Get product status statistics
router.get("/product-status", auth, adminAuth, getProductStatusStats);

// Get order status statistics
router.get("/order-status", auth, adminAuth, getOrderStatusStats);

// Get system status (MongoDB, Cloudinary)
router.get("/system-status", auth, adminAuth, getSystemStatus);

// User management routes
router.get("/users", auth, adminAuth, getAllUsers);
router.get("/users/:id", auth, adminAuth, getUserById);
router.put("/users/:id/role", auth, adminAuth, updateUserRole);
router.delete("/users/:id", auth, adminAuth, deleteUser);

module.exports = router;
