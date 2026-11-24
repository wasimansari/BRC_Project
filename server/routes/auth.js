const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, AdminOtp } = require('../models');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { sendAdminOtpEmail } = require('../utils/mailer');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// All standard dashboard pages available for sub-admin assignment
const ALL_ADMIN_PAGES = [
  'banners', 'events', 'news', 'courses', 'trainings',
  'about', 'gallery', 'downloads', 'schools',
  'teacher-directory', 'teacher-docs', 'announcements',
  'pageBackgrounds', 'testimonials'
];

// Helper function to upload signature (file buffer or base64) to Cloudinary with fallback
const uploadSignatureHelper = async (fileBuffer, base64Str) => {
  try {
    if (fileBuffer) {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'brc/admin-signatures', resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve({ signatureUrl: result.secure_url, publicId: result.public_id });
          }
        );
        uploadStream.end(fileBuffer);
      });
    } else if (base64Str) {
      if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
        return { signatureUrl: base64Str, publicId: '' };
      }
      const result = await cloudinary.uploader.upload(base64Str, {
        folder: 'brc/admin-signatures',
        resource_type: 'image'
      });
      return { signatureUrl: result.secure_url, publicId: result.public_id };
    }
  } catch (err) {
    console.warn('Cloudinary upload error, using fallback:', err.message);
    if (base64Str) {
      return { signatureUrl: base64Str, publicId: '' };
    }
  }
  return { signatureUrl: '', publicId: '' };
};

// @route   POST /api/auth/signup
// @desc    Register a new admin (Public initial signup if permitted)
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { username, password, secretKey, name, email, contactNumber, designation } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    let role = 'admin';
    if (secretKey === (process.env.SUPER_ADMIN_SECRET || 'supersecret_flag')) {
      role = 'superadmin';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      role,
      name: name || '',
      email: email ? email.toLowerCase().trim() : '',
      contactNumber: contactNumber || '',
      designation: designation || (role === 'superadmin' ? 'Master Admin' : 'Admin'),
      isActive: true,
      allowedPages: role === 'superadmin' ? ALL_ADMIN_PAGES : ['teacher-docs']
    });

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

    if (admin.isActive === false) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact the Master Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        name: admin.name,
        designation: admin.designation
      },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '24h' }
    );

    const allowed = admin.role === 'superadmin'
      ? ALL_ADMIN_PAGES
      : (admin.allowedPages && admin.allowedPages.length > 0 ? admin.allowedPages : ['teacher-docs']);

    res.json({
      token,
      role: admin.role,
      admin: {
        id: admin._id,
        _id: admin._id,
        username: admin.username,
        email: admin.email || '',
        role: admin.role,
        name: admin.name || '',
        contactNumber: admin.contactNumber || '',
        designation: admin.designation || '',
        signature: admin.signature || '',
        isActive: admin.isActive !== false,
        allowedPages: allowed
      },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current admin's profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }
    const sanitized = admin.toObject();
    sanitized.allowedPages = admin.role === 'superadmin'
      ? ALL_ADMIN_PAGES
      : (admin.allowedPages && admin.allowedPages.length > 0 ? admin.allowedPages : ['teacher-docs']);
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current admin's own profile and signature
// @access  Private
router.put('/profile', authenticateToken, upload.single('signature'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const { name, contactNumber, designation, password, signatureBase64 } = req.body;

    if (name !== undefined) admin.name = name;
    if (contactNumber !== undefined) admin.contactNumber = contactNumber;
    if (designation !== undefined) admin.designation = designation;

    if (password && password.trim()) {
      admin.password = await bcrypt.hash(password.trim(), 10);
    }

    // Handle signature upload (file or base64 data)
    if (req.file) {
      const uploadRes = await uploadSignatureHelper(req.file.buffer, null);
      if (uploadRes.signatureUrl) {
        admin.signature = uploadRes.signatureUrl;
        admin.signaturePublicId = uploadRes.publicId;
      }
    } else if (signatureBase64) {
      const uploadRes = await uploadSignatureHelper(null, signatureBase64);
      if (uploadRes.signatureUrl) {
        admin.signature = uploadRes.signatureUrl;
        admin.signaturePublicId = uploadRes.publicId;
      }
    }

    await admin.save();

    const sanitized = admin.toObject();
    delete sanitized.password;
    sanitized.allowedPages = admin.role === 'superadmin'
      ? ALL_ADMIN_PAGES
      : (admin.allowedPages && admin.allowedPages.length > 0 ? admin.allowedPages : ['teacher-docs']);

    res.json({ message: 'Profile updated successfully', admin: sanitized });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// @route   GET /api/auth/admins
// @desc    Get all admins (Master Admin ONLY: no one else can see admin details)
// @access  Private (Master Admin only)
router.get('/admins', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ role: -1, createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admins', error: error.message });
  }
});

// @route   POST /api/auth/send-subadmin-otp
// @desc    Send email verification OTP to sub-admin candidate email (Master Admin only)
// @access  Private (Master Admin only)
router.post('/send-subadmin-otp', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered to an admin
    const existingEmail = await Admin.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ message: `An administrator account with email ${cleanEmail} already exists.` });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save or update OTP in AdminOtp collection (auto-expires in 10 mins, reset isVerified to false)
    await AdminOtp.findOneAndUpdate(
      { email: cleanEmail },
      { otp: hashedOtp, isVerified: false, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send OTP to email
    try {
      await sendAdminOtpEmail(cleanEmail, otp, 'Sub-Administrator');
    } catch (mailError) {
      console.error('Failed to send admin OTP email:', mailError);
      return res.status(500).json({
        message: 'Could not send verification email. Please verify Gmail credentials in server configuration.',
        error: mailError.message
      });
    }

    // Security: Do NOT return OTP in response. OTP must only be read from inbox.
    res.json({
      message: `Verification OTP successfully sent to ${cleanEmail}. Please check your inbox.`,
      email: cleanEmail,
      success: true
    });
  } catch (error) {
    console.error('Send subadmin OTP error:', error);
    res.status(500).json({ message: 'Server error sending verification OTP', error: error.message });
  }
});

