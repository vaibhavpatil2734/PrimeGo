// models/cart.model.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // one cart per user
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        priceSnapshot: {
          type: Number,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true // automatically adds createdAt & updatedAt
  }
);

/* ==========================
   AUTO UPDATE updatedAt
========================== */
cartSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

/* ==========================
   AUTO POPULATE PRODUCTS
   (Safe Version - No next())
========================== */
cartSchema.pre(/^find/, function () {
  this.populate({
    path: "items.productId",
    select: "title price discountPrice images stock"
  });
});

module.exports = mongoose.model("Cart", cartSchema);