// models/category.model.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

// Index for faster nested category queries
categorySchema.index({ parentCategory: 1 });

module.exports = mongoose.model('Category', categorySchema);
