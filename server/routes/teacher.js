const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Teacher, School } = require('../models');
const { sendOtpEmail, sendWelcomeEmail } = require('../utils/mailer');
const { authenticateToken } = require('../middleware/auth');

// ── Helpers ──────────────────────────────────────────────
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/signup
// Step 1: Verify UDISE + Mobile against School DB → send OTP to Gmail
// ─────────────────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { udiseCode, mobileNo, email, fullName } = req.body;

    if (!udiseCode || !mobileNo || !email) {
      return res.status(400).json({ message: 'UDISE code, mobile number, and email are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Step 1: Verify against School collection
    const school = await School.findOne({
      udiseCode: { $regex: new RegExp(`^${udiseCode.trim()}$`, 'i') }
    });

    if (!school) {
      return res.status(404).json({
        message: 'UDISE code not found in our school records. Please check and try again.'
      });
    }

    // Verify mobile number matches
    if (school.mobileNo !== mobileNo.trim()) {
      const actualMobile = school.mobileNo || '';
      const hint = actualMobile.length >= 4 ? actualMobile.slice(-4) : actualMobile;
      return res.status(400).json({
        message: `Mobile number does not match. The registered mobile number ends with ******${hint}.`
      });
    }

    // Step 2: Check if teacher already registered with this UDISE
    const existingTeacher = await Teacher.findOne({
      udiseCode: { $regex: new RegExp(`^${udiseCode.trim()}$`, 'i') }
    });

    if (existingTeacher && existingTeacher.isVerified) {
      return res.status(400).json({
        message: 'An account already exists for this UDISE code. Please login instead.'
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Upsert teacher record (create or update pending)
    const teacherData = {
      udiseCode: udiseCode.trim(),
      mobileNo:  mobileNo.trim(),
      email:     email.toLowerCase().trim(),
      schoolName: school.schoolName || school.name || '',
      fullName:  fullName || '',
      otp:       hashedOtp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isVerified: false
    };

    if (existingTeacher) {
      await Teacher.findByIdAndUpdate(existingTeacher._id, teacherData);
    } else {
      await Teacher.create(teacherData);
    }

    // Send OTP email
    try {
      await sendOtpEmail(email, otp, fullName || 'Teacher');
    } catch (mailErr) {
      console.error('Mail send error:', mailErr.message);
    }

    const isDev = process.env.NODE_ENV !== 'production';
    res.status(200).json({
      message: `OTP sent to ${email}. Please check your inbox.`,
      schoolName: school.schoolName || school.name || '',
      ...(isDev && { otp }) // expose in dev only for testing
    });

  } catch (error) {
    console.error('Teacher signup error:', error);
    res.status(500).json({ message: 'Server error during signup.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/resend-otp
// Resend OTP to email for pending teacher
// ─────────────────────────────────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { udiseCode, email } = req.body;
    if (!udiseCode || !email) {
      return res.status(400).json({ message: 'UDISE code and email are required.' });
    }

    const teacher = await Teacher.findOne({
      udiseCode: { $regex: new RegExp(`^${udiseCode.trim()}$`, 'i') }
    }).select('+otp +otpExpiresAt');

    if (!teacher) {
      return res.status(404).json({ message: 'No pending registration found. Please start signup again.' });
    }

    if (teacher.isVerified) {
      return res.status(400).json({ message: 'Account already verified. Please login.' });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    teacher.otp = hashedOtp;
    teacher.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await teacher.save();

    try {
      await sendOtpEmail(teacher.email, otp, teacher.fullName);
    } catch (mailErr) {
      console.error('Mail resend error:', mailErr.message);
    }

    const isDev = process.env.NODE_ENV !== 'production';
    res.json({
      message: `OTP resent to ${teacher.email}.`,
      ...(isDev && { otp })
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/verify-otp
// Step 2: Verify OTP → return success (let frontend show set-password form)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { udiseCode, otp } = req.body;
    if (!udiseCode || !otp) {
      return res.status(400).json({ message: 'UDISE code and OTP are required.' });
    }

    const teacher = await Teacher.findOne({
      udiseCode: { $regex: new RegExp(`^${udiseCode.trim()}$`, 'i') }
    }).select('+otp +otpExpiresAt');

    if (!teacher || !teacher.otp) {
      return res.status(400).json({ message: 'OTP not found. Please restart the signup process.' });
    }

    if (teacher.otpExpiresAt < new Date()) {
      teacher.otp = undefined;
      teacher.otpExpiresAt = undefined;
      await teacher.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, teacher.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Clear OTP — mark as email verified but not fully active yet (password not set)
    teacher.otp = undefined;
    teacher.otpExpiresAt = undefined;
    await teacher.save();

    res.json({
      message: 'OTP verified successfully! Please set your password to complete registration.',
      otpVerified: true,
      udiseCode: teacher.udiseCode
    });

  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: 'Server error while verifying OTP.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/set-password
// Step 3: Set teacher's own password → account fully active
// ─────────────────────────────────────────────────────────────────────────────
router.post('/set-password', async (req, res) => {
  try {
    const { udiseCode, newPassword } = req.body;
    if (!udiseCode || !newPassword) {
      return res.status(400).json({ message: 'UDISE code and password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const teacher = await Teacher.findOne({
      udiseCode: { $regex: new RegExp(`^${udiseCode.trim()}$`, 'i') }
    }).select('+password');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    teacher.password = await bcrypt.hash(newPassword, 12);
    teacher.isVerified = true;
    teacher.isActive = true;
    await teacher.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(teacher.email, teacher.fullName || 'Teacher', teacher.udiseCode, teacher.schoolName);
    } catch (mailErr) {
      console.error('Welcome mail error:', mailErr.message);
    }

    res.json({
      message: 'Account created successfully! You can now login with your UDISE code and password.',
      success: true
    });

  } catch (error) {
    console.error('Set-password error:', error);
    res.status(500).json({ message: 'Server error while setting password.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/login
// Login with UDISE code + password
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { udiseCode, password } = req.body;
    if (!udiseCode || !password) {
      return res.status(400).json({ message: 'UDISE code and password are required.' });
    }

    const teacher = await Teacher.findOne({
      udiseCode: { $regex: new RegExp(`^${udiseCode.trim()}$`, 'i') },
      isVerified: true,
      isActive: true
    }).select('+password');

    if (!teacher || !teacher.password) {
      return res.status(401).json({
        message: 'Account not found or not verified. Please complete registration first.'
      });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid UDISE code or password.' });
    }

    const token = jwt.sign(
      { id: teacher._id, udiseCode: teacher.udiseCode, role: 'teacher' },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      message: 'Login successful.',
      teacher: {
        udiseCode: teacher.udiseCode,
        schoolName: teacher.schoolName,
        fullName:   teacher.fullName,
        email:      teacher.email
      }
    });

  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/forgot-password
// Trigger OTP for password reset
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { udiseCode } = req.body;
    if (!udiseCode) return res.status(400).json({ message: 'UDISE code is required.' });

    const teacher = await Teacher.findOne({
      udiseCode: { $regex: new RegExp(`^${udiseCode.trim()}$`, 'i') },
      isVerified: true
    }).select('+otp +otpExpiresAt');

    if (!teacher) {
      return res.status(404).json({ message: 'No verified account found for this UDISE code.' });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    teacher.otp = hashedOtp;
    teacher.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await teacher.save();

    try {
      await sendOtpEmail(teacher.email, otp, teacher.fullName);
    } catch (mailErr) {
      console.error('Forgot password mail error:', mailErr.message);
    }

    const isDev = process.env.NODE_ENV !== 'production';
    res.json({
      message: `Password reset OTP sent to ${teacher.email}.`,
      email: teacher.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // masked
      ...(isDev && { otp })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/reset-password
// Verify OTP + set new password (forgot password flow)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { udiseCode, otp, newPassword } = req.body;
    if (!udiseCode || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const teacher = await Teacher.findOne({
      udiseCode: { $regex: new RegExp(`^${udiseCode.trim()}$`, 'i') }
    }).select('+otp +otpExpiresAt +password');

    if (!teacher || !teacher.otp) {
      return res.status(400).json({ message: 'Invalid request. Please restart the forgot password flow.' });
    }

    if (teacher.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, teacher.otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP.' });

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    teacher.password = await bcrypt.hash(newPassword, 12);
    teacher.otp = undefined;
    teacher.otpExpiresAt = undefined;
    await teacher.save();

    res.json({ message: 'Password reset successfully! Please login with your new password.', success: true });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/teacher/profile
// Get logged-in teacher's profile (protected)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });
    res.json({ teacher });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;
