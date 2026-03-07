const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// @route   POST /api/auth/signup
// @desc    Register a new admin
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { username, password, secretKey } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    let role = 'admin';
    if (secretKey === (process.env.SUPER_ADMIN_SECRET || 'supersecret_flag')) {
      role = 'superadmin';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword, role });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully', role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, role: admin.role, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/create-admin
// @desc    Create new admin (Super Admin only)
// @access  Private
router.post('/create-admin', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword, role: 'admin' });

    await newAdmin.save();
    res.status(201).json({ message: 'New admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/initialize
// @desc    Initialize default admin (called on server start)
// @access  Private (internal use)
router.post('/initialize', async (req, res) => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword,
        role: 'superadmin'
      });
      await admin.save();
      console.log('Default superadmin user created');
    } else if (!adminExists.role) {
      adminExists.role = 'superadmin';
      await adminExists.save();
      console.log('Existing admin updated to superadmin');
    }
    res.json({ message: 'Admin initialization complete' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin:', error: error.message });
  }
});

module.exports = router;