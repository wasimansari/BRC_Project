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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Initialize default admin
const initializeDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({ username: 'admin', password: hashedPassword, role: 'superadmin' });
      await admin.save();
      console.log('Default superadmin user created');
    } else if (!adminExists.role) {
      adminExists.role = 'superadmin';
      await adminExists.save();
      console.log('Existing admin updated to superadmin');
    }
  } catch (error) {
    console.log('Error creating admin:', error);
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
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

module.exports = app;