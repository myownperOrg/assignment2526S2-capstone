// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../../config'); // Adjust path as needed

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      error: 'No authorization header provided' 
    });
  }
  
  // Split 'Bearer <token>'
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      success: false,
      error: 'Authorization header must be in format: Bearer <token>' 
    });
  }
  
  const token = parts[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'No token provided' 
    });
  }
  
  jwt.verify(token, config.secretKey, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }
    
    // Attach user to request object
    req.user = user;
    console.log('Token verified for user:', user);
    next();
  });
};

module.exports = {
  authenticateToken
};