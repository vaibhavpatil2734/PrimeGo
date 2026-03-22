const { razorpay } = require('../config/razorpay');
const crypto = require('crypto');

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: 'order_rcptid_' + Date.now(),
      notes: {
        userId: req.user?.id || 'guest' // optional, if auth middleware used
      }
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

const verifyPayment = (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (expectedSign === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment
};
