import College from '../models/College.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';

// @desc    Get all active colleges
// @route   GET /api/colleges
// @access  Public
const getColleges = async (req, res) => {
  try {
    // Ensure Vignan's Institute of Engineering for Women exists in database
    const collegesList = [
      "Vignan's Institute of Engineering for Women (VIEW)"
    ];

    const oldColleges = [
      "Vignan's Institute of Information Technology (VIIT)",
      "Vignan Institute of Information Technology"
    ];

    // Clean up all variations of VIIT from the database
    await College.deleteMany({ name: { $in: oldColleges } });

    // Migrate any users or listings referencing VIIT to VIEW
    const targetCollege = "Vignan's Institute of Engineering for Women (VIEW)";
    await User.updateMany({ college: { $in: oldColleges } }, { college: targetCollege });
    await Listing.updateMany({ sellerCollege: { $in: oldColleges } }, { sellerCollege: targetCollege });

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
