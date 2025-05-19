const { getDb } = require('../../config/db');
const bcrypt = require('bcryptjs');

const getAllMembers = async (req, res) => {
    try {
        const db = getDb();
        const [members] = await db.query('SELECT * FROM Members');
        res.status(200).json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getMemberById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Member ID is required' });
    }
    try {
        const db = getDb();

        const [member] = await db.query('SELECT * FROM Members WHERE id = ?', [id]);

        if (member.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.status(200).json(member[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const createMember = async (req, res) => {
    const { name, phone, password, status, class: memberClass } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }

    try {
        const db = getDb();
        const existingMember = await db.query('SELECT * FROM Members WHERE name = ? OR phone = ?', [name, phone]);

        if (existingMember[0].length > 0) {
            return res.status(400).json({ error: 'Member with this phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO Members (name, phone, password, status, class) VALUES (?, ?, ?, ?, ?)', [name, phone, hashedPassword, status || 'student', memberClass || null]);

        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const updateMember = async (req, res) => {
    const { id } = req.params;
    const { name, phone, password, status, class: memberClass } = req.body;
    if (!name && !phone && !password && !status && !memberClass) {
        return res.status(400).json({ error: 'At least one field is required to update' });
    }

    try {
        const db = getDb();
        if (!id) {
            return res.status(400).json({ error: 'Member ID is required' });
        }
        const [result] = await db.query('UPDATE Members SET name = ?, phone = ?, password = ?, status = ?, class = ? WHERE id = ?', [name, phone, password, status, memberClass, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.status(200).json({ message: 'Member updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const deleteMember = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Member ID is required' });
    }
    try {
        const db = getDb();


        const [result] = await db.query('DELETE FROM Members WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getAllMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember
}