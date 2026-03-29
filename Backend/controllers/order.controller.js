// controllers/order.controller.js
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const PaymentAttempt = require("../models/PaymentAttempt.model");
const logActivity = require("../utils/logActivity");


/**
 * ✅ UPDATED: COD Orders or Admin/Internal use only
 * Stock validation but NO deduction (handled in payment flow)
 * Idempotency protection
 */
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddressId, payment, idempotencyKey } = req.body;
    const userId = req.user._id; // From auth middleware

    // 1. Idempotency check
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ 
        userId, 
        idempotencyKey,
        status: { $in: ['PLACED', 'SHIPPED', 'DELIVERED'] }
      });
      if (existingOrder) {
        console.log(`🔄 [ORDER] Idempotent: returning existing ${existingOrder.orderNumber}`);
        return res.status(200).json(existingOrder);
      }
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must have at least one item" });
    }

    // 2. Validate stock (but don't deduct - handled in payment flow)
    let subtotal = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.isDeleted || !product.isActive) {
        return res.status(400).json({ error: `Invalid product: ${item.title}` });
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

    const tax = Number((subtotal * 0.1).toFixed(2));
    const totalAmount = subtotal + tax;
    const orderNumber = `ORD${Date.now()}`;

    // 3. Determine payment status (COD only for now)
    const paymentStatus = payment?.provider === 'cash_on_delivery' ? 'CASH_ON_DELIVERY' : 'UNPAID';

    const orderData = {
      orderNumber,
      userId,
      items: validatedItems,
      subtotal,
      tax,
      totalAmount,
      shippingAddressId,
      payment: {
        provider: payment?.provider || 'cod',
        status: paymentStatus === 'CASH_ON_DELIVERY' ? 'PENDING' : 'UNPAID'
      },
      paymentStatus,
      status: 'PLACED',
      idempotencyKey // Store for future checks
    };

    const order = await Order.create(orderData);
    
    // 🚀 Basic Shiprocket shipment creation ONLY (manual pickup/label via admin)
    try {
      const populatedOrder = await Order.findById(order._id).populate(['shippingAddressId', 'userId']);
      console.log(`🚀 [ORDER-SR] Creating basic shipment for ${orderNumber}`);
      
      const { checkServiceability, createShipment, assignAWB } = require("../services/shiprocket.service");
      
      // Check serviceability
      const couriers = await checkServiceability(populatedOrder.shippingAddressId.postalCode, 0.5, order.payment.provider === 'cash_on_delivery');
      if (couriers.length === 0) {
        console.log(`⚠️ No couriers available for pin ${populatedOrder.shippingAddressId.postalCode}`);
        return res.status(201).json(order);
      }
      
      const selectedCourier = couriers.sort((a, b) => a.rate - b.rate)[0];
      
      // Create shipment
      const shipment = await createShipment(populatedOrder);
      populatedOrder.shipmentId = shipment.shipment_id;
      populatedOrder.shipment_id = shipment.shipment_id;
      populatedOrder.deliveryProvider = "shiprocket";
      
      // Assign AWB
      const awbRes = await assignAWB(shipment.shipment_id, selectedCourier.courier_company_id);
      populatedOrder.awbCode = awbRes.awb_code || shipment.awb_code;
      populatedOrder.trackingId = populatedOrder.awbCode;
      
      populatedOrder.shiprocketOrderId = shipment.order_id;
      
      await populatedOrder.save();
      
      console.log(`✅ [ORDER BASIC SR] ${orderNumber}: shipment_id=${shipment.shipment_id}, ready for manual pickup`);
      await logActivity(req, 'CREATE', 'Order', order._id, `Order ${orderNumber} placed ($${totalAmount.toFixed(2)})`);
      res.status(201).json(populatedOrder);
    } catch (shiprocketError) {
      console.log("⚠️ Shiprocket partial fail:", shiprocketError.message);
      console.log(`✅ Order created (manual SR steps needed): ${orderNumber}`);
      await logActivity(req, 'CREATE', 'Order', order._id, `Order ${orderNumber} placed ($${totalAmount.toFixed(2)})`);
      res.status(201).json(order);
    }

  } catch (error) {

    console.error('❌ [ORDER CREATE] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all orders (Admin) - Enhanced populate
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone")
      .populate("items.productId", "title price images stock")
      .populate("shippingAddressId", "name line1 city state postalCode phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single order by ID
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "title price images")
      .populate("shippingAddressId");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all orders for a specific user
 */
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("items.productId", "title price images")
      .populate("shippingAddressId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update order status (Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PLACED","SHIPPED","DELIVERED","CANCELLED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Restore stock if cancelling shipped/delivered orders
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = status;
    await order.save();
    await logActivity(req, 'UPDATE', 'Order', id, `Status changed to: ${status}`);
    res.json({ message: "Order status updated", order });
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
};

/**
 * Cancel order (User/Admin) - Now handles stock restoration
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "CANCELLED" || order.status === "DELIVERED") {
      return res.status(400).json({ error: "Cannot cancel this order" });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = "CANCELLED";
    await order.save();
    await logActivity(req, 'UPDATE', 'Order', id, 'Order cancelled');
    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
};

/**
 * Get live Shiprocket tracking for order
 */
const getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('userId shippingAddressId');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.trackingId && !order.awbCode) {
      return res.status(400).json({ error: "No tracking ID found for this order" });
    }

    let trackingData;

    // 📱 Prefer stored webhook data if recent (within 1hr)
    if (order.scans && order.scans.length > 0) {
      const latestScan = order.scans[order.scans.length - 1];
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (new Date(latestScan.date) > oneHourAgo) {
        trackingData = {
          awb: order.awbCode || order.trackingId,
          current_status: order.current_status,
          shipment_status: order.shipment_status,
          shipment_status_id: order.shipment_status_id,
          current_timestamp: order.current_timestamp,
          etd: order.etd,
          scans: order.scans,
          courier_name: order.courierName
        };
        console.log(`📱 [TRACK] Using stored webhook data for ${order.orderNumber} (${order.scans.length} scans)`);
      }
    }

    // 🔄 Fallback to live Shiprocket API
    if (!trackingData) {
      const { getTracking } = require("../services/shiprocket.service");
      trackingData = await getTracking(order.awbCode || order.trackingId);
      console.log(`🔄 [TRACK] Fetched live SR data for ${order.orderNumber}`);
    }

    res.json({
      success: true,
      order,
      tracking: trackingData,
      trackUrl: `https://shiprocket.co/tracking/${order.trackingId || order.awbCode}`,
      source: trackingData.scans === order.scans ? 'webhook' : 'shiprocket'
    });
  } catch (error) {
    console.error("❌ Tracking fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch tracking data" });
  }
};

