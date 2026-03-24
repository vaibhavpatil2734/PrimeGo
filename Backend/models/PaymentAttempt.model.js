// models/PaymentAttempt.model.js - Temporary storage for Razorpay orders before final verification
const mongoose = require('mongoose');

const paymentAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
razorpayOrderId: {
    type: String,
    unique: true, // Remove required - set after Razorpay
    sparse: true  // Allow null values for unique index
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: { type: String, required: true },
    price: { type: Number, required: true }, // Backend-calculated price
    quantity: { type: Number, required: true, min: 1 }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true, default: 0 },
  expectedAmount: { type: Number, required: true }, // Backend-calculated total (INR)
  currency: { type: String, default: 'INR' },
  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'FAILED', 'EXPIRED'],
    default: 'PENDING'
  },
  razorpayPaymentId: { type: String }, // Set after payment
  idempotencyKey: { type: String }, // Prevent duplicates
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 min expiry
  }
}, {
  timestamps: true
});

// Auto-expire old attempts (cleanup)
paymentAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
paymentAttemptSchema.index({ userId: 1, status: 1 });


module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);

