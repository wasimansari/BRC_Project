const express = require('express');
const router = express.Router();
const { News } = require('../models');

// @route   GET /api/news
// @desc    Get all news
// @access  Public
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
});

// @route   POST /api/news
// @desc    Create a new news
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    const news = new News({
      title,
      description,
      image: 'https://via.placeholder.com/400x250/007bff/ffffff?text=News'
    });

    const savedNews = await news.save();
    res.json(savedNews);
  } catch (error) {
    res.status(500).json({ message: 'Error creating news', error: error.message });
  }
});

// @route   DELETE /api/news/:id
// @desc    Delete a news
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting news', error: error.message });
  }
});

module.exports = router;