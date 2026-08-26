import GiftCategory from '../models/GiftCategory.js';
import GiftProduct from '../models/GiftProduct.js';

// @desc    Get all gift categories (public: active only, admin: all)
// @route   GET /api/gift/categories
// @access  Public
const getGiftCategories = async (req, res) => {
  try {
    let query = {};

    // Non-admin callers only see active categories
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }

    const categories = await GiftCategory.find(query).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving gift categories', error: error.message });
  }
};

// @desc    Create a new gift category
// @route   POST /api/gift/categories
// @access  Admin
const createGiftCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check for duplicate
    const existing = await GiftCategory.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }

    const category = await GiftCategory.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating gift category:', error);
    res.status(500).json({ message: 'Server error creating gift category', error: error.message });
  }
};

// @desc    Update gift category (rename or toggle isActive)
// @route   PUT /api/gift/categories/:id
// @access  Admin
const updateGiftCategory = async (req, res) => {
  try {
    const category = await GiftCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Gift category not found' });
    }

    const { name, isActive } = req.body;

    if (name !== undefined) {
      // Check for duplicate name (exclude current)
      const existing = await GiftCategory.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }
      category.name = name.trim();
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating gift category', error: error.message });
  }
};

// @desc    Delete gift category (block if products reference it)
// @route   DELETE /api/gift/categories/:id
// @access  Admin
const deleteGiftCategory = async (req, res) => {
  try {
    const category = await GiftCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Gift category not found' });
    }

    // Check if any products reference this category
    const productCount = await GiftProduct.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category "${category.name}" because ${productCount} product(s) are using it. Reassign or remove those products first.`
      });
    }

    await category.deleteOne();
    res.json({ message: 'Gift category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting gift category', error: error.message });
  }
};

export {
  getGiftCategories,
  createGiftCategory,
  updateGiftCategory,
  deleteGiftCategory
};
