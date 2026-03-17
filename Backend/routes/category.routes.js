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

router.post('/', createCategory);                 // Admin
router.get('/', getAllCategories);                // Public
router.get('/tree', getCategoryTree);              // Public
router.get('/:slug', getCategoryBySlug);           // Public
router.put('/:id', updateCategory);                // Admin
router.patch('/:id/status', toggleCategoryStatus); // Admin

module.exports = router;
