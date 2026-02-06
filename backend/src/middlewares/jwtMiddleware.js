const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;
const tokenAlgorithm = process.env.JWT_ALGORITHM;


  //////////////////////////////////////////////////////
  // MIDDLEWARE FUNCTION FOR GENERATING JWT TOKEN
  //////////////////////////////////////////////////////
  const generateToken = (req, res, next) => {
    
    const payload = {
      userid: res.locals.userid,
      role: res.locals.role,
      email: res.locals.email
    };

    const options = {
      algorithm: tokenAlgorithm,
      expiresIn: tokenDuration,
    };

    const callback = (err, token) => {
      if (err) {
        console.error("Error jwt:", err);
        res.status(500).json(err);
      } else {
        res.locals.token = token;
        console.log('🔐 Token generated:', token);
        next();
      }
    };


    // Generate a JWT token with the provided payload and duration
    jwt.sign(payload, secretKey, options, callback);
  }

  //////////////////////////////////////////////////////
  // MIDDLEWARE FUNCTION FOR SENDING JWT TOKEN
  //////////////////////////////////////////////////////
  const sendToken = (req, res, next) => {
    res.status(200).json({
      message: res.locals.message,
      token: res.locals.token,
    });
  }

   //////////////////////////////////////////////////////
  // MIDDLEWARE FUNCTION FOR VERIFYING JWT TOKEN
  //////////////////////////////////////////////////////
  const verifyToken = (req, res, next) => {

    console.log('🔐 verifyToken middleware called');
    console.log('Request path:', req.originalUrl);

    // Get the token from the request headers
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid Authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Authorization header must be in format: Bearer <token>' });
  }
  
  const token = parts[1];
    // Check if the token exists
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const callback = (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Token is valid, store the decoded information for later use
      res.locals.userid = decoded.userid;
      res.locals.role = decoded.role;
      res.locals.email = decoded.email;
      // Move to the next middleware or route handler
      next();
    };
    // Verify the token
    jwt.verify(token, secretKey, callback);
  }

  const verifyAdmin = (req, res, next) => {
    console.log('🔐 verifyAdmin middleware called');
    console.log('Request path:', req.originalUrl);
    console.log('All request headers:', req.headers);
    
    // CHECK FOR BYPASS FIRST - before checking for Authorization header
    // if (req.headers['x-bypass-auth'] === 'true') {
    //     console.log('✅ BYPASS DETECTED: x-bypass-auth header is true');
        
    //     // Create mock admin user
    //     const mockUser = {
    //         userid: 999,
    //         role: 'admin',
    //         email: 'bypass@admin.com',
    //         timestamp: new Date(),
    //         bypassed: true
    //     };
        
    //     // Attach to request
    //     req.user = mockUser;
    //     res.locals.userid = mockUser.userid;
    //     res.locals.role = mockUser.role;
    //     res.locals.tokenTimestamp = mockUser.timestamp;
        
    //     console.log('✅ Mock admin created, proceeding to next middleware');
    //     return next(); // IMPORTANT: return here to skip token check
    // }
    
    // console.log('⚠️ No bypass header, checking for Authorization token...');
    
    // Only check for Authorization if no bypass
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        console.log('🔍 Authorization header found:', authHeader);
        const token = authHeader.substring(7); // Remove 'Bearer '
        console.log('🔍 Token received:', token);
        console.log('🔍 Token length:', token.length);
        console.log('🔍 Token starts with eyJ?:', token.startsWith('eyJ'));
    }

    if (!authHeader) {
        console.log('❌ No Authorization header');
        return res.status(401).json({ 
            error: 'No token provided',
            message: 'Please include Authorization header with Bearer token'
        });
    }
    
    // Check if it's in Bearer format
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
        console.log('❌ Invalid Authorization format');
        return res.status(401).json({ 
            error: 'Invalid token format',
            message: 'Format should be: Bearer <token>'
        });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
        console.log('❌ Invalid Authorization scheme:', scheme);
        return res.status(401).json({ 
            error: 'Invalid authorization scheme',
            message: 'Use Bearer authentication'
        });
    }
    
    if (!token) {
        console.log('❌ Token is empty');
        return res.status(401).json({ error: 'Empty token' });
    }
    
    // Verify the token
    jwt.verify(token, secretKey, function(err, decoded) {
        if (err) {
            console.log('❌ Token verification failed:', err.message);
            
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'Token expired',
                    message: 'Please login again'
                });
            }
            
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    error: 'Invalid token',
                    message: 'Token is malformed or invalid'
                });
            }
            
            return res.status(401).json({ 
                error: 'Token verification failed',
                message: err.message 
            });
        }
        
        console.log('✅ Token decoded successfully');
        console.log('Decoded token:', decoded);
        
        // Check if user has admin role
        if (decoded.role !== 'admin') {
            console.log('❌ User role is not admin. Role:', decoded.role);
            return res.status(403).json({ 
                error: 'Invalid Access Role',
                message: 'Admin role required',
                userRole: decoded.role 
            });
        }
        
        // Attach user info
        req.user = decoded;
        res.locals.userid = decoded.userid;
        res.locals.role = decoded.role;
        res.locals.tokenTimestamp = decoded.timestamp;
        
        console.log('✅ User authenticated as admin');
        next();
    });
  console.log('🔐 Verifying with secret:', secretKey);
console.log('🔐 Token being verified:', token);
};

//////////////////////////////////////////////////////
// DEBUG MIDDLEWARE FOR TESTING
//////////////////////////////////////////////////////
const debugToken = (req, res, next) => {
    console.log('\n=== JWT DEBUG MIDDLEWARE ===');
    console.log('Method:', req.method);
    console.log('Path:', req.originalUrl);
    console.log('Authorization Header:', req.headers.authorization);
    
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
            try {
                // Decode without verification (just to see payload)
                const decoded = jwt.decode(token);
                console.log('Token payload:', decoded);
                
                // Check if token is expired
                if (decoded && decoded.exp) {
                    const now = Math.floor(Date.now() / 1000);
                    const isExpired = decoded.exp < now;
                    console.log('Token expires at:', new Date(decoded.exp * 1000));
                    console.log('Is expired?', isExpired);
                    console.log('Current time:', new Date(now * 1000));
                }
            } catch (error) {
                console.log('Cannot decode token:', error.message);
            }
        }
    } else {
        console.log('No Authorization header found');
    }
    
    console.log('=== END JWT DEBUG ===\n');
    next();
};


module.exports={
  generateToken,
  sendToken,
  verifyToken,
  verifyAdmin,
  debugToken
}