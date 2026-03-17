const express = require("express");
const {
  getCart,
  addOrUpdateCartItem,
  removeCartItem,
  clearCart,
  updateCartItemQuantity
} = require("../controllers/cart.controller");

const router = express.Router();

/* ==========================
   CART ROUTES
========================== */

// Get cart for a user
router.get("/:userId", getCart);

// Add or update item in cart
router.post("/:userId", addOrUpdateCartItem);

// Update item quantity (set absolute quantity)
router.put("/:userId/:productId", updateCartItemQuantity);

// Remove single item from cart (FIXED)
router.delete("/:userId/:productId", removeCartItem);

// Clear all items from cart (FIXED)
router.delete("/:userId", clearCart);

module.exports = router;
