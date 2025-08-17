import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'food-ordering-admin-secret-2024';

// Admin credentials (in production, store in database with hashed passwords)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  pin: '12345'
};

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.admin = decoded;
  next();
}

// Login validation
export function validateLogin(username, pin) {
  return username === ADMIN_CREDENTIALS.username && pin === ADMIN_CREDENTIALS.pin;
}

// Optional: Rate limiting for login attempts (basic implementation)
const loginAttempts = new Map();

export function checkLoginAttempts(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  
  const now = Date.now();
  const timeDiff = now - attempts.lastAttempt;
  
  // Reset attempts after 15 minutes
  if (timeDiff > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  // Block after 5 failed attempts
  if (attempts.count >= 5 && timeDiff < 15 * 60 * 1000) {
    return res.status(429).json({ 
      error: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil((15 * 60 * 1000 - timeDiff) / 1000)
    });
  }
  
  req.loginAttempts = attempts;
  req.clientIp = ip;
  next();
}

export function recordFailedLogin(req) {
  const attempts = req.loginAttempts;
  attempts.count++;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(req.clientIp, attempts);
}

export function clearLoginAttempts(req) {
  loginAttempts.delete(req.clientIp);
}