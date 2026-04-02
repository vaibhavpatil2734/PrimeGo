const express = require("express");
const {
  getCart,
  addOrUpdateCartItem,
  removeCartItem,
  clearCart,
  updateCartItem
} = require("../controllers/cart.controller");

const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

/* ==========================
   CART ROUTES
========================== */

// Get cart for authenticated user
router.get("/", getCart);

// Add or update item in cart 
router.post("/", addOrUpdateCartItem);

// Update cart item (quantity, custom...)
router.put("/:cartItemId", updateCartItem);

// Remove single item from cart
router.delete("/:cartItemId", removeCartItem);

// Clear all items from cart 
router.delete("/", clearCart);

module.exports = router;
