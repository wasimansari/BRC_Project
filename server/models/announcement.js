const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Academic', 'Event', 'Notice', 'Holiday']
  },
  categoryClass: {
    type: String,
    required: true,
    enum: ['category-academic', 'category-event', 'category-notice', 'category-holiday']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  imagePublicId: {
    type: String,
    default: null
  },
  link: {
    type: String,
    default: '/notices'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);