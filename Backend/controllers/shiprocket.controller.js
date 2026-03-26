const Order = require('../models/order.model');
const {
  checkServiceability,
  assignAWB,
  generatePickup,
  generateManifest,
  printManifest,
  generateLabel,
  printInvoice,
} = require('../services/shiprocket.service');

/**
 * Admin: Generate pickup for order (if not already booked)
 */
const generateOrderPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('shippingAddressId');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.pickupBooked) return res.status(400).json({ error: 'Pickup already booked' });

    const result = await generatePickup(order.shipmentId);
    order.pickupBooked = true;
    await order.save();

    res.json({ success: true, data: result, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin: Generate manifest (multiple shipments)
 */
const generateOrderManifest = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order.shipmentId) return res.status(400).json({ error: 'No shipment ID' });

    const result = await generateManifest(order.shipmentId);
    res.json({ success: true, data: result });
  } catch (error) {
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

    const result = await printManifest(order.shipmentId);
    order.manifestPdf = result.pdf || result.manifest_pdf_url; // Adapt to response
    await order.save();
    res.json({ success: true, pdf: order.manifestPdf, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin: Regenerate label PDF
 */
const regenerateOrderLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order.shipmentId) return res.status(400).json({ error: 'No shipment ID' });

    const result = await generateLabel(order.shipmentId);
    order.labelPdf = result.pdf || result.label_pdf_url;
    await order.save();
    res.json({ success: true, pdf: order.labelPdf, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateOrderPickup,
  generateOrderManifest,
  printOrderManifest,
  regenerateOrderLabel,
};
