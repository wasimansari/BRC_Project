const mongoose = require('mongoose');

// Dynamic Column Definition Schema
const columnConfigSchema = new mongoose.Schema({
  id: { type: String, required: true },
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'date', 'calculated'], default: 'text' },
  category: { type: String, enum: ['info', 'earning', 'deduction', 'summary', 'other'], default: 'info' },
  calculationType: { 
    type: String, 
    enum: ['none', 'srNo', 'da', 'hra', 'medical', 'gross', 'nps', 'totalDeduction', 'netPayment', 'custom'], 
    default: 'none' 
  },
  rate: { type: Number, default: null }, // e.g. 63 for DA, 5 for HRA, 10 for NPS
  defaultValue: { type: mongoose.Schema.Types.Mixed, default: null },
  isRemovable: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  width: { type: String, default: 'auto' }
}, { _id: false });

// Salary Slip / Absentee Statement Schema
const salarySlipSchema = new mongoose.Schema({
  udiseCode: { type: String, required: true, index: true },
  schoolName: { type: String, required: true },
  month: { type: String, required: true }, // e.g. 'November'
  year: { type: Number, required: true },  // e.g. 2026
  title: { type: String, default: 'अनुपस्थित एवं वेतन विवरणी' },
  status: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Draft' },
  columns: [columnConfigSchema],
  rows: [{ type: mongoose.Schema.Types.Mixed }], // Flexible array of teacher row objects
  totals: { type: mongoose.Schema.Types.Mixed, default: {} },
  notes: { type: String, default: '' },
  headmasterName: { type: String, default: '' },
  headmasterDesignation: { type: String, default: 'Head Master (प्रधानाध्यापक)' },
  headmasterSignatureUrl: { type: String, default: '' },
  schoolSealUrl: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  creatorName: { type: String, default: '' },
  submittedAt: { type: Date },
  actionBy: {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    adminName: { type: String, default: '' },
    adminDesignation: { type: String, default: '' },
    signatureUrl: { type: String, default: '' },
    actionDate: { type: Date },
    remarks: { type: String, default: '' }
  }
}, { timestamps: true });

// Compound index for quick lookup per school & month & year
salarySlipSchema.index({ udiseCode: 1, month: 1, year: 1 });

module.exports = mongoose.model('SalarySlip', salarySlipSchema);
