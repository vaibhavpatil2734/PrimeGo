const axios = require("axios");

let token = null;

const generateToken = async () => {
  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );

  token = res.data.token;
  return token;
};

const createShipment = async (order) => {
  if (!token) {
    await generateToken();
  }

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
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
      billing_email: order.userId.email,

      order_items: order.items.map((item) => ({
        name: item.title,
        sku: item.productId.toString(),
        units: item.quantity,
        selling_price: item.price,
      })),

      payment_method: order.payment.provider === "cash_on_delivery" ? "COD" : "Prepaid",
      sub_total: order.totalAmount,

      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

module.exports = { createShipment, generateToken };
