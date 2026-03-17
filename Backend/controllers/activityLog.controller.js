const ActivityLog = require("../models/activityLog.model");

/**
 * Create a new activity log entry
 * @body { userId, action, entity, entityId, ipAddress }
 */
const createLog = async (req, res) => {
  try {
    const { userId, action, entity, entityId, ipAddress } = req.body;

    if (!userId || !action || !entity || !entityId || !ipAddress) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const log = await ActivityLog.create({
      userId,
      action,
      entity,
      entityId,
      ipAddress
    });

    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create activity log" });
  }
};

/**
 * Get all logs (with optional filtering)
 * Query params: userId, entity, action
 */
const getLogs = async (req, res) => {
  try {
    const { userId, entity, action } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (entity) filter.entity = entity;
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
};

/**
 * Get single log by ID
 */
const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await ActivityLog.findById(id);

    if (!log) return res.status(404).json({ message: "Log not found" });

    res.json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch log" });
  }
};

/**
 * Delete a log by ID
 */
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await ActivityLog.findByIdAndDelete(id);

    if (!log) return res.status(404).json({ message: "Log not found" });

    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete log" });
  }
};

module.exports = {
  createLog,
  getLogs,
  getLogById,
  deleteLog
};