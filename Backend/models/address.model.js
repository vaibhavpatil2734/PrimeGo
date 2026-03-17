// models/address.model.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  line1: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },

  postalCode: {
    type: String,
    required: true
  },

  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

// Ensure one default address per user
addressSchema.index({ userId: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

module.exports = mongoose.model('Address', addressSchema);
