const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, bollowBook, getAllBorowedBooks } = require('../../controllers/users/books');
const { isAuthenticated, hasRole } = require('../../middlewares/usersAuth');

// Get all books
router.get('/', isAuthenticated, hasRole('user'), getAllBooks);
// Get a book by ID
router.get('/onebook/:id', isAuthenticated, hasRole('user'), getBookById);
// Borrow a book
router.post('/borrow', isAuthenticated, hasRole('user'), bollowBook);
// Get all borrowed books
router.get('/borrowed', isAuthenticated, hasRole('user'), getAllBorowedBooks);

module.exports = router;