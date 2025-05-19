const express = require('express');
const router = express.Router();
const { login, logout } = require('../../controllers/users/auth');
const {  isAuthenticated } = require('../../middlewares/usersAuth');

// Route to login an existing user
router.post('/login', login);
// Route to logout the user
router.post('/logout', isAuthenticated, logout);

// export the router to be used in the main app
module.exports = router;