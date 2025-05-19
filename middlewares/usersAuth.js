const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    const token = req.session.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = decoded; // Attach user info to request
        next();
    });
}

// Middleware to check user role
const hasRole = (role) => (req, res, next) => {
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
};

module.exports = { isAuthenticated, hasRole };