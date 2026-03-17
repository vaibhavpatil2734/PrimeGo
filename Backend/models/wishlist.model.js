// models/wishlist.model.js
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // one wishlist per user
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now
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
wishlistSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

/* ==========================
   AUTO POPULATE PRODUCTS
========================== */
wishlistSchema.pre(/^find/, function () {
  this.populate({
    path: "items.productId",
    select: "title price discountPrice images stock"
  });
});

module.exports = mongoose.model("Wishlist", wishlistSchema);

