import Listing from '../models/Listing.js';

const checkListingLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Bypass limit for admin users
    if (req.user.role === 'admin') {
      return next();
    }

    // Rate limit: Max 3 listings per 7 days (1 week)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = await Listing.countDocuments({
      seller: req.user._id,
      createdAt: { $gte: oneWeekAgo }
    });

    if (weeklyCount >= 3) {
      return res.status(400).json({
        message: 'Rate limit exceeded: You can only create up to 3 listings per week.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking listing limit', error: error.message });
  }
};

export { checkListingLimit };
