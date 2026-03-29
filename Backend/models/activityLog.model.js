const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "VIEW", "PURCHASE", "OTHER"]
    },
    entity: {
      type: String,
      required: [true, "Entity is required"] // e.g., "Product", "Order", "Cart", "Wishlist"
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Entity ID is required"]
    },
    details: {
      type: String,
      default: ""
    },
    reqData: {
      type: mongoose.Schema.Types.Mixed, // Store req.method, req.originalUrl, etc.
      default: {}
    },
    ipAddress: {
      type: String,
      required: [true, "IP Address is required"]
    }
  },
  { 
    timestamps: true 
  }
);

// Compound indexes for efficient querying
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ entity: 1, createdAt: -1 });


module.exports = mongoose.model("ActivityLog", activityLogSchema);