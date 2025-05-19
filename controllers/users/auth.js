const jwt = require('jsonwebtoken');
const bycrypt = require('bcryptjs');

const { getDb } = require('../../config/db');

const generateToken = (user) => {
    return jwt.sign({ id: user.id, name: user.name, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const login = async (req, res) => {
    const { name, password, phone } = req.body;
    if (!name || !password || !phone) {
        return res.status(400).json({ error: 'Name and password are required' });
    }
    try {
        const db = getDb();
        const [user] = await db.query('SELECT * FROM Members WHERE name = ? OR phone = ?', [name, phone]);

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bycrypt.compare(password, user[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = generateToken(user[0]);
        req.session.token = token; // Store token in session
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



    
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
}

module.exports = {
    login,
    logout
};