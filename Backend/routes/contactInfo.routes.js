const express = require('express');
const router = express.Router();
const { getContactInfo, updateContactInfo } = require('../controllers/contactInfo.controller');
const auth = require('../middleware/auth');

// Public GET, protected PATCH
router.get('/', getContactInfo);
router.patch('/', auth, updateContactInfo);

module.exports = router;

