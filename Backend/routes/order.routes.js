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
  processTrackingWebhook
} = require("../controllers/order.controller");

const router = express.Router();

// 🌐 Public Webhook (before auth) - Shiprocket tracking updates
router.post('/webhook/shiprocket/track', processTrackingWebhook);

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

// 🚀 Shiprocket admin actions
router.post("/admin/:id/shiprocket/pickup", adminAuth, require('../controllers/shiprocket.controller').generateOrderPickup);
router.post("/admin/:id/shiprocket/manifest", adminAuth, require('../controllers/shiprocket.controller').generateOrderManifest);
router.post("/admin/:id/shiprocket/manifest/print", adminAuth, require('../controllers/shiprocket.controller').printOrderManifest);
router.post("/admin/:id/shiprocket/label", adminAuth, require('../controllers/shiprocket.controller').regenerateOrderLabel);

// 📦 Tracking route (user auth)
router.get("/:id/track", userAuth, getOrderTracking);

module.exports = router;
