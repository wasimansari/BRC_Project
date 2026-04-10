const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { PageBackground } = require('../models');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// @route   GET /api/page-backgrounds
// @desc    Get all page backgrounds
// @access  Public
router.get('/', async (req, res) => {
  try {
    const backgrounds = await PageBackground.find().sort({ pageName: 1 });
    res.json(backgrounds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page backgrounds', error: error.message });
  }
});

// @route   GET /api/page-backgrounds/:pageName
// @desc    Get background for specific page
// @access  Public
router.get('/:pageName', async (req, res) => {
  try {
    const background = await PageBackground.findOne({ pageName: req.params.pageName });
    if (!background) {
      return res.status(404).json({ message: 'Page background not found' });
    }
    res.json(background);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page background', error: error.message });
  }
});

// @route   POST /api/page-backgrounds
// @desc    Create or update a page background
// @access  Public
router.post('/', upload.single('backgroundImage'), async (req, res) => {
  try {
    const { pageName, title, subtitle, isActive } = req.body;

    let backgroundImage = '';
    let backgroundImagePublicId = '';

    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'page-backgrounds' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;
      backgroundImage = uploadResult.secure_url;
      backgroundImagePublicId = uploadResult.public_id;
    } else if (req.body.existingBackgroundImage) {
      backgroundImage = req.body.existingBackgroundImage;
    }

    // Check if background for this page already exists
    let background = await PageBackground.findOne({ pageName });

    if (background) {
      // Update existing
      if (backgroundImage) background.backgroundImage = backgroundImage;
      if (backgroundImagePublicId) background.backgroundImagePublicId = backgroundImagePublicId;
      if (title !== undefined) background.title = title;
      if (subtitle !== undefined) background.subtitle = subtitle;
      if (isActive !== undefined) background.isActive = isActive === 'true' || isActive === true;
    } else {
      // Create new
      background = new PageBackground({
        pageName,
        backgroundImage,
        backgroundImagePublicId,
        title: title || '',
        subtitle: subtitle || '',
        isActive: isActive !== 'false'
      });
    }

    const savedBackground = await background.save();
    res.status(201).json(savedBackground);
  } catch (error) {
    console.error("Error saving page background:", error);
    res.status(500).json({ message: 'Error saving page background', error: error.message });
  }
});

// @route   DELETE /api/page-backgrounds/:id
// @desc    Delete a page background
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const background = await PageBackground.findByIdAndDelete(req.params.id);
    if (!background) {
      return res.status(404).json({ message: 'Page background not found' });
    }
    res.json({ message: 'Page background deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting page background', error: error.message });
  }
});

module.exports = router;