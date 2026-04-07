const axios = require("axios");

let shiprocketToken = null;

// 🔐 Generate Token
const generateToken = async () => {
  console.log("🔒 DEBUG: generateToken called");

  if (shiprocketToken) {
    console.log("🔒 DEBUG: Using cached token");
    return shiprocketToken;
  }

  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new Error("Shiprocket credentials missing in .env");
  }

  console.log("🔒 DEBUG: Fetching new token...");
  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    },
  );

  shiprocketToken = res.data.token;
  console.log(`✅ [SR-TOKEN GENERATED] length: ${shiprocketToken.length}`);
  return shiprocketToken;
};

// 📅 FIXED PICKUP DATE - Today only + smart cutoffs
const getPickupDate = (daysAhead = 0) => {  // ✅ TODAY ONLY by default
  console.log(`🔍 DEBUG: getPickupDate called with daysAhead=${daysAhead}`);
  
  let d = new Date();
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  console.log(`🔍 DEBUG: Current: ${now.toISOString()} | Hour:${hour} | Day:${day}`);

  // 🚨 FRIDAY 4PM+ → Skip to Monday (+3 days)
  if (day === 5 && hour >= 16) {  // Friday after 4PM
    console.log("🚨 FRIDAY 4PM+ → Skipping to Monday");
    d.setDate(d.getDate() + 3);  // Fri → Mon
  } 
  // SAT/SUN → Monday (+1 or +2)
  else if (day === 6) {  // Saturday
    console.log("🚨 Saturday → Monday (+2)");
    d.setDate(d.getDate() + 2);
  } 
  else if (day === 0) {  // Sunday
    console.log("🚨 Sunday → Monday (+1)");
    d.setDate(d.getDate() + 1);
  }
  // Weekdays: Today only (daysAhead=0 already)

  // Skip any remaining weekends (backup)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }

  // ✅ Timezone-safe YYYY-MM-DD
  const dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
  
  // 🛑 Holiday blacklist (major ones)
  const holidays = ['2024-12-25', '2025-01-26', '2025-03-31']; // Christmas, Republic, Holi
  if (holidays.includes(dateStr)) {
    console.log(`🚨 Holiday detected: ${dateStr} → Next day`);
    d.setDate(d.getDate() + 1);
    const fallbackStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
      .toISOString().split('T')[0];
    return fallbackStr;
  }

  console.log(`📅 FINAL Pickup: ${dateStr} (Day:${d.getDay()} | Weekday:${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]})`);
  return dateStr;
};
// 🚀 Common API Caller
const apiCall = async (method, url, data = {}) => {
  const token = await generateToken();

  console.log(`\n🚀 [SR-API] ${method.toUpperCase()} ${url}`);
  console.log("📦 Payload:", JSON.stringify(data, null, 2));
  console.log("the token :", token);
  try {
    const res = await axios({
      method,
      url,
      data: method.toLowerCase() === "get" ? undefined : data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `🔍 DEBUG API: HTTP ${res.status} | SR Status: ${res.data.Status}`,
    );

    if (res.data.Status === false) {
      console.log("⚠️ [SR BUSINESS ERROR]:", JSON.stringify(res.data, null, 2));
    } else {
      console.log("✅ [SR SUCCESS]:", res.data);
    }
    return res.data;
  } catch (error) {
    console.log("❌ [SR ERROR STATUS]:", error.response?.status);
    console.log(
      "❌ [SR ERROR DATA]:",
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
    throw error;
  }
};

// 📍 Tracking
const getTracking = async (awbCode) => {
  return apiCall(
    "get",
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
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
    res.data.data.available_courier_companies.length,
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
    payload,
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
    },
  );
};

// 🚚 Generate Pickup (FINAL FIXED)
const generatePickup = async (shipment_id) => {
  console.log(
    `🔍 DEBUG: generatePickup called - shipment_id="${shipment_id}" (type: ${typeof shipment_id})`,
  );

  const pickup_date = getPickupDate();
  const num_shipment_id = Number(shipment_id);
  console.log(
    `🔍 DEBUG: Number(shipment_id)=${num_shipment_id} (isNaN=${isNaN(num_shipment_id)})`,
  );

  const payload = {
    shipment_id: [num_shipment_id]
  };
// Removed pickup_date logging
  console.log(`🔍 DEBUG: JSON.stringify(payload)=${JSON.stringify(payload)}`);
  console.log("\n🚀 [PICKUP REQUEST]");
  console.log("📦 Shipment:", payload.shipment_id);
// Removed pickup_date logging

  const res = await apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
    payload,
  );

  console.log("🔍 DEBUG: Full SR response:", JSON.stringify(res, null, 2));
  console.log(
    `🔍 DEBUG: res.Status="${res.Status}" | res.Message="${res.Message}"`,
  );

  // ❌ DO NOT mark success blindly
  if (!res || res.Status === false) {
    console.log("❌ [PICKUP FAILED]:", res);
    return res;
  }

  console.log("✅ [PICKUP SUCCESS]");
  return res;
};

// 🏷 Generate Label (ONLY AFTER PICKUP)
const generateLabel = async (shipment_id) => {
  console.log("\n🏷 Generating Label...");

  return apiCall(
    "get",
    `https://apiv2.shiprocket.in/v1/external/courier/generate/label/${shipment_id}`,
  );
};

// 📄 Manifest
const generateManifest = async (shipment_ids) => {
  return apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/manifests/generate",
    {
      shipment_ids: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids],
    },
  );
};

const printManifest = async (shipment_ids) => {
  return apiCall(
    "post",
    "https://apiv2.shiprocket.in/v1/external/manifests/print",
    {
      shipment_ids: Array.isArray(shipment_ids) ? shipment_ids : [shipment_ids],
    },
  );
};

// 🧾 Invoice
const printInvoice = async (shiprocket_order_id) => {
  console.log("🧾 Invoice for Shiprocket order:", shiprocket_order_id);
  return apiCall(
    "get",
    `https://apiv2.shiprocket.in/v1/external/orders/print/invoice/${shiprocket_order_id}`,
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
