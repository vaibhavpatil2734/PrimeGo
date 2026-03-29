// routes/category.routes.js
const express = require('express');
const {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  toggleCategoryStatus,
  getCategoryTree
} = require('../controllers/category.controller');

const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', getAllCategories);
router.get('/tree', getCategoryTree);
router.get('/:slug', getCategoryBySlug);

// Admin protected routes
router.post('/', adminAuth, createCategory);
router.put('/:id', adminAuth, updateCategory);
router.patch('/:id/status', adminAuth, toggleCategoryStatus);

module.exports = router;
