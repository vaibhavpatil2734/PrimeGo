// models/product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },

  price: {
    type: Number,
    required: true
  },

  discountPrice: {
    type: Number,
    default: null
  },

  images: {
    type: [{
      imageId: {
        type: String,
        default: null
      },
      url: {
        type: String,
        default: null
      },
      imageNumber: {
        type: Number,
        default: null
      }
    }],
    default: []
  },

  stock: {
    type: Number,
    default: 0
  },

  attributes: {
    color: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    }
  },

  rating: {
    type: Number,
    default: 0
  },

  reviewCount: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Performance indexes (important for ecommerce)
productSchema.index({ categoryId: 1, isActive: 1, isDeleted: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);