// @route   POST /api/auth/verify-subadmin-otp
// @desc    Verify OTP for sub-admin email before allowing form completion (Master Admin only)
// @access  Private (Master Admin only)
router.post('/verify-subadmin-otp', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required.' });
    }
    if (!otp || !otp.trim()) {
      return res.status(400).json({ message: 'Please enter the 6-digit verification code.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpRecord = await AdminOtp.findOne({ email: cleanEmail });
    if (!otpRecord) {
      return res.status(400).json({ message: 'No active OTP verification found for this email. Please click Send OTP.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid verification OTP. Please check the code in your email.' });
    }

    otpRecord.isVerified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'Email address verified successfully! You can now fill in the sub-admin account details.'
    });
  } catch (error) {
    console.error('Verify subadmin OTP error:', error);
    res.status(500).json({ message: 'Server error verifying OTP', error: error.message });
  }
});

// @route   POST /api/auth/admins
// @desc    Create new sub-admin with verified email and page-wise permissions (Master Admin only)
// @access  Private (Master Admin only)
router.post('/admins', authenticateToken, requireSuperAdmin, upload.single('signature'), async (req, res) => {
  try {
    let {
      username,
      password,
      email,
      otp,
      name,
      contactNumber,
      designation,
      role,
      allowedPages,
      signatureBase64
    } = req.body;

    // 1. Mandatory Fields Validation
    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Username is required' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'A valid email address is required for sub-admin creation' });
    }
    if (!otp || !otp.trim()) {
      return res.status(400).json({ message: 'Verification OTP sent to sub-admin email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // 2. Verify Email Verification Status
    const otpRecord = await AdminOtp.findOne({ email: cleanEmail });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Email verification expired or not found. Please verify email with OTP first.' });
    }

    if (!otpRecord.isVerified) {
      if (!otp) {
        return res.status(400).json({ message: 'Please verify the sub-admin email with OTP before submitting.' });
      }
      const isMatch = await bcrypt.compare(otp.trim(), otpRecord.otp);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid verification OTP code.' });
      }
    }

    // Clear the OTP record after successful account creation
    await AdminOtp.deleteOne({ _id: otpRecord._id });

    // 3. Uniqueness checks
    const existing = await Admin.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanEmail }
      ]
    });
    if (existing) {
      if (existing.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      return res.status(400).json({ message: 'Email address is already registered to an admin' });
    }

    // 4. Parse allowed pages
    let parsedAllowedPages = [];
    if (typeof allowedPages === 'string') {
      try {
        parsedAllowedPages = JSON.parse(allowedPages);
      } catch (e) {
        parsedAllowedPages = allowedPages.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(allowedPages)) {
      parsedAllowedPages = allowedPages;
    }
    if (parsedAllowedPages.length === 0) {
      parsedAllowedPages = ['teacher-docs']; // Default minimum page
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    let signatureUrl = '';
    let signaturePublicId = '';

    if (req.file) {
      const uploadRes = await uploadSignatureHelper(req.file.buffer, null);
      signatureUrl = uploadRes.signatureUrl;
      signaturePublicId = uploadRes.publicId;
    } else if (signatureBase64) {
      const uploadRes = await uploadSignatureHelper(null, signatureBase64);
      signatureUrl = uploadRes.signatureUrl;
      signaturePublicId = uploadRes.publicId;
    }

    const newAdmin = new Admin({
      username: cleanUsername,
      password: hashedPassword,
      email: cleanEmail,
      isEmailVerified: true,
      role: role === 'superadmin' ? 'superadmin' : 'admin',
      name: name ? name.trim() : '',
      contactNumber: contactNumber ? contactNumber.trim() : '',
      designation: designation ? designation.trim() : 'Sub Administrator',
      allowedPages: role === 'superadmin' ? ALL_ADMIN_PAGES : parsedAllowedPages,
      signature: signatureUrl,
      signaturePublicId: signaturePublicId,
      isActive: true
    });

    await newAdmin.save();

    const sanitized = newAdmin.toObject();
    delete sanitized.password;
    res.status(201).json({ message: 'Sub-admin user verified and created successfully', admin: sanitized });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error creating admin', error: error.message });
  }
});

