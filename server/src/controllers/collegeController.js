import College from '../models/College.js';

// @desc    Get all active colleges
// @route   GET /api/colleges
// @access  Public
const getColleges = async (req, res) => {
  try {
    // Ensure both college records exist in database
    const collegesList = [
      "Vignan's Institute of Information Technology (VIIT)",
      "Vignan's Institute of Engineering for Women (VIEW)"
    ];

    for (const name of collegesList) {
      const exists = await College.findOne({ name });
      if (!exists) {
        await College.create({ name, isActive: true });
      }
    }

    const colleges = await College.find({ isActive: true }).select('name');
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving colleges', error: error.message });
  }
};

export { getColleges };
