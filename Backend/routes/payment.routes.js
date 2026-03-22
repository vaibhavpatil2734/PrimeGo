const express = require('express');
const { createRazorpayOrder, verifyPayment } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

module.exports = router;
