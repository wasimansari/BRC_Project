const mongoose = require('mongoose');

const pageBackgroundSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
    enum: ['home', 'about', 'contact', 'courses', 'events', 'blog', 'gallery', 'searchSchool', 'downloads']
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  backgroundImagePublicId: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PageBackground', pageBackgroundSchema);