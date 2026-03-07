const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const bannerRoutes = require('./banner');
const eventRoutes = require('./events');
const newsRoutes = require('./news');
const aboutRoutes = require('./about');
const galleryRoutes = require('./gallery');
const downloadRoutes = require('./downloads');
const courseRoutes = require('./courses');
const settingsRoutes = require('./settings');
const schoolRoutes = require('./schools');

// Use routes
router.use('/auth', authRoutes);
router.use('/banners', bannerRoutes);
router.use('/events', eventRoutes);
router.use('/news', newsRoutes);
router.use('/about', aboutRoutes);
router.use('/gallery', galleryRoutes);
router.use('/downloads', downloadRoutes);
router.use('/courses', courseRoutes);
router.use('/settings', settingsRoutes);
router.use('/schools', schoolRoutes);

module.exports = router;