const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Gallery } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Multer storage for gallery images
const galleryStorage = multer.memoryStorage();
const galleryUpload = multer({ storage: galleryStorage });

// @route   GET /api/gallery
// @desc    Get all gallery images
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, isActive: true } : { isActive: true };
    const gallery = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/gallery/category/:category
// @desc    Get gallery by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const gallery = await Gallery.find({ category, isActive: true }).sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/gallery
// @desc    Add new gallery image (protected)
// @access  Private
router.post('/', authenticateToken, galleryUpload.single('image'), async (req, res) => {
  try {
    const { category, title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'brc-gallery' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const uploadResult = await uploadPromise;

    const newGallery = new Gallery({
      category,
      title,
      description,
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id
    });

    const savedGallery = await newGallery.save();
    res.status(201).json(savedGallery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery image (protected)
// @access  Private
router.put('/:id', authenticateToken, galleryUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, description, isActive } = req.body;

    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    if (req.file) {
      await cloudinary.uploader.destroy(gallery.imagePublicId);

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'brc-gallery' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;
      gallery.imageUrl = uploadResult.secure_url;
      gallery.imagePublicId = uploadResult.public_id;
    }

    if (category) gallery.category = category;
    if (title) gallery.title = title;
    if (description !== undefined) gallery.description = description;
    if (isActive !== undefined) gallery.isActive = isActive === 'true' || isActive === true;

    const updatedGallery = await gallery.save();
    res.json(updatedGallery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery image (protected)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    await cloudinary.uploader.destroy(gallery.imagePublicId);
    await Gallery.findByIdAndDelete(id);

    res.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;