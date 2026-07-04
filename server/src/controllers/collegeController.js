import College from '../models/College.js';

// @desc    Get all active colleges
// @route   GET /api/colleges
// @access  Public
const getColleges = async (req, res) => {
  try {
    const colleges = await College.find({ isActive: true }).select('name');
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving colleges', error: error.message });
  }
};

export { getColleges };
