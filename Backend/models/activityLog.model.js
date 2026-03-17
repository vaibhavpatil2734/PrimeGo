const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "VIEW", "OTHER"], // optional predefined actions
    },
    entity: {
      type: String,
      required: true, // e.g., "Product", "Order", "Cart", "Address"
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // the ID of the entity affected
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    },
    ipAddress: {
      type: String,
      required: true
    }
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);