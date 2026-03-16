const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const https = require('https');
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
          resource_type: 'raw'  // Use 'raw' for PDF files
        }
        : {
          folder: 'brc-downloads',
          resource_type: 'image'
        };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);

          if (fileType === 'pdf') {
            finalUrl = finalUrl.replace('/image/upload/', '/raw/upload/');
            if (!finalUrl.endsWith('.pdf')) {
              finalUrl += '.pdf';
            }
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

      // Delete old file from Cloudinary - try both 'raw' and 'auto' for PDFs
      if (download.fileType === 'pdf') {
        try {
          await cloudinary.uploader.destroy(download.filePublicId, { resource_type: 'raw' });
        } catch (err) {
          try {
            await cloudinary.uploader.destroy(download.filePublicId, { resource_type: 'auto' });
          } catch (err2) {
            console.error('Error deleting old PDF from Cloudinary:', err2);
          }
        }
      } else {
        await cloudinary.uploader.destroy(download.filePublicId, { resource_type: 'image' });
      }

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

// @route   GET /api/downloads/:id/download
// @desc    Download a file by ID (proxied through server to avoid CORS issues)
// @access  Public
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const download = await Download.findById(id);

    if (!download) {
      return res.status(404).json({ message: 'Download file not found' });
    }

    const fileUrl = download.fileUrl;
    if (download.fileType === 'pdf') {
      fileUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
    }
    const fileName = download.originalFileName || `${download.title}.${download.fileType === 'pdf' ? 'pdf' : 'jpg'}`;

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    if (download.fileType === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
    }

    // Fetch the file from Cloudinary and pipe to response
    const request = https.get(fileUrl, { timeout: 30000 }, (cloudinaryRes) => {
      if (cloudinaryRes.statusCode !== 200) {
        return res.status(cloudinaryRes.statusCode).json({ message: 'Failed to fetch file from storage' });
      }

      cloudinaryRes.pipe(res);
    });

    request.on('timeout', () => {
      request.destroy();
      res.status(504).json({ message: 'Download request timed out' });
    });

    request.on('error', (error) => {
      console.error('Error fetching file:', error);
      res.status(500).json({ message: 'Error downloading file' });
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
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

    // Delete file from Cloudinary - try both 'raw' and 'auto' for PDFs (legacy support)
    let cloudinaryDeleteError = null;
    if (download.fileType === 'pdf') {
      try {
        await cloudinary.uploader.destroy(download.filePublicId, { resource_type: 'raw' });
      } catch (err) {
        console.log('PDF delete with raw failed, trying auto:', err.message);
        // Try with 'auto' if 'raw' fails (for files uploaded with older code)
        try {
          await cloudinary.uploader.destroy(download.filePublicId, { resource_type: 'auto' });
        } catch (err2) {
          console.log('PDF delete with auto also failed:', err2.message);
          cloudinaryDeleteError = err2;
        }
      }
    } else {
      try {
        await cloudinary.uploader.destroy(download.filePublicId, { resource_type: 'image' });
      } catch (err) {
        cloudinaryDeleteError = err;
      }
    }

    if (cloudinaryDeleteError) {
      console.error('Cloudinary delete error:', cloudinaryDeleteError);
    }

    // Delete from MongoDB
    await Download.findByIdAndDelete(id);

    res.json({ message: 'Download file deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;