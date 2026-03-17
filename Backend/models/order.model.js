// models/order.model.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],

  subtotal: {
    type: Number,
    required: true
  },

  tax: {
    type: Number,
    required: true,
    default: 0
  },

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"],
    default: "PLACED"
  },

  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },

  payment: {
    provider: {
      type: String,
      enum: ["razorpay", "cash_on_delivery"] // extendable for other providers
    },
    transactionId: { type: String },
    status: { type: String }
  },

  paymentStatus: {
    type: String,
    enum: ["PAID", "UNPAID", "CASH_ON_DELIVERY"],
    default: "UNPAID"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast lookup by user and order number
orderSchema.index({ userId: 1, orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
