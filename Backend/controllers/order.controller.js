// controllers/order.controller.js
const Order = require("../models/order.model");
const Product = require("../models/product.model");

/**
 * Place a new order
 */
const createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddressId, payment } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must have at least one item" });
    }

    // Calculate subtotal and validate stock
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.isDeleted || !product.isActive) {
        return res.status(400).json({ message: `Invalid product: ${item.title}` });
      }
      // Check if sufficient stock is available
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.title}. Available: ${product.stock}` 
        });
      }
      item.price = product.price; // ensure price is current
      subtotal += item.price * item.quantity;
    }

    const tax = Number((subtotal * 0.1).toFixed(2)); // example: 10% tax
    const totalAmount = subtotal + tax;

    // Generate simple order number
    const orderNumber = "ORD" + Date.now();

    // Determine paymentStatus based on payment method
    let paymentStatus = "UNPAID";
    if (payment && payment.provider === "razorpay" && payment.status === "PAID") {
      paymentStatus = "PAID";
    } else if (payment && payment.provider === "cash_on_delivery") {
      paymentStatus = "CASH_ON_DELIVERY";
    }

    const order = await Order.create({
      orderNumber,
      userId,
      items,
      subtotal,
      tax,
      totalAmount,
      shippingAddressId,
      payment,
      paymentStatus,
      status: "PLACED"
    });

    // Decrease stock for each item in the order
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all orders (Admin)
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "title price")
      .populate("shippingAddressId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single order by ID
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "title price")
      .populate("shippingAddressId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all orders for a specific user
 */
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("items.productId", "title price")
      .populate("shippingAddressId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update order status (Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PLACED","SHIPPED","DELIVERED","CANCELLED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cancel order (User/Admin)
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "CANCELLED" || order.status === "DELIVERED") {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    // Restore stock for each item in the order
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = "CANCELLED";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder
};
