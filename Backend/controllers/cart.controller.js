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
    const { productId, quantity } = req.body;

    const qty = Number(quantity) || 1;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    if (qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItem) {
      console.log(`📦 Merging: product ${productId} qty ${existingItem.quantity} + ${qty}`);
      existingItem.quantity += qty;
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }
      cart.items.push({
        productId,
        quantity: qty,
        priceSnapshot: product.price
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
const updateCartItemQuantity = async (req, res) => {
  console.log('🖥️ Backend: updateCartItemQuantity START');
  console.log('👤 userId:', req.params.userId);
  console.log('🛒 cartItemId:', req.params.productId);  // Actually cart item ID
  console.log('🔢 quantity:', req.body.quantity);
  
  try {
    const { userId } = req.params;
    const cartItemId = req.params.productId;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      console.log('❌ Invalid quantity:', quantity);
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ userId });
    console.log('📦 Cart items:', cart?.items.map(item => ({
      productId: item.productId.toString().substring(0,24),
      itemId: item._id.toString(),
      qty: item.quantity
    })) || 'NO CART');

    if (!cart) {
      console.log('❌ Cart not found');
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find cart item by cart item _id
    const existingItemIndex = cart.items.findIndex(
      item => item._id.toString() === cartItemId
    );

    console.log('🔍 Looking for cartItemId:', cartItemId);
    console.log('🔍 Found at index:', existingItemIndex);

    if (existingItemIndex === -1) {
      console.log('❌ Cart item not found by ID');
      return res.status(404).json({ message: "Cart item not found" });
    }

    const oldQty = cart.items[existingItemIndex].quantity;
    cart.items[existingItemIndex].quantity = Number(quantity);
    console.log(`📊 Updated item ${cartItemId}: ${oldQty} → ${quantity}`);
    
    await cart.save();
    console.log('💾 Cart saved');

    // Return full populated cart
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId');
    console.log('✅ Returning', updatedCart.items.length, 'items');
    
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
  updateCartItemQuantity,
};

