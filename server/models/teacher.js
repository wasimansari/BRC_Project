const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  udiseCode: { type: String, required: true },
  mobileNo: { type: String, required: true },
  schoolName: { type: String, required: true },
  fullName: { type: String, default: '' },
  password: { type: String, default: '' },
  otp: { type: String, select: false },
  otpExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

teacherSchema.index({ udiseCode: 1, mobileNo: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
