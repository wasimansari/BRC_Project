const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Testimonial } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Multer storage for testimonial images
const testimonialStorage = multer.memoryStorage();
const testimonialUpload = multer({ storage: testimonialStorage });

// @route   GET /api/testimonials
// @desc    Get all active testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/testimonials
// @desc    Create a new testimonial with image upload (protected)
// @access  Private
router.post('/', authenticateToken, testimonialUpload.single('image'), async (req, res) => {
  try {
    const { name, role, text, image } = req.body;

    if (!name || !role || !text) {
      return res.status(400).json({ message: 'Name, role, and text are required' });
    }

    let imageUrl = image || '';
    let imagePublicId = '';

    // If file is uploaded, save to Cloudinary
    if (req.file) {
      try {
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'brc-testimonials',
              resource_type: 'auto',
              transformation: [
                { width: 400, height: 500, crop: 'fill', gravity: 'face' } // Passport size: 4x5 ratio
              ]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        const uploadResult = await uploadPromise;
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      } catch (uploadError) {
        return res.status(400).json({ message: 'Image upload failed: ' + uploadError.message });
      }
    }

    const newTestimonial = new Testimonial({
      name,
      role,
      text,
      image: imageUrl,
      imagePublicId,
      isActive: true
    });

    const savedTestimonial = await newTestimonial.save();
    res.status(201).json(savedTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/testimonials/:id
// @desc    Update a testimonial with optional image upload (protected)
// @access  Private
router.put('/:id', authenticateToken, testimonialUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, text, image } = req.body;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Update text fields
    if (name) testimonial.name = name;
    if (role) testimonial.role = role;
    if (text) testimonial.text = text;

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (testimonial.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(testimonial.imagePublicId);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }

      // Upload new image
      try {
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'brc-testimonials',
              resource_type: 'auto',
              transformation: [
                { width: 400, height: 500, crop: 'fill', gravity: 'face' } // Passport size: 4x5 ratio
              ]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        const uploadResult = await uploadPromise;
        testimonial.image = uploadResult.secure_url;
        testimonial.imagePublicId = uploadResult.public_id;
      } catch (uploadError) {
        return res.status(400).json({ message: 'Image upload failed: ' + uploadError.message });
      }
    } else if (image) {
      // Update with URL if provided
      testimonial.image = image;
    }

    const updatedTestimonial = await testimonial.save();
    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete a testimonial (protected)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Delete image from Cloudinary if it exists
    if (testimonial.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(testimonial.imagePublicId);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    await Testimonial.findByIdAndDelete(id);
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/testimonials/:id/toggle
// @desc    Toggle testimonial active status (protected)
// @access  Private
router.put('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.isActive = !testimonial.isActive;
    const updatedTestimonial = await testimonial.save();
    res.json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
