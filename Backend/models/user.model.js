const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, min: 3 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, min: 8 },
  role: { 
    type: String, 
    enum: ['Customer', 'Admin'], 
    default: 'Customer' 
  },
  googleId: { type: String }, // For OAuth
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);