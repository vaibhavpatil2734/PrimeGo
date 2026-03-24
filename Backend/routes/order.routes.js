const express = require("express");
const auth = require("../middleware/auth");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder
} = require("../controllers/order.controller");

const router = express.Router();

// 🛡️ Auth middleware for user routes
const userAuth = auth;
const adminAuth = [auth]; // Add admin check later

/* ==========================
   USER ROUTES (Auth protected)
========================== */
router.use(userAuth);
router.post("/", createOrder);
router.get("/user/:userId", getOrdersByUser);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

/* ==========================
   ADMIN ROUTES (Auth protected)
========================== */
router.get("/admin/all", adminAuth, getAllOrders);
router.patch("/admin/:id/status", adminAuth, updateOrderStatus);

module.exports = router;
