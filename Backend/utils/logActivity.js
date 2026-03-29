const ActivityLog = require('../models/activityLog.model');

/**
 * Utility to log user activity
 * @param {Object} req - Express request object
 * @param {String} action - CREATE, UPDATE, DELETE, LOGIN, etc.
 * @param {String} entity - Product, Order, Cart, Wishlist, etc.
 * @param {String|ObjectId} entityId - ID of affected entity
 * @param {String} details - Optional description
 */
const logActivity = async (req, action, entity, entityId, details = '') => {
  // Skip logging if not authenticated
  if (!req.user?._id) {
    console.log(`📝 [GUEST LOG] ${action} ${entity}:${entityId}`);
    return;
  }

  try {
    const userId = req.user._id;
    
    // Get IP address (handle proxy/X-Forwarded-For)
    let ipAddress = req.ip || 
                    req.connection?.remoteAddress || 
                    req.socket?.remoteAddress ||
                    (req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown');
    
    // Clean IP (remove IPv6 prefix)
    if (ipAddress === '::1') ipAddress = '127.0.0.1';
    if (ipAddress?.substr(0, 7) === '::ffff:') ipAddress = ipAddress.substr(7);

    const logData = {
      userId,
      action,
      entity,
      entityId,
      details: details || `${action} ${entity}`,
      ipAddress: ipAddress || 'unknown',
      reqData: {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent')?.substring(0, 500) || 'unknown',
        timestamp: new Date().toISOString()
      }
    };

    await ActivityLog.create(logData);
    console.log(`📝 [LOG] User ${userId.toString().substring(0,6)} - ${action} ${entity}:${entityId}`);
    
  } catch (error) {
    console.error('❌ [LOG ERROR]', error.message);
    // Silent fail - don't crash main flow
  }
};

module.exports = logActivity;

