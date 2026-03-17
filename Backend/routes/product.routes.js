const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProductsTitle,
  updateProduct,
  deleteProduct,
  updateProductStock,
  uploadProductImages,
  deleteProductImage,
  getProductImageById
} = require('../controllers/product.controller');

const { upload } = require('../config/cloudinary');

const router = express.Router();

/**
 * Public Routes
 */
router.get('/', getAllProducts); // Get all products (with filters & pagination)
router.get('/category/:categoryId', getProductsByCategory); // Get products by category - MUST be before /:id
router.get('/featured', getAllProducts); // Get featured products
router.get('/search', searchProductsTitle); // Search products by title
router.get('/:id/images/:imageId', getProductImageById); // Get specific image for a product - MUST be before /:id
router.get('/:id', getProductById); // Get single product by ID - MUST be last due to catch-all

/**
 * Admin Routes
 */
router.post('/', createProduct); // Create product
router.post('/:id/images', upload.array('images', 5), uploadProductImages); // Upload images to product
router.put('/:id', updateProduct); // Update product
router.patch('/:id/stock', updateProductStock); // Update stock
router.delete('/:id', deleteProduct); // Soft delete product
router.delete('/:id/images/:imageId', deleteProductImage); // Delete specific image from product

module.exports = router;
