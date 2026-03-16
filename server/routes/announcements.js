const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Announcement } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'brc-announcements',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @route   GET /api/announcements
// @desc    Get all active announcements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
});

// @route   GET /api/announcements/all
// @desc    Get all announcements (including inactive) for admin
// @access  Private
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
});

// @route   POST /api/announcements
// @desc    Create a new announcement with optional image
// @access  Private
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { day, month, category, categoryClass, title, description, link, displayOrder, existingImage } = req.body;

    let imageUrl = existingImage || null;
    let imagePublicId = null;

    // Handle image upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.url;
        imagePublicId = result.publicId;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue without image if upload fails
      }
    }

    const announcement = new Announcement({
      day,
      month,
      category,
      categoryClass,
      title,
      description,
      image: imageUrl,
      imagePublicId,
      link: link || '/notices',
      displayOrder: displayOrder || 0
    });

    const savedAnnouncement = await announcement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update an announcement with optional image
// @access  Private
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { day, month, category, categoryClass, title, description, link, isActive, displayOrder, existingImage, removeImage } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    let imageUrl = announcement.image;
    let imagePublicId = announcement.imagePublicId;

    // Handle image removal
    if (removeImage === 'true' && announcement.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(announcement.imagePublicId, { resource_type: 'image' });
      } catch (err) {
        console.error('Error deleting old image:', err);
      }
      imageUrl = null;
      imagePublicId = null;
    }
    // Handle new image upload
    else if (req.file) {
      // Delete old image if exists
      if (announcement.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(announcement.imagePublicId, { resource_type: 'image' });
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.url;
        imagePublicId = result.publicId;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
      }
    } else if (existingImage && existingImage !== announcement.image) {
      // Use new existing image URL
      imageUrl = existingImage;
    }

    announcement.day = day;
    announcement.month = month;
    announcement.category = category;
    announcement.categoryClass = categoryClass;
    announcement.title = title;
    announcement.description = description;
    announcement.image = imageUrl;
    announcement.imagePublicId = imagePublicId;
    announcement.link = link || '/notices';
    announcement.isActive = isActive;
    announcement.displayOrder = displayOrder || 0;

    const updatedAnnouncement = await announcement.save();
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
});

// @route   PATCH /api/announcements/:id/toggle
// @desc    Toggle announcement active status
// @access  Private
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.isActive = !announcement.isActive;
    const updatedAnnouncement = await announcement.save();
    
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error toggling announcement:', error);
    res.status(500).json({ message: 'Error toggling announcement status', error: error.message });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Delete image from Cloudinary if exists
    if (announcement.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(announcement.imagePublicId, { resource_type: 'image' });
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
});

module.exports = router;