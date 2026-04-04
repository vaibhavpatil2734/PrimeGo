const express = require('express');
const router = express.Router();
const { submitOrderReview } = require('../controllers/review.controller');
const auth = require('../middleware/auth');

// POST /api/review/order/:orderId - Submit reviews for order items
console.log('Review routes - submitOrderReview type:', typeof submitOrderReview);
console.log('Review routes - auth type:', typeof auth);
console.log('Review routes loaded successfully');
console.log('Registering POST /review/order/:orderId route');
router.post('/order/:orderId', auth, submitOrderReview);

module.exports = router;