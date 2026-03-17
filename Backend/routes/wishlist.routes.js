const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
} = require("../controllers/wishlist.controller");

const router = express.Router();

/* ==========================
   WISHLIST ROUTES
========================== */

// Get wishlist for a user
router.get("/:userId", getWishlist);

// Check if product is in wishlist
router.get("/:userId/check", checkWishlist);

// Add item to wishlist
router.post("/", addToWishlist);

// Remove item from wishlist
router.delete("/:userId/:productId", removeFromWishlist);

// Clear entire wishlist
router.delete("/:userId", clearWishlist);

module.exports = router;