// @route   PUT /api/auth/admins/:id
// @desc    Update admin user, allowed pages & status (Master Admin only)
// @access  Private (Master Admin only)
router.put('/admins/:id', authenticateToken, requireSuperAdmin, upload.single('signature'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const {
      name,
      email,
      contactNumber,
      designation,
      role,
      isActive,
      password,
      allowedPages,
      signatureBase64
    } = req.body;

    // Safety check: Cannot demote or deactivate yourself if you are the current superadmin
    if (admin._id.toString() === req.user.id) {
      if (isActive === false || isActive === 'false') {
        return res.status(400).json({ message: 'You cannot deactivate your own Master Admin account' });
      }
      if (role && role !== 'superadmin') {
        return res.status(400).json({ message: 'You cannot remove your own Master Admin role' });
      }
    }

    if (name !== undefined) admin.name = name;
    if (contactNumber !== undefined) admin.contactNumber = contactNumber;
    if (designation !== undefined) admin.designation = designation;
    if (role !== undefined) admin.role = role;
    if (isActive !== undefined) admin.isActive = isActive === true || isActive === 'true';

    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== admin.email) {
        const emailInUse = await Admin.findOne({ email: cleanEmail, _id: { $ne: admin._id } });
        if (emailInUse) {
          return res.status(400).json({ message: 'Email address is already in use by another administrator.' });
        }
        admin.email = cleanEmail;
      }
    }

    // Page-wise access assignment
    if (allowedPages !== undefined) {
      let parsed = [];
      if (typeof allowedPages === 'string') {
        try {
          parsed = JSON.parse(allowedPages);
        } catch (e) {
          parsed = allowedPages.split(',').map(s => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(allowedPages)) {
        parsed = allowedPages;
      }
      admin.allowedPages = admin.role === 'superadmin' ? ALL_ADMIN_PAGES : parsed;
    }

    if (password && password.trim()) {
      admin.password = await bcrypt.hash(password.trim(), 10);
    }

    if (req.file) {
      const uploadRes = await uploadSignatureHelper(req.file.buffer, null);
      if (uploadRes.signatureUrl) {
        admin.signature = uploadRes.signatureUrl;
        admin.signaturePublicId = uploadRes.publicId;
      }
    } else if (signatureBase64) {
      const uploadRes = await uploadSignatureHelper(null, signatureBase64);
      if (uploadRes.signatureUrl) {
        admin.signature = uploadRes.signatureUrl;
        admin.signaturePublicId = uploadRes.publicId;
      }
    }

    await admin.save();

    const sanitized = admin.toObject();
    delete sanitized.password;
    res.json({ message: 'Admin updated successfully', admin: sanitized });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Server error updating admin', error: error.message });
  }
});

