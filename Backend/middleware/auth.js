const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the header - check both 'auth-token' and 'Authorization: Bearer'
  let token = req.header('auth-token');
  
  // Also check Authorization header with Bearer token
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  if (!token) return res.status(401).send('Access Denied');

  try {
    // 2. Verify the token using your secret key
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next(); // Let them pass
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};
