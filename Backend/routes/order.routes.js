const express = require("express");
const auth = require("../middleware/auth");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder,
  getOrderTracking,
  processTrackingWebhook,
  getServiceability
} = require("../controllers/order.controller");

const {
  generateOrderPickup,
  generateOrderManifest,
  printOrderManifest,
  regenerateOrderLabel
} = require("../controllers/shiprocket.controller");

const router = express.Router();

// 🌐 Public Webhook (NO AUTH)
router.post('/webhook/shiprocket/track', processTrackingWebhook);

// 🛡️ Middleware
const userAuth = auth;
const adminAuth = [auth]; // You can extend later with role check

/* ==========================
   USER ROUTES (Auth protected)
========================== */
router.use(userAuth);

// ✅ Create order
router.post("/", createOrder);

// ✅ Get user orders
router.get("/user/:userId", getOrdersByUser);

// ✅ Serviceability (IMPORTANT: before /:id)
router.get("/serviceability", getServiceability);

// ✅ Tracking (IMPORTANT: before /:id)
router.get("/:id/track", getOrderTracking);

// ❗ Dynamic routes LAST
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);


/* ==========================
   ADMIN ROUTES (Auth protected)
========================== */

// ✅ Get all orders
router.get("/admin/all", adminAuth, getAllOrders);

// ✅ Update status
router.patch("/admin/:id/status", adminAuth, updateOrderStatus);

// 🚀 Shiprocket admin actions
router.post("/admin/:id/shiprocket/pickup", adminAuth, generateOrderPickup);
router.post("/admin/:id/shiprocket/manifest", adminAuth, generateOrderManifest);
router.post("/admin/:id/shiprocket/manifest/print", adminAuth, printOrderManifest);
router.post("/admin/:id/shiprocket/label", adminAuth, regenerateOrderLabel);

module.exports = router;