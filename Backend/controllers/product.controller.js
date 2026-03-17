const Product = require('../models/product.model');
const Category = require('../models/category.model');
const mongoose = require('mongoose');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Create Product (Admin)
 */
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      price,
      discountPrice,
      images,
      stock,
      attributes,
      rating,
      reviewCount,
      isActive
    } = req.body;

    // Validate categoryId is a valid MongoDB ObjectId format
    if (!categoryId || !mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID format. Please select a valid category.' });
    }

    // Validate category exists and is active
    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive category. Please select a valid active category.' });
    }

    const product = await Product.create({
      title,
      description,
      categoryId,
      price,
      discountPrice,
      images,
      stock,
      attributes,
      rating,
      reviewCount,
      isActive
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all products (filters + pagination)
 */
const getAllProducts = async (req, res) => {
  try {
const {
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      categoryId,
      isActive
    } = req.query;

    const query = {
      isDeleted: false
    };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Sort images by imageNumber for each product
    products.forEach(product => {
      if (product.images && product.images.length > 0) {
        product.images.sort((a, b) => a.imageNumber - b.imageNumber);
      }
    });

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('categoryId', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Sort images by imageNumber
    if (product.images && product.images.length > 0) {
      product.images.sort((a, b) => a.imageNumber - b.imageNumber);
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get products by category ID
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({
      categoryId,
      isActive: true,
      isDeleted: false
    }).populate('categoryId', 'name slug');

    // Sort images by imageNumber for each product
    products.forEach(product => {
      if (product.images && product.images.length > 0) {
        product.images.sort((a, b) => a.imageNumber - b.imageNumber);
      }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update product (Admin)
 */
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Soft delete product (Admin)
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update product stock
 */
const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock = stock;
    await product.save();

    res.json({
      message: 'Stock updated successfully',
      stock: product.stock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Upload product images to Cloudinary
 */
const uploadProductImages = async (req, res) => {
  try {
    // First, check if Cloudinary is properly configured
    if (!isCloudinaryConfigured()) {
      console.error('Cloudinary is not configured properly');
      return res.status(500).json({ message: 'Cloudinary is not configured. Please check server configuration.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    console.log('Uploaded files:', req.files);

    // Get the starting image number (next available number)
    const startImageNumber = product.images.length + 1;

    // Process uploaded files and add to product images with sequential numbers
    const newImages = req.files.map((file, index) => {
      // Cloudinary stores the public_id in 'filename' and URL in 'path'
      // Also check for 'secure_url' which is the HTTPS URL from Cloudinary response
      const imageId = file.filename || file.public_id;
      const url = file.path || file.secure_url || file.url;

      console.log('Processing file:', { imageId, url, file });

      return {
        imageId: imageId,
        url: url,
        imageNumber: startImageNumber + index // Assign sequential numbers
      };
    });

    // Filter out any invalid images (missing imageId or url)
    const validImages = newImages.filter(img => img.imageId && img.url);

    if (validImages.length === 0) {
      console.error('No valid images after processing:', newImages);
      return res.status(500).json({ message: 'Failed to process uploaded images. Please try again.' });
    }

    product.images.push(...validImages);
    await product.save();

    console.log('Images saved to product:', product.images);

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: product.images
    });
  } catch (error) {
    console.error('Error uploading product images:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a specific product image
 */
const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the image in the product's images array
    const imageIndex = product.images.findIndex(img => img.imageId === imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(imageId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue even if Cloudinary deletion fails
    }

    // Remove from product images array
    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(200).json({
      message: 'Image deleted successfully',
      images: product.images
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a specific product image by imageId
 */
const getProductImageById = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = product.images.find(img => img.imageId === imageId);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a specific product image by imageNumber
 */
const getProductImageByNumber = async (req, res) => {
  try {
    const { id, imageNumber } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = product.images.find(img => img.imageNumber === parseInt(imageNumber));
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Search products by title only (Admin pagination support)
 */
const searchProductsTitle = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      isActive
    } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query "q" is required' });
    }

    const query = {
      title: { $regex: escapeRegExp(q.trim()), $options: 'i' },
      isDeleted: false
    };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Sort images by imageNumber for each product
    products.forEach(product => {
      if (product.images && product.images.length > 0) {
        product.images.sort((a, b) => a.imageNumber - b.imageNumber);
      }
    });

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function for regex escape
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
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
  getProductImageById,
  getProductImageByNumber
};
