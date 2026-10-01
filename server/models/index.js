const mongoose = require('mongoose');

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// News Schema (Enhanced for Department News)
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  // Bug Fix 9: Removed restrictive enum — categories come from routes/news.js dynamically
  // Previous enum only allowed 5 values but real data has 11+ categories
  category: { type: String, required: true, default: 'Other' },
  author: { type: String, required: true, trim: true, maxlength: 100 },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0, min: 0 },
  publishDate: { type: Date, default: Date.now },
  content: {
    type: { type: String, enum: ['text', 'image', 'pdf'], required: true },
    text: { type: String },
    imageUrl: { type: String },
    thumbnailUrl: { type: String },
    // Bug Fix 4 (schema support): Store Cloudinary public_ids for reliable file deletion
    imagePublicId: { type: String },
    pdfUrl: { type: String },
    pdfPublicId: { type: String },
    fileName: { type: String },
    fileSize: { type: Number }
  },
  // Legacy fields for backward compatibility
  image: { type: String }
}, { timestamps: true });

// Training Schema
const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String }, // Custom route link for frontend
  category: { type: String }, // e.g. Academic, Digital, etc.
  fromDate: { type: Date },
  toDate: { type: Date },
  thumbnailUrl: { type: String },
  thumbnailPublicId: { type: String },
  documentUrl: { type: String },
  documentPublicId: { type: String },
  documentOriginalName: { type: String },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
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

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  udiseCode:   { type: String, required: true },
  mobileNo:    { type: String, required: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  schoolName:  { type: String, required: true },
  fullName:    { type: String, default: '' },
  password:    { type: String, default: '', select: false },
  otp:         { type: String, select: false },
  otpExpiresAt:{ type: Date, select: false },
  isVerified:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

teacherSchema.index({ udiseCode: 1, mobileNo: 1 }, { unique: true });

// TeacherDocument Schema — for dashboard uploads
const teacherDocumentSchema = new mongoose.Schema({
  udiseCode:   { type: String, required: true },
  teacherName: { type: String, default: '' },
  title:       { type: String, required: true },
  docType:     { type: String, enum: ['Letter', 'Absentee', 'Report', 'Circular', 'Other'], default: 'Other' },
  description: { type: String, default: '' },
  fileUrl:     { type: String, required: true },
  filePublicId:{ type: String, default: '' },
  fileName:    { type: String, default: '' },
  fileSize:    { type: Number, default: 0 },
  mimeType:    { type: String, default: '' },
  uploadedAt:  { type: Date, default: Date.now },
  status:      { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminRemarks:{ type: String, default: '' }
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

// Announcement Schema
const announcementSchema = new mongoose.Schema({
  day: { type: String, required: true },
  month: { type: String, required: true },
  category: { type: String, required: true, enum: ['Academic', 'Event', 'Notice', 'Holiday'] },
  categoryClass: { type: String, required: true, enum: ['category-academic', 'category-event', 'category-notice', 'category-holiday'] },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: null },
  imagePublicId: { type: String, default: null },
  link: { type: String, default: '/notices' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Page Background Schema
const pageBackgroundSchema = new mongoose.Schema({
  pageName: { type: String, required: true, enum: ['home', 'about', 'contact', 'courses', 'events', 'blog', 'gallery', 'searchSchool', 'downloads', 'trainings'] },
  backgroundImage: { type: String, default: '' },
  backgroundImagePublicId: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
}, { timestamps: true });

// Testimonial Schema
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Teacher Directory Schema
const teacherDirectorySchema = new mongoose.Schema({
  srNo: { type: Number, required: true },
  teacherId: { type: String, required: true, unique: true },
  teacherName: { type: String, required: true },
  class: { type: String, default: '' },
  subject: { type: String, default: '' },
  highestQualification: { type: String, default: '' },
  schoolName: { type: String, required: true },
  udise: { type: String, required: true },
  contactNo: { type: String, default: '' },
  postingBlock: { type: String, default: '' },
  postingDistrict: { type: String, default: '' },
  homeDistrict: { type: String, default: '' },
  isCrcSchool: { type: String, enum: ['Yes', 'No', ''], default: '' },
  crcSchool: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Create and export models
const Event = mongoose.model('Event', eventSchema);
const News = mongoose.model('News', newsSchema);
const Course = mongoose.model('Course', courseSchema);
const Training = mongoose.model('Training', trainingSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Banner = mongoose.model('Banner', bannerSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const About = mongoose.model('About', aboutSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const Download = mongoose.model('Download', downloadSchema);
const School = mongoose.model('School', schoolSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const PageBackground = mongoose.model('PageBackground', pageBackgroundSchema);
const Testimonial = mongoose.model('Testimonial', testimonialSchema);
const TeacherDirectory = mongoose.model('TeacherDirectory', teacherDirectorySchema);
const TeacherDocument = mongoose.model('TeacherDocument', teacherDocumentSchema);

module.exports = {
  Event,
  News,
  Course,
  Training,
  Admin,
  Teacher,
  Banner,
  Settings,
  About,
  Gallery,
  Download,
  School,
  Announcement,
  PageBackground,
  Testimonial,
  TeacherDirectory,
  TeacherDocument
};

