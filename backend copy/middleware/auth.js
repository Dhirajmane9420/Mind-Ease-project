// middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-very-secret-key-that-is-long-and-random'; // Must be the same secret key

module.exports = function(req, res, next) {
    // 1. Get token from the Authorization header
    const authHeader = req.header('Authorization');
    
    // Check for 'Bearer ' format and extract token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. If valid, add user payload to the request object
        req.user = decoded.user;
        next(); // Move on to the next function (the main route logic)
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};