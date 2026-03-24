const express = require('express');
const auth = require('../middleware/auth');
const { createRazorpayOrder, verifyPayment } = require('../controllers/payment.controller');

const router = express.Router();

// 🛡️ Auth required for all payment endpoints
router.use(auth);

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

module.exports = router;
