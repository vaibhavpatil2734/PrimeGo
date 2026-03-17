const express = require("express");
const {
  createLog,
  getLogs,
  getLogById,
  deleteLog
} = require("../controllers/activityLog.controller");

const router = express.Router();

/* ==========================
   ACTIVITY LOG ROUTES
========================== */

// Create a new log entry
router.post("/", createLog);

// Get all logs (with optional query filters)
router.get("/", getLogs);

// Get a single log by ID
router.get("/:id", getLogById);

// Delete a log by ID
router.delete("/:id", deleteLog);

module.exports = router;