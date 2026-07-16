const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'catalyst-super-secret-key-12345';

// Middleware to verify JWT cookie
const verifyToken = (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, username, role, etc.
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid or expired session.' });
  }
};

// Middleware for RBAC
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied. Unknown role.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
  JWT_SECRET
};
