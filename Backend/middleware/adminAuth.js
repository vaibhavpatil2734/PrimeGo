const auth = require('./auth');

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

module.exports = adminAuth;
