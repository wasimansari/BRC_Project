const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Download } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Multer storage for download files (5MB limit)
const downloadStorage = multer.memoryStorage();
const downloadUpload = multer({
  storage: downloadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = (fileBuffer, fileType, originalFilename) => {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadOptions = fileType === 'pdf'
        ? {
            folder: 'brc-downloads',
            resource_type: 'raw',
            // public_id: `${Date.now()}-${originalFilename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`
          }
        : {
            folder: 'brc-downloads',
            resource_type: 'image'
          };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          
          let finalUrl = result.secure_url;
          
          // Ensure PDF URL has .pdf extension
          if (fileType === 'pdf' && !finalUrl.endsWith('.pdf')) {
            finalUrl = finalUrl + '.pdf';
          }
          
          resolve({
            ...result,
            secure_url: finalUrl
          });
        }
      );

      uploadStream.end(fileBuffer);
    } catch (error) {
      reject(error);
    }
  });
};

// @route   GET /api/downloads
// @desc    Get all downloads
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, isActive: true } : { isActive: true };
    const downloads = await Download.find(filter).sort({ createdAt: -1 });
    res.json(downloads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/downloads/categories
// @desc    Get download categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Download.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/downloads
// @desc    Add new download file (protected)
// @access  Private
router.post('/', authenticateToken, downloadUpload.single('file'), async (req, res) => {
  try {
    const { category, title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Check file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }

    // Determine file type
    let fileType = 'image';
    if (req.file.mimetype === 'application/pdf') {
      fileType = 'pdf';
    } else if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        message: 'Only PDF and image files (JPG, PNG, JPEG) are allowed'
      });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, fileType, req.file.originalname);

    const newDownload = new Download({
      category,
      title,
      description,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      fileType,
      fileSize: req.file.size,
      originalFileName: req.file.originalname
    });

    const savedDownload = await newDownload.save();
    res.status(201).json(savedDownload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/downloads/:id
// @desc    Update download file (protected)
// @access  Private
router.put('/:id', authenticateToken, downloadUpload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, description, isActive } = req.body;

    const download = await Download.findById(id);
    if (!download) {
      return res.status(404).json({ message: 'Download file not found' });
    }

    if (req.file) {
      // Check file size (5MB limit)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: 'File size exceeds 5MB limit' });
      }

      // Delete old file from Cloudinary
      const oldResourceType = download.fileType === 'pdf' ? 'raw' : 'image';
      await cloudinary.uploader.destroy(download.filePublicId, { resource_type: oldResourceType });

      // Determine file type from mimetype
      const isPdf = req.file.mimetype === 'application/pdf';
      const fileType = isPdf ? 'pdf' : 'image';

      const uploadResult = await uploadToCloudinary(req.file.buffer, fileType, req.file.originalname);

      download.fileUrl = uploadResult.secure_url;
      download.filePublicId = uploadResult.public_id;
      download.fileSize = req.file.size;
      download.originalFileName = req.file.originalname;
      download.fileType = fileType;
    }

    if (category) download.category = category;
    if (title) download.title = title;
    if (description !== undefined) download.description = description;
    if (isActive !== undefined) download.isActive = isActive === 'true' || isActive === true;

    const updatedDownload = await download.save();
    res.json(updatedDownload);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/downloads/:id
// @desc    Delete download file (protected)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const download = await Download.findById(id);

    if (!download) {
      return res.status(404).json({ message: 'Download file not found' });
    }

    // Delete file from Cloudinary
    const resourceType = download.fileType === 'pdf' ? 'raw' : 'image';
    await cloudinary.uploader.destroy(download.filePublicId, { resource_type: resourceType });

    // Delete from MongoDB
    await Download.findByIdAndDelete(id);

    res.json({ message: 'Download file deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;