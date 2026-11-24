const mongoose = require('mongoose');

const schoolTeacherMasterSchema = new mongoose.Schema({
  udiseCode: { type: String, required: true, default: '10021507703', index: true },
  schoolName: { type: String, default: 'Government School' },
  teacherName: { type: String, required: true },
  teacherType: { type: String, default: 'TRE-1' }, // HEAD MASTER, TRE-1, TRE-2, TRE-3, Niyojit, Regular, etc.
  teacherClass: { type: String, default: '11-12th' }, // 1-5th, 6-8th, 9-10th, 11-12th
  pranNo: { type: String, default: '' }, // PRAN / UAN / GPF Number
  dob: { type: String, default: '' }, // DD-MM-YYYY
  teacherId: { type: String, default: '' }, // E-Shikshakosh Teacher ID
  accountNo: { type: String, default: '' }, // Bank Account Number
  basicPay: { type: Number, default: 0 }, // Individual Basic Salary
  customFields: { type: mongoose.Schema.Types.Mixed, default: {} }, // Dynamic extensible attributes
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

schoolTeacherMasterSchema.index({ udiseCode: 1, teacherName: 1 });

module.exports = mongoose.model('SchoolTeacherMaster', schoolTeacherMasterSchema);
