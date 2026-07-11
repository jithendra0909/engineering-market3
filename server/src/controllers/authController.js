import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Notification from '../models/Notification.js';

const validatePasswordComplexity = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

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

    // Enforce email validation rule (.com or .edu only)
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|edu)$/i;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email must be a valid address ending with .com or .edu' });
    }

    // Enforce Indian phone validation rule (+91 followed by 10 digits starting with 6-9)
    if (!whatsappNumber || !/^\+91[6-9]\d{9}$/.test(whatsappNumber)) {
      return res.status(400).json({ message: 'WhatsApp number must be a valid 10-digit Indian mobile number prefixed with +91' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Enforce password complexity rules
    if (!validatePasswordComplexity(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and include: at least 1 uppercase letter, 1 lowercase letter, and 1 numeric digit.' 
      });
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

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account is registered with this email address' });
    }

    // Generate secure token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token and expires on user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Determine host (production or localhost)
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    let resetUrl = `${protocol}://${host}/reset-password/${token}`;
    if (process.env.NODE_ENV === 'production') {
      const origin = req.get('origin');
      if (origin) {
        resetUrl = `${origin}/reset-password/${token}`;
      } else {
        resetUrl = `https://engineering-market.vercel.app/reset-password/${token}`;
      }
    } else {
      resetUrl = `http://localhost:5173/reset-password/${token}`;
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const cleanPass = smtpPass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: cleanPass
        }
      });

      const mailOptions = {
        from: `"Engineering Market" <${smtpUser}>`,
        to: user.email,
        subject: 'Reset Your Password - Engineering Market',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ECECEC; border-radius: 20px;">
            <h2 style="color: #6C4EFF;">Engineering Market</h2>
            <p>Hi ${user.fullName},</p>
            <p>We received a request to reset your password. Click the button below to set a new password. This link is only valid for 15 minutes.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #6C4EFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #6B7280; font-size: 13px;">${resetUrl}</p>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ECECEC; margin: 20px 0;" />
            <p style="font-size: 11px; color: #9CA3AF;">This is an automated email from Vignan's University Student Marketplace.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'A secure reset link has been sent to your email address.' });
    } else {
      console.log('\n======================================================');
      console.log(`[PASSWORD RESET LINK FOR ${user.email.toUpperCase()}]:`);
      console.log(resetUrl);
      console.log('======================================================\n');
      return res.status(200).json({ 
        message: 'A secure reset link has been generated. Since email service is in offline/test mode, the link has been logged to the terminal console.',
        debugUrl: resetUrl
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to initiate password reset', error: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || !validatePasswordComplexity(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and include: at least 1 uppercase letter, 1 lowercase letter, and 1 numeric digit.' 
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Your password has been successfully reset. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};

// @desc    Update user profile details & submit for re-verification
// @route   PUT /api/auth/profile
// @access  Private (Accepts multipart/form-data for ID Card image)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      fullName,
      email,
      whatsappNumber,
      registrationNumber,
      department,
      year,
      college
    } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(com|edu)$/i;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Email must be a valid address ending with .com or .edu' });
      }
      
      // Ensure email uniqueness if it changed
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'User with this email already exists' });
        }
        user.email = email;
      }
    }

    if (whatsappNumber) {
      if (!/^\+91[6-9]\d{9}$/.test(whatsappNumber)) {
        return res.status(400).json({ message: 'WhatsApp number must be a valid 10-digit Indian mobile number prefixed with +91' });
      }
      user.whatsappNumber = whatsappNumber;
    }

    if (fullName) user.fullName = fullName;
    if (registrationNumber) user.registrationNumber = registrationNumber;
    if (department) user.department = department;
    if (year) user.year = year;
    if (college) user.college = college;

    if (req.file) {
      user.idCardImageUrl = req.file.path;
    }

    // If the student was rejected or uploads a new ID card, reset status to pending for review
    if (user.verificationStatus === 'rejected' || req.file) {
      user.verificationStatus = 'pending';
      
      // Create notification about re-verification
      await Notification.create({
        recipient: user._id,
        title: 'Verification Resubmitted ⏳',
        message: 'Your profile updates and ID card have been submitted. An admin will review them shortly.',
        type: 'verification'
      });
    }

    await user.save();

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
      verificationStatus: user.verificationStatus
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed on server.', error: error.message });
  }
};

export { registerStudent, loginUser, getUserProfile, forgotPassword, resetPassword, updateUserProfile };
