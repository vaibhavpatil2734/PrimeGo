require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { testCloudinaryConnection } = require("./config/cloudinary");

// Routes
const authRoute = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const orderRoutes = require("./routes/order.routes");
const addressRoutes = require("./routes/address.routes");
const cartRoutes = require("./routes/cart.routes");
const activityLogRoutes = require("./routes/activityLog.routes");
const adminRoutes = require("./routes/admin.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const contactRoutes = require("./routes/contact.routes");
const contactInfoRoutes = require("./routes/contactInfo.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

/* ===========================
   CORS CONFIG (IMPORTANT)
=========================== */

const allowedOrigins = [
"http://localhost:3000",
  "http://localhost:5173",
  "https://made4uu.netlify.app", // frontend
  "https://apiv2.shiprocket.in",
  "*.shiprocket.in",
  "*.shiprocket.co",
  "apiv2.shiprocket.in" // Shiprocket webhooks
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

/* ===========================
   MIDDLEWARE
=========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

/* ===========================
   ROUTES
=========================== */

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// API routes
app.use("/api/user", authRoute);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/contact-info", contactInfoRoutes);
app.use("/api/payment", paymentRoutes);

/* ===========================
   ERROR HANDLER
=========================== */

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* ===========================
   DATABASE CONNECTION
=========================== */

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Test Cloudinary
  console.log("Testing Cloudinary connection...");
  const cloudinaryTest = await testCloudinaryConnection();
  if (cloudinaryTest.success) {
    console.log("✅ Cloudinary connection successful!");
  } else {
    console.error("❌ Cloudinary connection failed:", cloudinaryTest.error);
  }

  // Connect MongoDB
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected!"))
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1);
    });
});