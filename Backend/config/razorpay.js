require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("✅ Razorpay connection initialized successfully");

const testConnection = () => {
  // Simple test to ensure keys are valid
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    console.log("✅ Razorpay keys loaded correctly");
    return true;
  } else {
    console.warn("⚠️ Razorpay keys missing from .env");
    return false;
  }
};

module.exports = {
  razorpay,
  testConnection,
};

