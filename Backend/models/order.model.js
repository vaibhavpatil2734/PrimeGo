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
      quantity: { type: Number, required: true, min: 1 },
      customizationType: {
        type: String,
        enum: ['plain', 'customized'],
        default: 'plain'
      },
      customName: {
        type: String,
        maxlength: 100,
        trim: true
      }
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
  // Real-time Shiprocket tracking fields (webhook updates)
  current_status: {
    type: String,
    default: "Order Placed"
  },
  shipment_status: {
    type: String
  },
  shipment_status_id: {
    type: Number
  },
  current_timestamp: {
    type: Date,
    default: Date.now
  },
  etd: {
    type: Date
  },
  scans: [{
    date: { type: String },
    activity: { type: String },
    location: { type: String }
  }],

  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },

  payment: {
    provider: {
      type: String,
      enum: ["razorpay", "cash_on_delivery"]
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    transactionId: { type: String },
    status: { 
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED']
    }
  },

  paymentStatus: {
    type: String,
    enum: ["PAID", "UNPAID", "CASH_ON_DELIVERY"],
    default: "UNPAID"
  },

  deliveryProvider: {
    type: String
  },
  trackingId: {
    type: String
  },
  shipmentId: {
    type: String
  },
  awbCode: {
    type: String
  },
  courierName: {
    type: String
  },
  // 🔥 Real tracking dates (webhook updates)
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  expectedDelivery: {
    type: String  // Store ETD string like "2021-12-15"
  },
  selectedCourier: {
    courier_company_id: { type: String },
    courier_name: { type: String },
    rate: { type: Number }
  },
  pickupBooked: {
    type: Boolean,
    default: false
  },

  labelPdf: {
    type: String
  },
  invoicePdf: {
    type: String
  },
  manifestPdf: {
    type: String
  },
  packageDimensions: {
    length: { type: Number, default: 10 },
    breadth: { type: Number, default: 10 },
    height: { type: Number, default: 10 },
    weight: { type: Number, default: 0.5 }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  personalizationText: {
    type: String,
    maxlength: 200,
    trim: true,
    default: null
  },

  hasReviewed: {
    type: Boolean,
    default: false
  }
});

// Index for fast lookup by user and order number
orderSchema.index({ userId: 1, orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
