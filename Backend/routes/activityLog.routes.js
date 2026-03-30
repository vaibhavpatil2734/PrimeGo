const express = require("express");
const {
  createLog,
  getLogs,
  getLogById,
  deleteLog,
  exportLogs
} = require("../controllers/activityLog.controller");

const router = express.Router();

/* ==========================
   ACTIVITY LOG ROUTES
========================== */

// Create a new log entry
router.post("/", createLog);

// Get all logs (with optional query filters) - Admin only
const adminAuth = require("../middleware/adminAuth");
router.get("/", adminAuth, getLogs);

// Get a single log by ID - Admin only
router.get("/:id", adminAuth, getLogById);

// Delete a log by ID - Admin only
router.delete("/:id", adminAuth, deleteLog);
router.get("/export", adminAuth, exportLogs);

module.exports = router;