import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import Feedback from '../models/Feedback.js';
import { createNotification } from '../utils/pushNotification.js';

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
    
    // Create verification approval in-app & push notification
    createNotification({
      userId: user._id,
      title: 'Profile Verified ✅',
      body: 'Your Engineering Market profile has been verified.',
      type: 'profile_verified',
      url: '/profile',
    }).catch((err) => console.error('[Admin] Approval notification error:', err.message));
    
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
    
    // Create verification rejection in-app & push notification
    createNotification({
      userId: user._id,
      title: 'Profile Verification Update',
      body: 'Your profile verification needs attention.',
      type: 'profile_verification_failed',
      url: '/profile',
    }).catch((err) => console.error('[Admin] Rejection notification error:', err.message));
    
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
      .populate('reports.reporter', 'fullName email')
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
    
    const sellerId = listing.seller;
    const listingTitle = listing.title;
    await listing.deleteOne();

    if (sellerId) {
      createNotification({
        userId: sellerId,
        title: 'Listing Update',
        body: `Your listing "${listingTitle}" needs attention.`,
        type: 'listing_rejected',
        url: '/profile',
      }).catch((err) => console.error('[Admin] Listing deletion notification error:', err.message));
    }

    res.json({ message: 'Listing removed successfully by Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing listing', error: error.message });
  }
};

// @desc    Dismiss all reports on a listing
// @route   POST /api/admin/listings/:id/dismiss-reports
// @access  Private & Admin
const dismissReports = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.reports = [];
    listing.status = 'available'; // Restore to feed if it was auto-hidden

    await listing.save();

    if (listing.seller) {
      createNotification({
        userId: listing.seller,
        title: 'Listing Approved ✅',
        body: `Your listing "${listing.title}" has been approved and is now visible.`,
        type: 'listing_approved',
        url: `/listing/${listing._id}`,
        listingId: listing._id,
      }).catch((err) => console.error('[Admin] Listing approval notification error:', err.message));
    }

    res.json({ message: 'All reports dismissed successfully', listing });
  } catch (error) {
    res.status(500).json({ message: 'Server error dismissing reports', error: error.message });
  }
};

const getReportedConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ 'reports.0': { $exists: true } })
      .populate('listing', 'title price images status')
      .populate('buyer', 'fullName email profileImageUrl department year verificationStatus')
      .populate('seller', 'fullName email profileImageUrl department year verificationStatus')
      .populate('reports.reporter', 'fullName email')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving reported chats', error: error.message });
  }
};

// @desc    Dismiss all reports on a conversation
// @route   POST /api/admin/chats/:id/dismiss-reports
// @access  Private & Admin
const dismissConversationReports = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.reports = [];
    await conversation.save();

    res.json({ message: 'All reports on conversation dismissed successfully', conversation });
  } catch (error) {
    res.status(500).json({ message: 'Server error dismissing conversation reports', error: error.message });
  }
};

// @desc    Update status of a feedback request
// @route   POST /api/admin/feedback/:id/status
// @access  Private & Admin
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }

    feedback.status = status;
    await feedback.save();

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'fullName profileImageUrl department year');

    res.json({ message: 'Feedback status updated successfully', feedback: updatedFeedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating feedback status', error: error.message });
  }
};

// @desc    Delete feedback item
// @route   DELETE /api/admin/feedback/:id
// @access  Private & Admin
const deleteFeedbackAdmin = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }

    res.json({ message: 'Feedback request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting feedback', error: error.message });
  }
};

export {
  getUsersByStatus,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllListingsAdmin,
  deleteListingAdmin,
  dismissReports,
  getReportedConversations,
  dismissConversationReports,
  updateFeedbackStatus,
  deleteFeedbackAdmin
};
