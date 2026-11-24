const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Import routes
const routes = require('./routes');

// MongoDB connection
const connectDB = require('./config/db');
const { Admin } = require('./models');
const bcrypt = require('bcryptjs');

// All standard admin dashboard pages
const ALL_ADMIN_PAGES = [
  'banners', 'events', 'news', 'courses', 'trainings',
  'about', 'gallery', 'downloads', 'schools',
  'teacher-directory', 'teacher-docs', 'announcements',
  'pageBackgrounds', 'testimonials'
];

// Initialize default master admin
const initializeDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword,
        role: 'superadmin',
        name: 'Master Administrator',
        email: process.env.GMAIL_USER || 'admin@brc.gov.in',
        contactNumber: '9876543210',
        designation: 'Head / Block Education Officer',
        isActive: true,
        isEmailVerified: true,
        allowedPages: ALL_ADMIN_PAGES
      });
      await admin.save();
      console.log('Master Administrator created.');
    } else {
      let updated = false;
      if (!adminExists.role || adminExists.role !== 'superadmin') {
        adminExists.role = 'superadmin';
        updated = true;
      }
      if (!adminExists.name) {
        adminExists.name = 'Master Administrator';
        updated = true;
      }
      if (!adminExists.designation) {
        adminExists.designation = 'Head / Block Education Officer';
        updated = true;
      }
      if (!adminExists.email) {
        adminExists.email = process.env.GMAIL_USER || 'admin@brc.gov.in';
        adminExists.isEmailVerified = true;
        updated = true;
      }
      if (!adminExists.allowedPages || adminExists.allowedPages.length === 0) {
        adminExists.allowedPages = ALL_ADMIN_PAGES;
        updated = true;
      }
      if (updated) {
        await adminExists.save();
        console.log('Master Administrator updated with master details.');
      }
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

connectDB().then(async () => {
  // Initialize default admin after DB connection
  await initializeDefaultAdmin();
  
  // Routes
  app.use('/api', routes);

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`Server connected successfully and running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

module.exports = app;
