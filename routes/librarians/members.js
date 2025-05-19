const express = require('express');
const router = express.Router();
const { getAllMembers, getMemberById, updateMember, deleteMember, createMember } = require('../../controllers/librarians/members');
const { isAuthenticated, hasRole } = require('../../middlewares/librarianAuth');

// Get all members
router.get('/', isAuthenticated, hasRole('admin'), getAllMembers);
// Get a member by ID
router.get('/:id', isAuthenticated, hasRole('admin'), getMemberById);
// Add a new member
router.post('/', isAuthenticated, hasRole('admin'), createMember);
// Update a member
router.put('/:id', isAuthenticated, hasRole('admin'), updateMember);
// Delete a member
router.delete('/:id', isAuthenticated, hasRole('admin'), deleteMember);

// Export the router
module.exports = router;