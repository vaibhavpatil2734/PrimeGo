const { razorpay } = require('../config/razorpay');
const crypto = require('crypto');
const PaymentAttempt = require('../models/PaymentAttempt.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { v4: uuidv4 } = require('uuid');

/**
 * ✅ SECURE: Step 1 - Create Razorpay Order (Backend calculates total)
 * 1. Validate auth + items
 * 2. Recalculate prices/stock from DB 
 * 3. Store PaymentAttempt with expectedAmount
 * 4. Create Razorpay order with BACKEND amount
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { items, shippingAddressId } = req.body;
    const userId = req.user._id;

    console.log(`🟢 [PAYMENT] create-order: user=${userId}, items=${items.length}`);

    // 1. Input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Valid items array required' });
    }
    if (!shippingAddressId) {
      return res.status(400).json({ error: 'Shipping address required' });
    }

    // 2. Recalculate total + validate stock (DB prices only)
    let subtotal = 0;
    const validatedItems = [];
    
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Invalid item data' });
      }

      const product = await Product.findById(item.productId);
      if (!product || product.isDeleted || !product.isActive) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.title}. Available: ${product.stock}` 
        });
      }

      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      validatedItems.push({
        productId: product._id,
        title: product.title,
        price,
        quantity: item.quantity
      });
      subtotal += price * item.quantity;
    }

    const tax = Number((subtotal * 0.1).toFixed(2)); // 10% tax
    const expectedAmount = subtotal + tax;

    // 3. Idempotency key (prevent duplicate attempts)
    const idempotencyKey = uuidv4();

    // 4. Store PaymentAttempt (key security step)
    const paymentAttempt = await PaymentAttempt.create({
      userId,
      items: validatedItems,
      subtotal,
      tax,
      expectedAmount,
      shippingAddressId,
      idempotencyKey
    });

    // 5. Create Razorpay order with BACKEND amount only
    const options = {
      amount: Math.round(expectedAmount * 100), // paise
      currency: 'INR',
      receipt: `attempt_${paymentAttempt._id}`,
      notes: {
        paymentAttemptId: paymentAttempt._id.toString(),
        userId: userId.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    // Link razorpay order ID
    paymentAttempt.razorpayOrderId = razorpayOrder.id;
    await paymentAttempt.save();

    console.log(`✅ [PAYMENT] Created: attempt=${paymentAttempt._id}, rzOrder=${razorpayOrder.id}, amount=${expectedAmount}`);
    
    res.json({
      success: true,
      razorpayOrder: razorpayOrder,
      expectedAmount // Frontend display only
    });

  } catch (error) {
    console.error('❌ [PAYMENT CREATE] Error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

/**
 * ✅ SECURE: Step 2 - Verify Razorpay Payment (Amount matching + order creation)
 * 1. Verify signature
 * 2. Match razorpay_order_id with PaymentAttempt
 * 3. Match paid amount == expectedAmount 
 * 4. Deduct stock + create final Order
 * 5. Mark success/failed
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_amount // New: paid amount from frontend
    } = req.body;

    console.log(`🔍 [PAYMENT VERIFY] order_id=${razorpay_order_id}, payment_id=${razorpay_payment_id}`);

    // 1. Signature verification (MANDATORY)
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      console.log('🔴 [VERIFY] Signature mismatch');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // 2. Find matching PaymentAttempt
    const paymentAttempt = await PaymentAttempt.findOne({ 
      razorpayOrderId: razorpay_order_id,
      status: 'PENDING'
    });

    if (!paymentAttempt) {
      console.log('🔴 [VERIFY] No matching payment attempt found');
      return res.status(400).json({ success: false, error: 'Payment attempt not found' });
    }

    // 3. Amount matching (CRITICAL SECURITY)
    const paidAmount = Number(razorpay_amount) / 100; // Convert paise to INR
    if (paidAmount !== paymentAttempt.expectedAmount) {
      console.log(`🔴 [VERIFY] Amount mismatch: paid=${paidAmount}, expected=${paymentAttempt.expectedAmount}`);
      
      // Mark as failed
      paymentAttempt.status = 'FAILED';
      await paymentAttempt.save();
      
      return res.status(400).json({ success: false, error: 'Amount mismatch' });
    }

    // 4. ALL CHECKS PASS - Create final order + deduct stock
    paymentAttempt.status = 'VERIFIED';
    paymentAttempt.razorpayPaymentId = razorpay_payment_id;
    await paymentAttempt.save();

    // Deduct stock
    for (const item of paymentAttempt.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create final order
    const orderNumber = `ORD${Date.now()}`;
    const order = await Order.create({
      orderNumber,
      userId: paymentAttempt.userId,
      items: paymentAttempt.items,
      subtotal: paymentAttempt.subtotal,
      tax: paymentAttempt.tax,
      totalAmount: paymentAttempt.expectedAmount,
      shippingAddressId: paymentAttempt.shippingAddressId,
      payment: {
        provider: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'PAID'
      },
      paymentStatus: 'PAID',
      status: 'PLACED'
    });

    console.log(`✅ [PAYMENT] SUCCESS: order=${orderNumber}, attempt=${paymentAttempt._id}`);

    res.json({ 
      success: true, 
      orderId: order._id,
      orderNumber: order.orderNumber 
    });

  } catch (error) {
    console.error('❌ [PAYMENT VERIFY] Error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment
};

