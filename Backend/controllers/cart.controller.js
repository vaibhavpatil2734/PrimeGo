// controllers/cart.controller.js

const mongoose = require("mongoose");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const logActivity = require("../utils/logActivity");

console.log('🛒 Cart controller loaded');


/* ==============================
   GET CART
============================== */
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.json({ userId, items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   ADD OR UPDATE (MERGE QUANTITY)
============================== */
const addOrUpdateCartItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity, customizationType, customName } = req.body;

    const qty = Number(quantity) || 1;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    if (qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Validate custom data if provided
    const type = customizationType || 'plain';
    if (type !== 'plain' && type !== 'customized') {
      return res.status(400).json({ message: "Invalid customizationType" });
    }
    if (type === 'customized' && (!customName || customName.trim().length === 0 || customName.trim().length > 50)) {
      return res.status(400).json({ message: "customName required and max 50 chars for customized" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => 
        item.productId.toString() === productId.toString() &&
        item.customizationType === type &&
        (!customName || item.customName === customName.trim())
    );

    if (existingItem) {
      console.log(`📦 Merging: product ${productId} (${type}) qty ${existingItem.quantity} + ${qty}`);
      existingItem.quantity += qty;
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }
      cart.items.push({
        productId,
        quantity: qty,
        priceSnapshot: product.price,
        customizationType: type,
        customName: type === 'customized' ? customName.trim() : null
      });
    }

    await cart.save();
    await logActivity(req, 'UPDATE', 'Cart', cart._id, `Added/Updated item ${productId}`);
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
    res.status(200).json(updatedCart);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   REMOVE ITEM
============================== */
const removeCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cartItemId = productId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== cartItemId.toString()
    );

    await cart.save();
    await logActivity(req, 'DELETE', 'CartItem', cartItemId);
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
    res.json(updatedCart);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   CLEAR CART
============================== */
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();
    await logActivity(req, 'UPDATE', 'Cart', cart._id, 'Cart cleared');
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
    res.json(updatedCart);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

/* ==============================
   UPDATE ITEM QUANTITY (Set absolute quantity) - WITH DEBUG LOGS
============================== */
const updateCartItem = async (req, res) => {
  console.log('🖥️ Backend: updateCartItem START');
  console.log('👤 userId:', req.params.userId);
  console.log('🛒 cartItemId:', req.params.cartItemId);
  console.log('📝 body:', req.body);
  
  try {
    const { userId } = req.params;
    const cartItemId = req.params.cartItemId;
    const { quantity, customizationType, customName } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item._id.toString() === cartItemId
    );

    if (existingItemIndex === -1) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const item = cart.items[existingItemIndex];

    // Update fields if provided
    if (quantity !== undefined && quantity >= 1) {
      item.quantity = Number(quantity);
    }
    if (customizationType !== undefined) {
      if (customizationType !== 'plain' && customizationType !== 'customized') {
        return res.status(400).json({ message: "Invalid customizationType" });
      }
      item.customizationType = customizationType;
      item.customName = customizationType === 'customized' ? (customName || item.customName || '').trim() : null;
      if (item.customizationType === 'customized' && (!item.customName || item.customName.length === 0 || item.customName.length > 50)) {
        return res.status(400).json({ message: "customName required and max 50 chars for customized" });
      }
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate('items.productId');
    res.json(updatedCart);
  } catch (error) {
    console.error('💥 Controller ERROR:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addOrUpdateCartItem,
  removeCartItem,
  clearCart,
  updateCartItem,
};

