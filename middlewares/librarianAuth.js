const jwt = require('jsonwebtoken');
const isAuthenticated = (req, res, next) => {
    const token = req.session.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.librarian = decoded; // Attach librarian info to request
        next();
    });
};

// Middleware to check librarian role
const hasRole = (role) => (req, res, next) => {
    if (!req.librarian || req.librarian.role !== role) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
};

module.exports = { isAuthenticated, hasRole };