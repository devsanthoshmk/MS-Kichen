import express from 'express';
import { 
  validateLogin, 
  generateToken, 
  authenticateAdmin,
  checkLoginAttempts,
  recordFailedLogin,
  clearLoginAttempts
} from '../middleware/auth.js';

const router = express.Router();

// Admin login
router.post('/login', checkLoginAttempts, (req, res) => {
  try {
    const { username, pin } = req.body;
    
    if (!username || !pin) {
      return res.status(400).json({ error: 'Username and PIN are required' });
    }
    
    if (validateLogin(username, pin)) {
      const token = generateToken({ 
        username,
        role: 'admin',
        loginTime: new Date().toISOString()
      });
      
      // Clear failed login attempts on successful login
      clearLoginAttempts(req);
      
      res.json({ 
        success: true,
        token,
        user: { username, role: 'admin' },
        message: 'Login successful'
      });
    } else {
      // Record failed login attempt
      recordFailedLogin(req);
      
      res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Please check your username and PIN'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Verify token (for frontend to check if user is still authenticated)
router.get('/verify', authenticateAdmin, (req, res) => {
  res.json({ 
    success: true,
    user: { 
      username: req.admin.username,
      role: req.admin.role,
      loginTime: req.admin.loginTime
    },
    message: 'Token is valid'
  });
});

// Logout (optional - mainly for clearing client-side data)
router.post('/logout', authenticateAdmin, (req, res) => {
  res.json({ 
    success: true,
    message: 'Logged out successfully'
  });
});

// Get admin profile
router.get('/profile', authenticateAdmin, (req, res) => {
  res.json({
    username: req.admin.username,
    role: req.admin.role,
    loginTime: req.admin.loginTime
  });
});

export default router;