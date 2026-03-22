const { razorpay } = require('../config/razorpay');
const crypto = require('crypto');

const createRazorpayOrder = async (req, res) => {
  console.log("🟢 Step A: create-order API hit");
  console.log("Amount:", req.body.amount);
  console.log("DEBUG KEY:", process.env.RAZORPAY_KEY_ID);
  console.log("DEBUG SECRET:", process.env.RAZORPAY_KEY_SECRET);
  console.log("DEBUG BODY:", req.body);
  if (!process.env.RAZORPAY_KEY_ID) {
    console.error("🔴 RAZORPAY_KEY_ID ENV missing!");
    return res.status(500).json({ error: "Payment config missing" });
  }
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
    console.log("🟢 Step B: Razorpay order created", order);
    res.status(200).json(order);
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

const verifyPayment = (req, res) => {
  console.log("🟢 Step C: Verify API hit", req.body);

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    console.log("Generated:", expectedSign);
    console.log("Received:", razorpay_signature);
    console.log("SECRET:", process.env.RAZORPAY_KEY_SECRET ? 'LOADED' : 'MISSING');

    if (expectedSign === razorpay_signature) {
      console.log("🟢 Step D: Payment verified");
      res.json({ success: true });
    } else {
      console.log("🔴 Step D FAILED: Signature mismatch");
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
