const Order = require('../models/order.model');
const {
  generatePickup,
  generateManifest,
  printManifest,
  generateLabel,
  printInvoice,
} = require('../services/shiprocket.service');

/**
 * Admin: Generate pickup for order (SAFE + FIXED)
 */
const generateOrderPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('shippingAddressId');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.shipmentId) return res.status(400).json({ error: 'No shipment ID found' });
    if (order.pickupBooked) return res.status(400).json({ error: 'Pickup already booked' });

    console.log("\n🚀 [ADMIN PICKUP] Starting pickup for:", order.shipmentId);

    // ✅ FIX: call correctly (NO extra params)
    const result = await generatePickup(order.shipmentId);

    console.log("🚀 Pickup Response:");
    console.dir(result, { depth: null });

    // ❌ DO NOT mark booked if failed
    if (!result || result.Status === false) {
      return res.status(400).json({
        error: "Pickup failed",
        response: result,
      });
    }

    order.pickupBooked = true;
    await order.save();

    console.log("✅ Pickup booked successfully");

    res.json({ success: true, data: result, order });

  } catch (error) {
    console.error("❌ Pickup Error:");
    console.dir(error.response?.data || error.message, { depth: null });

    res.status(500).json({
      error: error.message,
      details: error.response?.data || null,
    });
  }
};

/**
 * Admin: Generate manifest
 */
const generateOrderManifest = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order.shipmentId) return res.status(400).json({ error: 'No shipment ID' });

    console.log("\n🚀 Generating Manifest for:", order.shipmentId);

    const result = await generateManifest(order.shipmentId);

    console.log("🚀 Manifest Response:");
    console.dir(result, { depth: null });

    res.json({ success: true, data: result });

  } catch (error) {
    console.error("❌ Manifest Error:");
    console.dir(error.response?.data || error.message, { depth: null });

    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin: Print manifest PDFs
 */
const printOrderManifest = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order.shipmentId) return res.status(400).json({ error: 'No shipment ID' });

    console.log("\n🚀 Printing Manifest for:", order.shipmentId);

    const result = await printManifest(order.shipmentId);

    console.log("🚀 Print Manifest Response:");
    console.dir(result, { depth: null });

    order.manifestPdf = result.pdf || result.manifest_pdf_url;
    await order.save();

    res.json({ success: true, pdf: order.manifestPdf, data: result });

  } catch (error) {
    console.error("❌ Print Manifest Error:");
    console.dir(error.response?.data || error.message, { depth: null });

    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin: Regenerate label PDF (SAFE)
 */
const regenerateOrderLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order.shipmentId) return res.status(400).json({ error: 'No shipment ID' });

    // ❌ IMPORTANT: Only allow label if pickup done
    if (!order.pickupBooked) {
      return res.status(400).json({
        error: "Pickup not completed yet. Cannot generate label.",
      });
    }

    console.log("\n🏷 Generating Label for:", order.shipmentId);

    const result = await generateLabel(order.shipmentId);

    console.log("🚀 Label Response:");
    console.dir(result, { depth: null });

    order.labelPdf = result.pdf || result.label_pdf_url;
    await order.save();

    res.json({ success: true, pdf: order.labelPdf, data: result });

  } catch (error) {
    console.error("❌ Label Error:");
    console.dir(error.response?.data || error.message, { depth: null });

    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateOrderPickup,
  generateOrderManifest,
  printOrderManifest,
  regenerateOrderLabel,
};