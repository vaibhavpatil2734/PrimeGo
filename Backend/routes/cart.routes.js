const express = require("express");
const {
  getCart,
  addOrUpdateCartItem,
  removeCartItem,
  clearCart,
  updateCartItem
} = require("../controllers/cart.controller");

const router = express.Router();

/* ==========================
   CART ROUTES
========================== */

// Get cart for a user
router.get("/:userId", getCart);

// Add or update item in cart
router.post("/:userId", addOrUpdateCartItem);

// Update cart item (quantity, custom...)
router.put("/:userId/:cartItemId", updateCartItem);

// Remove single item from cart (FIXED)
router.delete("/:userId/:productId", removeCartItem);

// Clear all items from cart (FIXED)
router.delete("/:userId", clearCart);

module.exports = router;
