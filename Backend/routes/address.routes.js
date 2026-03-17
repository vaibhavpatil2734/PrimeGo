const express = require("express");
const {
  addAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require("../controllers/address.controller");

const router = express.Router();

/* ==========================
   USER ADDRESS ROUTES
========================== */

// Add a new address
router.post("/", addAddress);

// Get all addresses for a user
router.get("/user/:userId", getUserAddresses);

// Get single address by ID
router.get("/:id", getAddressById);

// Update an address
router.put("/:id", updateAddress);

// Delete an address
router.delete("/:id", deleteAddress);

// Set default address
router.patch("/:id/default", setDefaultAddress);

module.exports = router;
