const axios = require("axios");

let shiprocketToken = null;

// 🔐 Generate Token
const generateToken = async () => {
  if (shiprocketToken) return shiprocketToken;

  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new Error("Shiprocket credentials missing in .env");
  }

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );

  shiprocketToken = res.data.token;
  console.log("✅ [SR-TOKEN] Generated:", shiprocketToken.substring(0, 20) + "...");
  return shiprocketToken;
};

// 📅 FIXED DATE FORMAT (IMPORTANT)
const getFormattedDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// 🚀 Common API Caller
const apiCall = async (method, url, data = {}) => {
  const token = await generateToken();

  console.log(`\n🚀 [SR-API] ${method.toUpperCase()} ${url}`);
  console.log(`🔑 Token: ${token.substring(0, 15)}...`);
  console.log("📦 Payload:", JSON.stringify(data, null, 2));

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

    console.log("✅ [SR-API SUCCESS]:", res.data);
    return res.data;
  } catch (error) {
    console.log("❌ [SR-API ERROR STATUS]:", error.response?.status);
    console.log(
      "❌ [SR-API ERROR DATA]:",
      JSON.stringify(error.response?.data || error.message, null, 2)
    );
    throw error;
  }
};

// 📍 Tracking
const getTracking = async (awbCode) => {
  return apiCall(
    "get",
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`
  );
};

// 📍 Serviceability
const checkServiceability = async (pincode, weight = 0.5, isCod = false) => {
  const token = await generateToken();
  const codValue = isCod ? 1 : 0;

  const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=411014&delivery_postcode=${pincode}&weight=${weight}&cod=${codValue}`;

  console.log(`\n🚀 [SERVICEABILITY] ${url}`);

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("✅ Available Couriers:", res.data.data.available_courier_companies.length);
  return res.data.data.available_courier_companies;
};

// 📦 Create Shipment
const createShipment = async (order) => {
  const fullName = order.shippingAddressId.name || "John Doe";
  const nameParts = fullName.trim().split(" ");

  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt || Date.now()).toISOString(),
    pickup_location: "warehouse",

    billing_customer_name: fullName,
    billing_first_name: nameParts[0] || "John",
    billing_last_name: nameParts.slice(1).join(" ") || "Doe",

    billing_address: order.shippingAddressId.line1,
    billing_city: order.shippingAddressId.city,
    billing_pincode: order.shippingAddressId.postalCode,
    billing_state: order.shippingAddressId.state || "Maharashtra",
    billing_country: "India",

    shipping_is_billing: true,
    billing_phone: order.shippingAddressId.phone,
    billing_email: order.userId?.email,

    order_items: order.items.map((item) => ({
      name: item.title,
      sku: item.productId?.toString(),
      units: item.quantity,
      selling_price: parseFloat(item.price),
    })),

    payment_method:
      order.payment?.provider === "cash_on_delivery" ? "COD" : "Prepaid",

    sub_total: parseFloat(order.totalAmount),

    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
  };

  return apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload
  );
};

// 📍 Assign AWB
const assignAWB = async (shipment_id, courier_company_id) => {
  const payload = {
    shipment_id,
    courier_id: courier_company_id,
  };

  const res = await apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
    payload
  );

  console.log("✅ [AWB ASSIGNED]:", res);
  return res;
};

// 🚚 Generate Pickup (FINAL FIXED)
const generatePickup = async (
  shipment_ids,
  pickup_date = getFormattedDate(),
  pickup_location = "warehouse"
) => {
  const payload = {
    pickup_date,
    shipment_id: Array.isArray(shipment_ids)
      ? shipment_ids
      : [shipment_ids], // ✅ FIXED KEY
    pickup_location,
  };

  console.log("\n🚀 [PICKUP REQUEST]");
  console.log("📦 Shipment ID:", payload.shipment_id);
  console.log("📅 Pickup Date:", pickup_date);
  console.log("📍 Location:", pickup_location);

  const res = await apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
    payload
  );

  // ✅ VALIDATE RESPONSE
  if (!res || res.Status === false) {
    console.log("❌ [PICKUP FAILED]:", res);
    return null;
  }

  console.log("✅ [PICKUP SUCCESS]");
  return res;
};

// 📄 Manifest
const generateManifest = async (shipment_ids) => {
  return apiCall("post",
    "https://apiv2.shiprocket.in/v1/external/manifests/generate",
    { shipment_ids: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids] }
  );
};

const printManifest = async (shipment_ids) => {
  return apiCall("post",
    "https://apiv2.shiprocket.in/v1/external/manifests/print",
    { shipment_ids: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids] }
  );
};

// 🏷 Label (SAFE)
const generateLabel = async (shipment_id) => {
  console.log("\n🏷 Generating Label...");
  return apiCall(
    "get",
    `https://apiv2.shiprocket.in/v1/external/courier/generate/label/${shipment_id}`
  );
};

// 🧾 Invoice
const printInvoice = async (order_id) => {
  return apiCall(
    "get",
    `https://apiv2.shiprocket.in/v1/external/orders/print/invoice/${order_id}`
  );
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