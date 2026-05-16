const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Teacher } = require('../models');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// @route   POST /api/teacher/signup
// @desc    Register a teacher with UDISE, mobile, and school name
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { udiseCode, mobileNo, schoolName, fullName } = req.body;
    if (!udiseCode || !mobileNo || !schoolName) {
      return res.status(400).json({ message: 'UDISE code, mobile number and school name are required.' });
    }

    const existingTeacher = await Teacher.findOne({ udiseCode, mobileNo });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher already registered for this UDISE and mobile number.' });
    }

    const teacher = new Teacher({ udiseCode, mobileNo, schoolName, fullName });
    await teacher.save();

    res.status(201).json({ message: 'Teacher registered successfully.' });
  } catch (error) {
    console.error('Teacher signup error:', error);
    res.status(500).json({ message: 'Server error during teacher signup.', error: error.message });
  }
});

// @route   POST /api/teacher/request-otp
// @desc    Request OTP for teacher login
// @access  Public
router.post('/request-otp', async (req, res) => {
  try {
    const { udiseCode, mobileNo } = req.body;
    if (!udiseCode || !mobileNo) {
      return res.status(400).json({ message: 'UDISE code and mobile number are required.' });
    }

    const teacher = await Teacher.findOne({ udiseCode, mobileNo });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found. Please sign up first.' });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    teacher.otp = hashedOtp;
    teacher.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await teacher.save();

    // In production, send the OTP by SMS. For now, return it in the response for testing.
    res.json({ message: 'OTP generated and sent to the registered mobile number.', otp });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Server error while requesting OTP.', error: error.message });
  }
});

// @route   POST /api/teacher/verify-otp
// @desc    Verify teacher OTP and generate a random password
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { udiseCode, mobileNo, otp } = req.body;
    if (!udiseCode || !mobileNo || !otp) {
      return res.status(400).json({ message: 'UDISE code, mobile number and OTP are required.' });
    }

    const teacher = await Teacher.findOne({ udiseCode, mobileNo }).select('+otp +otpExpiresAt');
    if (!teacher || !teacher.otp || !teacher.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP is not active. Please request a new OTP.' });
    }

    if (teacher.otpExpiresAt < new Date()) {
      teacher.otp = undefined;
      teacher.otpExpiresAt = undefined;
      await teacher.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp, teacher.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    const password = generateRandomPassword(10);
    teacher.password = await bcrypt.hash(password, 10);
    teacher.otp = undefined;
    teacher.otpExpiresAt = undefined;
    await teacher.save();

    // In production, send the password by SMS. For now, return it in the response for testing.
    res.json({ message: 'OTP verified. A new password has been generated and sent to your mobile.', password });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error while verifying OTP.', error: error.message });
  }
});

// @route   POST /api/teacher/login
// @desc    Login teacher using UDISE code and password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { udiseCode, password } = req.body;
    if (!udiseCode || !password) {
      return res.status(400).json({ message: 'UDISE code and password are required.' });
    }

    const teacher = await Teacher.findOne({ udiseCode });
    if (!teacher || !teacher.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: teacher._id, udiseCode: teacher.udiseCode }, 
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      message: 'Teacher login successful.',
      teacher: {
        udiseCode: teacher.udiseCode,
        schoolName: teacher.schoolName,
        fullName: teacher.fullName
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Server error during teacher login.', error: error.message });
  }
});

module.exports = router;
