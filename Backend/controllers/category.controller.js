const Product = require('../models/product.model');
const Category = require('../models/category.model');

/**
 * Create Category (Admin)
 */
const createCategory = async (req, res) => {
  try {
    const { name, slug, parentCategory } = req.body;

    // Check if category exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      parentCategory: parentCategory || null
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get category by slug
 */
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true })
      .populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update category (Admin)
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parentCategory } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new slug already exists
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.parentCategory = parentCategory !== undefined ? parentCategory : category.parentCategory;

    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Toggle category status (Admin)
 */
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({ message: 'Category status updated', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get category tree
 */
const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ name: 1 });

    // Build tree structure
    const categoryTree = buildTree(categories);

    res.json(categoryTree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to build tree
const buildTree = (categories) => {
  const map = {};
  const roots = [];

  // First pass: create map
  categories.forEach(cat => {
    map[cat._id] = { ...cat.toObject(), children: [] };
  });

  // Second pass: build tree
  categories.forEach(cat => {
    if (cat.parentCategory) {
      if (map[cat.parentCategory._id]) {
        map[cat.parentCategory._id].children.push(map[cat._id]);
      }
    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  toggleCategoryStatus,
  getCategoryTree
};
