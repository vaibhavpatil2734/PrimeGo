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

const app = express();

/* ===========================
   MIDDLEWARE
=========================== */

// Enable CORS
app.use(cors());

// Parse JSON body
app.use(express.json());

// Parse multipart/form-data (for file uploads)
app.use(express.urlencoded({ extended: true }));

// Security headers (basic)
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

/* ===========================
   ERROR HANDLER
=========================== */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

/* ===========================
   DATABASE CONNECTION
=========================== */


const MONGO_URI = process.env.MONGO_URI; 
const PORT = process.env.PORT || 5000;

// Start server first
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Test Cloudinary connection on startup
  console.log('Testing Cloudinary connection...');
  const cloudinaryTest = await testCloudinaryConnection();
  if (cloudinaryTest.success) {
    console.log('✅ Cloudinary connection successful!');
  } else {
    console.error('❌ Cloudinary connection failed:', cloudinaryTest.error);
  }

  // Connect to MongoDB
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected!");
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1);
    });
});
