const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../../controllers/librarians/auth');

// Register a new librarian
router.post('/register', register);
// Login a librarian
router.post('/login', login);
// Logout a librarian
router.post('/logout', logout);

module.exports = router;