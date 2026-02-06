const jwt = require('jsonwebtoken');
const config = require('../../config');

var authorizer = {
    verifyToken: function (req, res, next) {
        console.log('=== VERIFY TOKEN MIDDLEWARE START ===');
        console.log('Request URL:', req.originalUrl);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        
        var token = req.headers["authorization"];
        console.log('Raw token header:', token);

        if (token && token.includes("Bearer")) {
            token = token.split(" ")[1];
            console.log('JWT token:', token.substring(0, 50) + '...');
            
            jwt.verify(token, config.secretKey, function (err, payload) {
                if (err) {
                    console.log('❌ Token verification FAILED:', err.message);
                    console.log('Error details:', err);
                    res.status(401).json({"Message":"You are not authorized"});
                } else {
                    console.log('✅ Token verification SUCCESS');
                    console.log('Token payload:', payload);
                    
                    // Set request properties
                    req.userid = payload.userid || payload.username;
                    req.username = payload.username;
                    req.role = payload.role;
                    req.payload = payload;
                    
                    console.log(`User authenticated: ${req.username}, Role: ${req.role}`);
                    console.log('=== VERIFY TOKEN MIDDLEWARE END ===');
                    next();
                }
            });
        } else {
            console.log('❌ No Bearer token found in headers');
            res.status(401).json({"Message":"You are not authorized"});
        }
    }
};

module.exports = authorizer;