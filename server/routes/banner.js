const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Banner } = require('../models');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// @route   GET /api/banners
// @desc    Get all active banners
// @access  Public
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// @route   GET /api/banners/all
// @desc    Get all banners (including inactive)
// @access  Public
router.get('/all', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// @route   POST /api/banners
// @desc    Create a new banner
// @access  Public (can be protected if needed)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, order, isActive } = req.body;

    let imageUrl = 'https://via.placeholder.com/1920x750/1e3c72/ffffff?text=Banner';

    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'school-banners' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;
      imageUrl = uploadResult.secure_url;
    }

    const banner = new Banner({
      title,
      description,
      image: imageUrl,
      order: order || 0,
      isActive: isActive !== 'false'
    });

    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
});

// @route   PUT /api/banners/:id
// @desc    Update a banner
// @access  Public (can be protected if needed)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, order, isActive } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    if (title) banner.title = title;
    if (description) banner.description = description;
    if (order !== undefined) banner.order = parseInt(order);
    if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'school-banners' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;
      banner.image = uploadResult.secure_url;
    } else if (req.body.existingImage) {
      banner.image = req.body.existingImage;
    }

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating banner', error: error.message });
  }
});

// @route   DELETE /api/banners/:id
// @desc    Delete a banner
// @access  Public (can be protected if needed)
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
});

module.exports = router;