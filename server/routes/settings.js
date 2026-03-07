const express = require('express');
const router = express.Router();
const { Settings } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/settings/:key
// @desc    Get setting by key
// @access  Public
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });
    res.json(setting ? setting.value : null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/settings
// @desc    Create or update setting (protected)
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ message: 'Key is required' });
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;