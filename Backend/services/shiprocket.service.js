const axios = require("axios");

let token = null;

// 🔐 Generate Token (shared)
const generateToken = async () => {
  try {
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      throw new Error('Shiprocket credentials missing in .env');
    }
    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    token = res.data.token;
    console.log("🚀 [SR-TOKEN] Credentials used: email=" + process.env.SHIPROCKET_EMAIL + ", password=***MASKED***");
    console.log("🚀 [SR-TOKEN] Full response:", JSON.stringify(res.data, null, 2));
    console.log("🚀 [SR-TOKEN] Extracted token:", token ? token.substring(0, 20) + "..." : "NULL");
    console.log("✅ Shiprocket token generated");
    return token;
  } catch (error) {
    console.error("❌ Shiprocket token error:", error.message);
    throw error;
  }
};

// 🚚 Ensure token for all calls
const ensureToken = async () => {
  if (!token) await generateToken();
};

// Generic API caller with token retry
const apiCall = async (method, url, data = {}) => {
  await ensureToken();
  console.log(`🚀 [SR-API] ${method.toUpperCase()} ${url}`);
  console.log(`🚀 [SR-API] Headers: Authorization=Bearer ${token ? token.substring(0, 20) + '...' : 'MISSING'}`);
  console.log(`🚀 [SR-API] Data:`, JSON.stringify(data, null, 2));
  try {
    const res = await axios({
      method,
      url,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("🔄 Token expired, regenerating...");
      await generateToken();
      return apiCall(method, url, data); // retry once
    }
    console.log(`🚀 [SR-API] Full ERROR response:`, JSON.stringify(error.response?.data || error.message, null, 2));
    console.log(`🚀 [SR-API] ERROR status:`, error.response?.status);
    console.error(`❌ Shiprocket ${method.toUpperCase()} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 1. FIXED Tracking - Step 11
const getTracking = async (awbCode) => {
  return apiCall('get', `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`);
};

// ✅ 2. Serviceability Check - Step 3 prep
const checkServiceability = async (pincode, weight = 0.5, isCod = false) => {
  console.log(`🚀 [SR-SERVICEABILITY] Inputs: pincode=${pincode}, weight=${weight}, isCod=${isCod}`);
  const data = {
    pickup_postcode: "411014", // Default Pune
    delivery_postcode: pincode,
    weight,
    cod: isCod ? 0 : 1, // 0=Prepaid, 1=COD? Check docs
  };
  const fullUrl = 'https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=411014&delivery_postcode=' + pincode + '&weight=' + weight + '&cod=' + (isCod ? 0 : 1);
  console.log(`🚀 [SR-SERVICEABILITY] Full URL: ${fullUrl}`);
  const result = await apiCall('get', fullUrl);
  console.log(`🚀 [SR-SERVICEABILITY] Success response:`, JSON.stringify(result, null, 2));
  return result;
};

// 🚚 Create Shipment - UPDATED dynamic - Step 3
const createShipment = async (order) => {
  if (!order.shippingAddressId?.postalCode) {
    throw new Error('Shipping address required for shipment');
  }
  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt || Date.now()),
    pickup_location: "Primary",
    billing_customer_name: order.shippingAddressId.name,
    billing_address: order.shippingAddressId.line1,
    billing_city: order.shippingAddressId.city,
    billing_pincode: order.shippingAddressId.postalCode,
    billing_state: order.shippingAddressId.state,
    billing_country: "India",
    billing_phone: order.shippingAddressId.phone,
    billing_email: order.userId?.email,
    order_items: order.items.map((item) => ({
      name: item.title,
      sku: item.productId?.toString() || "SKU",
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: order.payment?.provider === "cash_on_delivery" ? "COD" : "Prepaid",
    sub_total: order.totalAmount,
    length: order.packageDimensions?.length || 10,
    breadth: order.packageDimensions?.breadth || 10,
    height: order.packageDimensions?.height || 10,
    weight: order.packageDimensions?.weight || 0.5,
  };
  return apiCall('post', 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', payload);
};

// ✅ 4. Assign AWB
const assignAWB = async (shipment_id, courier_code = 'fedex') => {
  const payload = {
    shipment_id,
    courier_id: courier_code, // e.g. 'fedex', from serviceability
  };
  return apiCall('post', 'https://apiv2.shiprocket.in/v1/external/courier/assign/awb', payload);
};

// ✅ 5. Generate Pickup
const generatePickup = async (shipment_ids, pickup_date = new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0]) => {
  const payload = {
    pickup_date,
    pickup_location: "Primary",
    shipment_ids: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids],
  };
  return apiCall('post', 'https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', payload);
};

// ✅ 6-7. Manifests
const generateManifest = async (shipment_ids) => {
  const payload = { shipment_ids: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids] };
  return apiCall('post', 'https://apiv2.shiprocket.in/v1/external/manifests/generate', payload);
};

const printManifest = async (shipment_ids) => {
  const payload = { shipment_ids: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids] };
  return apiCall('post', 'https://apiv2.shiprocket.in/v1/external/manifests/print', payload);
};

// ✅ 9. Label
const generateLabel = async (shipment_id) => {
  return apiCall('get', `https://apiv2.shiprocket.in/v1/external/courier/generate/label/${shipment_id}`);
};

// ✅ 10. Invoice
const printInvoice = async (order_id) => {
  return apiCall('get', `https://apiv2.shiprocket.in/v1/external/orders/print/invoice/${order_id}`);
};

module.exports = {
  generateToken,
  createShipment,
  getTracking,
  checkServiceability,
  assignAWB,
  generatePickup,
  generateManifest,
  printManifest,
  generateLabel,
  printInvoice,
};
