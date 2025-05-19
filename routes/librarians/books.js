const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, getAllBooksBorrowed, acceptBookIsReturned, deleteBook } = require('../../controllers/librarians/books');
const { isAuthenticated, hasRole } = require('../../middlewares/librarianAuth');

// Get all books
router.get('/', isAuthenticated, hasRole('admin'), getAllBooks);
// Get a book by ID
router.get('/onebook/:id', isAuthenticated, hasRole('admin'), getBookById);
// Create a new book
router.post('/', isAuthenticated, hasRole('admin'), createBook);
// Update a book
router.put('/onebook/:id', isAuthenticated, hasRole('admin'), updateBook);
// Get all borrowed books
router.get('/borrowed', isAuthenticated, hasRole('admin'), getAllBooksBorrowed);
// Accept a book as returned
router.post('/:id/return', isAuthenticated, hasRole('admin'), acceptBookIsReturned);
// Delete a book
router.delete('/:id', isAuthenticated, hasRole('admin'), deleteBook);

// Export the router
module.exports = router;