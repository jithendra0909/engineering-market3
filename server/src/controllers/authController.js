import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new student
// @route   POST /api/auth/signup
// @access  Public (Accepts multipart/form-data for ID Card image)
const registerStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      whatsappNumber,
      registrationNumber,
      department,
      year,
      college
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Verify file upload for ID card image
    if (!req.file) {
      return res.status(400).json({ message: 'Student ID card image is required for registration' });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      whatsappNumber,
      registrationNumber,
      department,
      year,
      college,
      idCardImageUrl: req.file.path, // Configured by uploadMiddleware (Cloudinary or local static URL)
      verificationStatus: 'pending', // Default is pending approval
      role: 'student'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
        registrationNumber: user.registrationNumber,
        department: user.department,
        year: user.year,
        college: user.college,
        idCardImageUrl: user.idCardImageUrl,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        verificationStatus: user.verificationStatus,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid student registration data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server registration error', error: error.message });
  }
};

// @desc    Authenticate User & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        whatsappNumber: user.whatsappNumber,
        registrationNumber: user.registrationNumber,
        department: user.department,
        year: user.year,
        college: user.college,
        idCardImageUrl: user.idCardImageUrl,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        verificationStatus: user.verificationStatus,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server login error', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server profile retrieval error', error: error.message });
  }
};

export { registerStudent, loginUser, getUserProfile };
