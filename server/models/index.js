const mongoose = require('mongoose');

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// News Schema
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  createdAt: { type: Date, default: Date.now }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' }
});

// Banner Schema
const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Settings Schema
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

// About Schema
const aboutSchema = new mongoose.Schema({
  vision: { type: String },
  mission: [{ type: String }],
  beoProfile: {
    name: { type: String },
    qualification: { type: String },
    experience: { type: String },
    mobile: { type: String },
    email: { type: String },
    message: { type: String },
    image: { type: String }
  },
  organizationalStructure: [{
    role: { type: String },
    icon: { type: String },
    color: { type: String }
  }],
  staffDetails: [{
    name: { type: String },
    designation: { type: String },
    mobile: { type: String },
    email: { type: String },
    image: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Gallery Schema
const gallerySchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Download Schema
const downloadSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'image'], required: true },
  fileSize: { type: Number, default: 0 },
  originalFileName: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// School Schema
const schoolSchema = new mongoose.Schema({
  srNo: { type: Number, required: true },
  district: { type: String, required: true },
  block: { type: String, required: true },
  udiseCode: { type: String, required: true, unique: true },
  schoolName: { type: String, required: true },
  hmHtName: { type: String, default: '' },
  mobileNo: { type: String, default: '' },
  crc: { type: String, enum: ['Yes', 'No', ''], default: '' },
  crcName: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Create and export models
const Event = mongoose.model('Event', eventSchema);
const News = mongoose.model('News', newsSchema);
const Course = mongoose.model('Course', courseSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Banner = mongoose.model('Banner', bannerSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const About = mongoose.model('About', aboutSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const Download = mongoose.model('Download', downloadSchema);
const School = mongoose.model('School', schoolSchema);

module.exports = {
  Event,
  News,
  Course,
  Admin,
  Banner,
  Settings,
  About,
  Gallery,
  Download,
  School
};