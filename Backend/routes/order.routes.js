const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder
} = require("../controllers/order.controller");

const router = express.Router();

/* ==========================
   USER ROUTES
========================== */

// Place a new order
router.post("/", createOrder);

// Get all orders for a specific user
router.get("/user/:userId", getOrdersByUser);

// Get single order by ID
router.get("/:id", getOrderById);

// Cancel an order
router.patch("/:id/cancel", cancelOrder);

/* ==========================
   ADMIN ROUTES
========================== */

// Get all orders (Admin)
router.get("/admin/all", getAllOrders);

// Update order status (Admin)
router.patch("/admin/:id/status", updateOrderStatus);

module.exports = router;
