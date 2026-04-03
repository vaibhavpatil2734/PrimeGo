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
    console.log('🔍 [PAYMENT CREATE] Start - user:', req.user?._id);
    
    // Key validation (safer than API call)
    const { testConnection } = require('../config/razorpay');
    if (!testConnection()) {
      return res.status(503).json({ error: 'Razorpay keys missing' });
    }
    console.log('✅ Razorpay keys OK');
    
    const { items, shippingAddressId, personalizationText: incomingPersonalizationText } = req.body;
    const userId = req.user._id;
    
    console.log('🎯 payment create personalizationText:', incomingPersonalizationText);
    const personalizationTextFinal = incomingPersonalizationText?.trim() || null;

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

    const tax = 0; // Tax removed per request
    const expectedAmount = subtotal;

    // 3. Idempotency key (prevent duplicate attempts)
    const idempotencyKey = uuidv4();

    // Idempotency - check existing
    const existing = await PaymentAttempt.findOne({
      idempotencyKey,
      status: { $in: ['PENDING', 'VERIFIED'] }
    });
    if (existing?.razorpayOrderId) {
      console.log(`🔄 Idempotent: using existing ${existing._id}`);
      return res.json({
        success: true,
        razorpayOrder: { id: existing.razorpayOrderId },
        expectedAmount: existing.expectedAmount
      });
    }

    // 4. Store PaymentAttempt
    const paymentAttempt = await PaymentAttempt.create({
      userId,
      items: validatedItems,
      subtotal,
      tax,
      expectedAmount,
      shippingAddressId,
      personalizationText: personalizationTextFinal,
      idempotencyKey
    });

    // 5. Create Razorpay order
    const amountPaise = Math.round(expectedAmount * 100);
    if (amountPaise <= 0) {
      throw new Error('Invalid amount: zero or negative');
    }

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `rzp_${paymentAttempt._id}`,
      notes: {
        paymentAttemptId: paymentAttempt._id.toString(),
        userId: userId.toString()
      }
    };

    console.log(`🧾 Creating RZP order: ${amountPaise} paise`);
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
    console.error('🔴 [PAYMENT CREATE] FULL ERROR:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode || 'N/A',
      description: error.description,
      name: error.name,
      userId: req.user?._id
    });

    let errorMsg = 'Payment service error';
    let status = 500;

    if (error.code === 4001 || error.description?.includes('key')) {
      errorMsg = 'Invalid Razorpay keys';
      status = 503;
    } else if (error.code === 402) {
      errorMsg = 'Gateway payment limit exceeded';
      status = 402;
    } else if (error.name === 'ValidationError') {
      errorMsg = 'Invalid order data';
      status = 400;
    } else if (error.message.includes('zero') || error.message.includes('negative')) {
      errorMsg = 'Invalid order amount';
      status = 400;
    }

    res.status(status).json({ error: errorMsg });
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
    const paidAmountPaise = Number(razorpay_amount); // Keep as paise for exact match
    const expectedPaise = Math.round(paymentAttempt.expectedAmount * 100);
    console.log(`💰 [VERIFY] Amount: sent=${paidAmountPaise}p (${razorpay_amount}), expected=${expectedPaise}p`);
    
    if (paidAmountPaise !== expectedPaise) {
      console.log(`🔴 [VERIFY] Amount mismatch: paid=${paidAmountPaise}p, expected=${expectedPaise}p`);
      
      paymentAttempt.status = 'FAILED';
      await paymentAttempt.save();
      
      return res.status(400).json({ success: false, error: `Amount mismatch: paid ${paidAmountPaise}p, expected ${expectedPaise}p` });
    }
    console.log('✅ [VERIFY] Amount match OK');

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

    // Copy customization from cart (consistency with COD flow)
    const Cart = require('../models/cart.model');
    const userCart = await Cart.findOne({ userId: paymentAttempt.userId }).populate('items.productId');
    const cartItemsMap = new Map();
    if (userCart?.items) {
      userCart.items.forEach(cartItem => {
        const key = cartItem.productId._id.toString();
        if (!cartItemsMap.has(key)) cartItemsMap.set(key, []);
        cartItemsMap.get(key).push({
          customizationType: cartItem.customizationType,
          customName: cartItem.customName
        });
      });
    }

    // Enhance items with customization
    const finalItems = paymentAttempt.items.map(item => {
      const productCartCustoms = cartItemsMap.get(item.productId.toString()) || [];
      const customization = productCartCustoms.find(c => c.customizationType === 'customized' && c.customName)
        ? productCartCustoms.find(c => c.customizationType === 'customized')
        : productCartCustoms[0] || { customizationType: 'plain', customName: null };
      
      return {
        ...item,
        customizationType: customization.customizationType,
        customName: customization.customName
      };
    });

    // Create final order
    const orderNumber = `ORD${Date.now()}`;
    const order = await Order.create({
      orderNumber,
      userId: paymentAttempt.userId,
      items: finalItems,
      subtotal: paymentAttempt.subtotal,
      tax: paymentAttempt.tax,
      totalAmount: paymentAttempt.expectedAmount,
      shippingAddressId: paymentAttempt.shippingAddressId,
      personalizationText: paymentAttempt.personalizationText,
      payment: {
        provider: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'PAID'
      },
      paymentStatus: 'PAID',
      status: 'PLACED'
    });

    // 🚀 Shiprocket: Basic setup only (manual admin pickup/label)
    try {
      const populatedOrder = await Order.findById(order._id).populate(['shippingAddressId', 'userId']);
      console.log(`🚀 [PAYMENT-SR] Basic setup for ${orderNumber}`);
      
      const { checkServiceability, createShipment, assignAWB } = require("../services/shiprocket.service");
      
      const couriers = await checkServiceability(populatedOrder.shippingAddressId.postalCode, 0.5, false);
      if (couriers.length === 0) {
        console.log(`⚠️ No SR couriers for ${populatedOrder.shippingAddressId.postalCode}`);
        return res.status(201).json(populatedOrder);
      }
      
      const selectedCourier = couriers.sort((a, b) => a.rate - b.rate)[0];
      const shipment = await createShipment(populatedOrder);
      populatedOrder.shipmentId = shipment.shipment_id;
      
      const awbRes = await assignAWB(shipment.shipment_id, selectedCourier.courier_company_id);
      populatedOrder.awbCode = awbRes.awb_code || shipment.awb_code;
      populatedOrder.trackingId = populatedOrder.awbCode;
      populatedOrder.deliveryProvider = "shiprocket";
      
      await populatedOrder.save();
      
      console.log(`✅ [PAYMENT BASIC SR] ${orderNumber} ready for manual pickup/label`);
      res.status(201).json(populatedOrder);
    } catch (shiprocketError) {
      console.log("⚠️ Shiprocket partial fail:", shiprocketError.message);
      console.log(`✅ [PAYMENT] Order ${orderNumber} created`);
      res.status(201).json(order);
    }
  } catch (error) {
    console.error('❌ [PAYMENT VERIFY] Error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};


module.exports = {
  createRazorpayOrder,
  verifyPayment
};
