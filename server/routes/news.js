const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const { News } = require('../models');

// Bug Fix 3: Use memoryStorage instead of disk - Render free tier has no persistent disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   GET /api/news
// @desc    Get all news (with filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, active, limit, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by category if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by active status if provided
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    // Pagination
    const limitNum = parseInt(limit) || 50;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;
    
    const news = await News.find(query)
      .sort({ displayOrder: -1, publishDate: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      data: news,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
});

// @route   GET /api/news/:id
// @desc    Get news by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
});

// @route   POST /api/news
// @desc    Create a new news with file upload
// @access  Public
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, author, tags, contentType, textContent, isActive, displayOrder } = req.body;
    
    let newsData = {
      title,
      description,
      category: category || 'Other',
      author: author || 'Admin',
      tags: tags ? JSON.parse(tags) : [],
      isActive: isActive !== 'false',
      displayOrder: parseInt(displayOrder) || 0,
      content: {
        type: contentType || 'text'
      }
    };
    
    // Handle file upload to Cloudinary
    if (req.file) {
      try {
        // Bug Fix 3: Use upload_stream with buffer (memoryStorage) instead of upload with file path (diskStorage)
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'brc-project/department-news', resource_type: 'auto' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        if (contentType === 'image') {
          newsData.content.imageUrl = uploadResult.secure_url;
          // Bug Fix 4: Store public_id for reliable deletion later
          newsData.content.imagePublicId = uploadResult.public_id;
          newsData.content.thumbnailUrl = cloudinary.url(uploadResult.public_id, {
            width: 400,
            height: 300,
            crop: 'fill',
            quality: 'auto'
          });
        } else if (contentType === 'pdf') {
          newsData.content.pdfUrl = uploadResult.secure_url;
          // Bug Fix 4: Store public_id for reliable deletion later
          newsData.content.pdfPublicId = uploadResult.public_id;
          newsData.content.fileName = req.file.originalname;
          newsData.content.fileSize = req.file.size;
        }

        // Legacy image field for backward compatibility
        newsData.image = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Error uploading file', error: uploadError.message });
      }
    }
    
    // Add text content if provided
    if (contentType === 'text' && textContent) {
      newsData.content.text = textContent;
    }
    
    const news = new News(newsData);
    const savedNews = await news.save();
    
    res.json({ success: true, data: savedNews, message: 'News created successfully' });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Error creating news', error: error.message });
  }
});

// @route   PUT /api/news/:id
// @desc    Update news
// @access  Public
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, author, tags, contentType, textContent, isActive, displayOrder } = req.body;
    
    let updateData = {
      title,
      description,
      category: category || 'Other',
      author: author || 'Admin',
      tags: tags ? JSON.parse(tags) : [],
      isActive: isActive !== 'false',
      displayOrder: parseInt(displayOrder) || 0,
      content: {
        type: contentType || 'text'
      }
    };
    
    // Handle file upload to Cloudinary
    if (req.file) {
      try {
        // Bug Fix 3: Use upload_stream with buffer (memoryStorage) instead of upload with file path
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'brc-project/department-news', resource_type: 'auto' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        if (contentType === 'image') {
          updateData.content.imageUrl = uploadResult.secure_url;
          // Bug Fix 4: Store public_id for reliable deletion
          updateData.content.imagePublicId = uploadResult.public_id;
          updateData.content.thumbnailUrl = cloudinary.url(uploadResult.public_id, {
            width: 400,
            height: 300,
            crop: 'fill',
            quality: 'auto'
          });
        } else if (contentType === 'pdf') {
          updateData.content.pdfUrl = uploadResult.secure_url;
          // Bug Fix 4: Store public_id for reliable deletion
          updateData.content.pdfPublicId = uploadResult.public_id;
          updateData.content.fileName = req.file.originalname;
          updateData.content.fileSize = req.file.size;
        }

        // Legacy image field for backward compatibility
        updateData.image = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Error uploading file', error: uploadError.message });
      }
    }
    
    // Add text content if provided
    if (contentType === 'text' && textContent) {
      updateData.content.text = textContent;
    }
    
    const news = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    res.json({ success: true, data: news, message: 'News updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating news', error: error.message });
  }
});

// @route   DELETE /api/news/:id
// @desc    Delete news
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Bug Fix 4: Use stored public_id directly instead of reconstructing from URL
    if (news.content && (news.content.imagePublicId || news.content.pdfPublicId)) {
      try {
        const publicId = news.content.imagePublicId || news.content.pdfPublicId;
        const resourceType = news.content.pdfPublicId ? 'raw' : 'image';
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (cloudinaryError) {
        console.error('Failed to delete file from Cloudinary:', cloudinaryError);
      }
    } else if (news.content && news.content.imageUrl) {
      // Legacy fallback: reconstruct public_id from URL (best effort)
      try {
        const urlParts = news.content.imageUrl.split('/upload/');
        if (urlParts.length > 1) {
          const publicId = urlParts[1].replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Failed to delete legacy image from Cloudinary:', cloudinaryError);
      }
    }
    
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting news', error: error.message });
  }
});

// @route   PATCH /api/news/:id/toggle
// @desc    Toggle news status
// @access  Public
router.patch('/:id/toggle', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    news.isActive = !news.isActive;
    await news.save();
    
    res.json({ 
      success: true, 
      data: news, 
      message: `News ${news.isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling news status', error: error.message });
  }
});

// @route   GET /api/news/categories/list
// @desc    Get news categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const dbCategories = (await News.distinct('category')) || [];

    const fallback = [
      'BRC Mehsi Updates',
      'District Updates',
      'Teacher News',
      'Student News',
      'HM/HT News',
      'Class Teacher Updates',
      'eShikshaKosh Updates',
      'UDISE+ Updates',
      'Transfer & Posting',
      'Training Programs',
      'Meetings & Events'
    ];

    // Clean DB categories and merge with fallback preserving fallback order
    const cleanedDb = dbCategories.map(c => (c || '').toString().trim()).filter(Boolean);
    const merged = [...fallback];
    cleanedDb.forEach(c => {
      if (!merged.includes(c)) merged.push(c);
    });

    res.json({ success: true, data: merged });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

module.exports = router;