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
    const {
      userId,
      entity,
      action,
      from,
      to,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (entity) filter.entity = entity;
    if (action) filter.action = action;
    
    // Date filtering
    const now = new Date();
    if (from) {
      filter.createdAt = { $gte: new Date(from) };
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      if (filter.createdAt) {
        filter.createdAt.$lte = toDate;
      } else {
        filter.createdAt = { $lte: toDate };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total
      }
    });
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

const json2csv = require('json2csv').parse;

const exportLogs = async (req, res) => {
  try {
    const {
      from,
      to,
      userId,
      limit = 1000
    } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    
    // Date filtering
    const now = new Date();
    if (from) {
      filter.createdAt = { $gte: new Date(from) };
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      if (filter.createdAt) {
        filter.createdAt.$lte = toDate;
      } else {
        filter.createdAt = { $lte: toDate };
      }
    }

    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const jsonContent = JSON.stringify(logs, null, 2);

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="made4uu-logs-${new Date().toISOString().split('T')[0]}.json"`,
      'Content-Length': Buffer.byteLength(jsonContent)
    });
    res.send(jsonContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: "Export failed" });
  }
};

module.exports = {
  createLog,
  getLogs,
  getLogById,
  deleteLog,
  exportLogs
};