// 🚀 Shiprocket Tracking Webhook - Real-time updates
const processTrackingWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const awb = payload.awb;
    
    if (!awb) {
      console.log('📡 [WEBHOOK] Missing AWB');
      return res.status(400).json({ error: 'AWB required' });
    }

    console.log(`📡 [WEBHOOK] Processing ${awb}: ${payload.current_status}`);

    // Find matching order
    const order = await Order.findOne({
      $or: [
        { awbCode: awb },
        { trackingId: awb }
      ]
    });

    if (!order) {
      console.log(`⚠️ [WEBHOOK] No order for AWB: ${awb}`);
      return res.status(200).json({ received: true }); // 200 OK for SR
    }

    // Update core fields
    const previousScansCount = order.scans ? order.scans.length : 0;
    order.current_status = payload.current_status;
    order.shipment_status = payload.shipment_status;
    order.shipment_status_id = payload.shipment_status_id;
    order.current_timestamp = new Date(payload.current_timestamp || Date.now());
    if (payload.etd) order.etd = new Date(payload.etd);
    if (payload.courier_name) order.courierName = payload.courier_name;

    // Status sync to main enum
    const statusSync = {
      'Delivered': 'DELIVERED',
      'Out for Delivery': 'SHIPPED',
      'Shipped': 'SHIPPED',
      'RTO': 'CANCELLED'
    };
    if (statusSync[payload.current_status]) {
      order.status = statusSync[payload.current_status];
    }

    // Append new scans (dedupe)
    if (payload.scans && Array.isArray(payload.scans)) {
      payload.scans.forEach((scan) => {
        const duplicate = order.scans.some((existingScan) => 
          existingScan.date === scan.date &&
          existingScan.activity === scan.activity &&
          existingScan.location === scan.location
        );
        if (!duplicate) {
          order.scans.push(scan);
        }
      });
    }

    await order.save();

    console.log(`✅ [WEBHOOK] ${order.orderNumber} updated | Status: ${payload.current_status} | Scans: ${order.scans.length - previousScansCount} new (${order.scans.length} total)`);

    res.json({ 
      success: true, 
      order: order.orderNumber, 
      newScans: order.scans.length - previousScansCount 
    });

  } catch (error) {
    console.error('❌ [WEBHOOK ERROR]:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  cancelOrder,
  getOrderTracking,
  processTrackingWebhook
};


