import College from '../models/College.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

// @desc    Get all colleges (public: active only, admin ?showAll=true: all)
// @route   GET /api/colleges
// @access  Public
const getColleges = async (req, res) => {
  try {
    let query = {};
    if (!(req.query.showAll === 'true' && req.user && req.user.role === 'admin')) {
      query.isActive = true;
    }
    const colleges = await College.find(query).sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving colleges', error: error.message });
  }
};

// @desc    Create a new college
// @route   POST /api/colleges
// @access  Admin
const createCollege = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'College name is required' });
    }
    const existing = await College.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A college with this name already exists' });
    }
    const college = await College.create({ name: name.trim() });
    res.status(201).json(college);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating college', error: error.message });
  }
};

// @desc    Update college (rename or toggle isActive)
// @route   PUT /api/colleges/:id
// @access  Admin
const updateCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    const { name, isActive } = req.body;
    if (name !== undefined) {
      const existing = await College.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'A college with this name already exists' });
      }
      college.name = name.trim();
    }
    if (isActive !== undefined) {
      college.isActive = isActive;
    }
    const updated = await college.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating college', error: error.message });
  }
};

// @desc    Delete college (block if students or listings reference it)
// @route   DELETE /api/colleges/:id
// @access  Admin
const deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const studentCount = await User.countDocuments({ college: college.name });
    const listingCount = await Listing.countDocuments({ sellerCollege: college.name });

    if (studentCount > 0 || listingCount > 0) {
      return res.status(400).json({
        message: `Cannot delete "${college.name}" — ${studentCount} student(s) and ${listingCount} listing(s) reference it. Deactivate it instead so it stops appearing for new signups.`
      });
    }

    await college.deleteOne();
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting college', error: error.message });
  }
};

export { getColleges, createCollege, updateCollege, deleteCollege };