// @route   DELETE /api/auth/subadmins/all
// @desc    Delete all sub-admin users (Master Admin only)
// @access  Private (Master Admin only)
router.delete('/subadmins/all', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await Admin.deleteMany({
      _id: { $ne: req.user.id },
      username: { $ne: 'admin' },
      role: { $ne: 'superadmin' }
    });
    res.json({ message: `Successfully deleted ${result.deletedCount} sub-admin(s).`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Delete all sub-admins error:', error);
    res.status(500).json({ message: 'Server error deleting sub-admins', error: error.message });
  }
});

// @route   DELETE /api/auth/admins/:id
// @desc    Delete admin user (Master Admin only)
// @access  Private (Master Admin only)
router.delete('/admins/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const adminToDelete = await Admin.findById(req.params.id);
    if (!adminToDelete) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Safety rule 1: Master Admin cannot delete themselves
    if (adminToDelete._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Master Admin cannot delete their own account.' });
    }

    // Safety rule 2: Don't delete if it is the primary 'admin' account
    if (adminToDelete.username === 'admin') {
      return res.status(400).json({ message: 'Primary Master Admin account cannot be deleted.' });
    }

    // Safety rule 3: If this admin is superadmin, check that at least one other superadmin exists
    if (adminToDelete.role === 'superadmin') {
      const superAdminCount = await Admin.countDocuments({ role: 'superadmin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only remaining Master Admin.' });
      }
    }

    // Delete signature from Cloudinary if exists
    if (adminToDelete.signaturePublicId) {
      try {
        await cloudinary.uploader.destroy(adminToDelete.signaturePublicId);
      } catch (e) {
        console.warn('Failed to delete signature from cloudinary:', e.message);
      }
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error deleting admin', error: error.message });
  }
});

// @route   POST /api/auth/upload-signature
// @desc    Upload digital signature standalone
// @access  Private
router.post('/upload-signature', authenticateToken, upload.single('signature'), async (req, res) => {
  try {
    const { signatureBase64 } = req.body;
    let uploadRes = { signatureUrl: '', publicId: '' };

    if (req.file) {
      uploadRes = await uploadSignatureHelper(req.file.buffer, null);
    } else if (signatureBase64) {
      uploadRes = await uploadSignatureHelper(null, signatureBase64);
    } else {
      return res.status(400).json({ message: 'No signature file or data provided' });
    }

    res.json({
      message: 'Signature uploaded successfully',
      signatureUrl: uploadRes.signatureUrl,
      publicId: uploadRes.publicId
    });
  } catch (error) {
    console.error('Signature upload error:', error);
    res.status(500).json({ message: 'Failed to upload signature', error: error.message });
  }
});

module.exports = router;
