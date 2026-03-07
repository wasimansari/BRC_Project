const mongoose = require('mongoose');

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

const School = mongoose.model('School', schoolSchema);

module.exports = School;