const jwt = require('jsonwebtoken');
require('dotenv').config();

// Requires a valid JWT. Rejects the request if missing/invalid.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid or expired token' });
  }
}

// Attaches req.user if a valid token is present, but does not block the request.
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      req.user = null;
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
