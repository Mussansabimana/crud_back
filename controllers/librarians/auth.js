const { getDb } = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    try {
        const db = getDb();
        const existingLibrarian = await db.query('SELECT * FROM Librarians WHERE name = ?', [name]);
        if (existingLibrarian[0].length > 0) {
            return res.status(400).json({ error: 'Librarian with this name already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO Librarians (name, password) VALUES (?, ?)', [name, hashedPassword]);

        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const generateToken = (librarian) => {
    return jwt.sign({ id: librarian.id, name: librarian.name, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

exports.login = async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    try {
        const db = getDb();
        const [rows] = await db.query('SELECT * FROM Librarians WHERE name = ?', [name]);
        const librarian = rows[0];

        if (!librarian) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, librarian.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(librarian);
        // Store the token in the session
        req.session.token = token;
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
}