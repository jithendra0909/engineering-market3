import Feedback from '../models/Feedback.js';

// @desc    Create new feedback / feature request
// @route   POST /api/feedback
// @access  Private
export const createFeedback = async (req, res) => {
  try {
    const { category, title, description } = req.body;
    const userId = req.user._id;

    if (!category || !title || !description) {
      return res.status(400).json({ message: 'Category, title, and description are required' });
    }

    const feedback = await Feedback.create({
      user: userId,
      category,
      title,
      description,
      upvotes: [userId] // Auto-upvote by creator
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'fullName profileImageUrl department year');

    res.status(201).json(populatedFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting feedback', error: error.message });
  }
};

// @desc    Get all feedback/feature requests for roadmap list
// @route   GET /api/feedback
// @access  Private
export const getFeedbackList = async (req, res) => {
  try {
    const feedbackList = await Feedback.find()
      .populate('user', 'fullName profileImageUrl department year')
      .sort({ upvotes: -1, createdAt: -1 });

    res.json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching feedback roadmap', error: error.message });
  }
};

// @desc    Toggle upvote on feedback request
// @route   POST /api/feedback/:id/upvote
// @access  Private
export const toggleUpvote = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user._id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }

    const alreadyUpvoted = feedback.upvotes.includes(userId);

    if (alreadyUpvoted) {
      // Remove upvote
      feedback.upvotes = feedback.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Add upvote
      feedback.upvotes.push(userId);
    }

    await feedback.save();

    const updatedFeedback = await Feedback.findById(feedbackId)
      .populate('user', 'fullName profileImageUrl department year');

    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating upvote status', error: error.message });
  }
};
