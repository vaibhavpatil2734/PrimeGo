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
  console.log("✅ [SR-TOKEN GENERATED]");
  return shiprocketToken;
};

// 📅 MAIN PICKUP DATE FUNCTION (used everywhere)
const getPickupDate = (daysAhead = 3) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  
  // Skip weekends
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  
  // Cap at +7 days
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  if (d > maxDate) d = new Date();
  
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  
  const dateStr = `${yyyy}-${mm}-${dd}`;
  console.log(`📅 Pickup date (+${daysAhead}d): ${dateStr}`);
  
  return dateStr;
};

// 🚀 Common API Caller
const apiCall = async (method, url, data = {}) => {
  const token = await generateToken();

  console.log(`\n🚀 [SR-API] ${method.toUpperCase()} ${url}`);
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

    console.log("✅ [SR SUCCESS]:", res.data);
    return res.data;
  } catch (error) {
    console.log("❌ [SR ERROR STATUS]:", error.response?.status);
    console.log(
      "❌ [SR ERROR DATA]:",
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

  console.log(
    "✅ Available Couriers:",
    res.data.data.available_courier_companies.length
  );

  return res.data.data.available_courier_companies;
};

// 📦 Create Shipment (UPDATED FROM OFFICIAL FORMAT)
const createShipment = async (order) => {
  const fullName = order.shippingAddressId.name || "Customer";
  const nameParts = fullName.trim().split(" ");

  const payload = {
    order_id: order._id.toString(),

    // ✅ FIXED FORMAT (Shiprocket friendly)
    order_date: new Date().toISOString().slice(0, 19).replace("T", " "),

    pickup_location: "warehouse",

    billing_customer_name: nameParts[0] || "Customer",
    billing_last_name: nameParts.slice(1).join(" ") || "User",

    billing_address: order.shippingAddressId.line1,
    billing_address_2: "",

    billing_city: order.shippingAddressId.city,
    billing_pincode: order.shippingAddressId.postalCode,
    billing_state: order.shippingAddressId.state || "Maharashtra",
    billing_country: "India",

    billing_email: order.userId?.email || "test@example.com",
    billing_phone: order.shippingAddressId.phone || "9999999999",

    shipping_is_billing: true,

    order_items: order.items.map((item) => ({
      name: item.title,
      sku: item.productId?.toString(),
      units: item.quantity,
      selling_price: parseFloat(item.price),
    })),

    payment_method:
      order.payment?.provider === "cash_on_delivery"
        ? "COD"
        : "Prepaid",

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
const assignAWB = async (shipment_id, courier_id) => {
  return apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
    {
      shipment_id,
      courier_id,
    }
  );
};

// 🚚 Generate Pickup (FINAL FIXED)
const generatePickup = async (shipment_id) => {
  const pickup_date = getPickupDate(3);
  
  const payload = {
    pickup_date,
    shipment_id,
    pickup_location: "warehouse",
  };

  console.log("\n🚀 [PICKUP REQUEST]");
  console.log("📦 Shipment:", payload.shipment_id);
  console.log("📅 Date:", payload.pickup_date);

  const res = await apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
    payload
  );

  // ❌ DO NOT mark success blindly
  if (!res || res.Status === false) {
    console.log("❌ [PICKUP FAILED]:", res);
    return null;
  }

  console.log("✅ [PICKUP SUCCESS]");
  return res;
};

// 🏷 Generate Label (ONLY AFTER PICKUP)
const generateLabel = async (shipment_id) => {
  console.log("\n🏷 Generating Label...");

  return apiCall(
    "get",
    `https://apiv2.shiprocket.in/v1/external/courier/generate/label/${shipment_id}`
  );
};

// 📄 Manifest
const generateManifest = async (shipment_ids) => {
  return apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/manifests/generate",
    {
      shipment_ids: Array.isArray(shipment_ids)
        ? shipment_ids
        : [shipment_ids],
    }
  );
};

const printManifest = async (shipment_ids) => {
  return apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/manifests/print",
    {
      shipment_ids: Array.isArray(shipment_ids)
        ? shipment_ids
        : [shipment_ids],
    }
  );
};

// 🧾 Invoice
const printInvoice = async (shiprocket_order_id) => {
  console.log("🧾 Invoice for Shiprocket order:", shiprocket_order_id);
  return apiCall(
    "get",
    `https://apiv2.shiprocket.in/v1/external/orders/print/invoice/${shiprocket_order_id}`
  );
};

module.exports = {
  generateToken,
  createShipment,
  getTracking,
  checkServiceability,
  assignAWB,
  generatePickup,
  generateLabel,
  generateManifest,
  printManifest,
  printInvoice,
};