const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const { News } = require('../models');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

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
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'brc-project/department-news',
          resource_type: 'auto'
        });
        
        if (contentType === 'image') {
          newsData.content.imageUrl = result.secure_url;
          newsData.content.thumbnailUrl = cloudinary.url(result.public_id, {
            width: 400,
            height: 300,
            crop: 'fill',
            quality: 'auto'
          });
        } else if (contentType === 'pdf') {
          newsData.content.pdfUrl = result.secure_url;
          newsData.content.fileName = req.file.originalname;
          newsData.content.fileSize = req.file.size;
        }
        
        // Legacy image field for backward compatibility
        newsData.image = result.secure_url;
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
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'brc-project/department-news',
          resource_type: 'auto'
        });
        
        if (contentType === 'image') {
          updateData.content.imageUrl = result.secure_url;
          updateData.content.thumbnailUrl = cloudinary.url(result.public_id, {
            width: 400,
            height: 300,
            crop: 'fill',
            quality: 'auto'
          });
        } else if (contentType === 'pdf') {
          updateData.content.pdfUrl = result.secure_url;
          updateData.content.fileName = req.file.originalname;
          updateData.content.fileSize = req.file.size;
        }
        
        // Legacy image field for backward compatibility
        updateData.image = result.secure_url;
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
    
    // Delete associated files from Cloudinary
    if (news.content && news.content.imageUrl) {
      try {
        const publicId = news.content.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`brc-project/department-news/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
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