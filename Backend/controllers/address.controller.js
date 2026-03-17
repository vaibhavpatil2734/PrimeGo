// controllers/address.controller.js
const Address = require("../models/address.model");

/**
 * Add a new address
 */
const addAddress = async (req, res) => {
  try {
    const { userId, name, phone, line1, city, state, postalCode, isDefault } = req.body;

    if (isDefault) {
      // unset previous default addresses
      await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      name,
      phone,
      line1,
      city,
      state,
      postalCode,
      isDefault: isDefault || false
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all addresses for a user
 */
const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single address by ID
 */
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update an address
 */
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, line1, city, state, postalCode, isDefault } = req.body;

    if (isDefault) {
      // unset previous default addresses
      const address = await Address.findById(id);
      if (!address) return res.status(404).json({ message: "Address not found" });

      await Address.updateMany({ userId: address.userId, isDefault: true }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { name, phone, line1, city, state, postalCode, isDefault },
      { new: true }
    );

    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete an address
 */
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);
    if (!address) return res.status(404).json({ message: "Address not found" });

    await address.remove();
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Set default address
 */
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // unset previous default addresses
    await Address.updateMany({ userId: address.userId, isDefault: true }, { isDefault: false });

    address.isDefault = true;
    await address.save();

    res.json({ message: "Default address updated", address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
