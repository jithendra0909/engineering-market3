import User from '../models/User.js';
import Listing from '../models/Listing.js';

// @desc    Get users by verification status
// @route   GET /api/admin/users
// @access  Private & Admin
const getUsersByStatus = async (req, res) => {
  try {
    const { status } = req.query; // pending, approved, rejected
    const filter = { role: 'student' };
    if (status) {
      filter.verificationStatus = status;
    }
    
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users list', error: error.message });
  }
};

// @desc    Get pending students
// @route   GET /api/admin/users/pending
// @access  Private & Admin
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'student', verificationStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving pending users list', error: error.message });
  }
};

// @desc    Approve a student
// @route   POST /api/admin/users/:id/approve
// @access  Private & Admin
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.verificationStatus = 'approved';
    await user.save();
    res.json({ message: `User ${user.fullName} is now approved`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error approving user', error: error.message });
  }
};

// @desc    Reject a student
// @route   POST /api/admin/users/:id/reject
// @access  Private & Admin
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.verificationStatus = 'rejected';
    await user.save();
    res.json({ message: `User ${user.fullName} has been rejected`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error rejecting user', error: error.message });
  }
};

// @desc    Get all listings (including sold/removed)
// @route   GET /api/admin/listings
// @access  Private & Admin
const getAllListingsAdmin = async (req, res) => {
  try {
    const listings = await Listing.find({})
      .populate('seller', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving listings admin', error: error.message });
  }
};

// @desc    Delete any listing
// @route   DELETE /api/admin/listings/:id
// @access  Private & Admin
const deleteListingAdmin = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    await listing.deleteOne();
    res.json({ message: 'Listing removed successfully by Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing listing', error: error.message });
  }
};

export {
  getUsersByStatus,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllListingsAdmin,
  deleteListingAdmin
};
