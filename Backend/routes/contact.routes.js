const express = require('express');
const { createContact, getAllContacts, deleteContact } = require('../controllers/contact.controller');
const auth = require('../middleware/auth'); // Protect admin routes

const router = express.Router();

// Public: Create contact (from frontend form)
router.post('/', createContact);

// Protected: Admin get all contacts
router.get('/', auth, getAllContacts);

// Protected: Admin delete contact
router.delete('/:id', auth, deleteContact);

// Protected: Admin mark contact as read
router.patch('/:id/read', auth, require('../controllers/contact.controller').markAsRead);

module.exports = router;

