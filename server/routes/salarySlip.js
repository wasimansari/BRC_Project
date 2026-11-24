const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { SalarySlip, Teacher, School, TeacherDirectory } = require('../models');

// ── Auth Middleware: Accepts Teacher or Admin JWT ─────────────────────────
function authenticateTeacherOrAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ── Default 18 Columns Configuration (Bihar Govt Teacher Absentee Format) ──
const DEFAULT_COLUMNS = [
  { id: 'col_1', key: 'srNo', label: 'क्रम संख्या', type: 'number', category: 'info', calculationType: 'srNo', isRemovable: false, order: 1, width: '60px' },
  { id: 'col_2', key: 'teacherName', label: 'शिक्षक / शिक्षिका का नाम', type: 'text', category: 'info', calculationType: 'none', isRemovable: false, order: 2, width: '180px' },
  { id: 'col_3', key: 'pranNo', label: 'PRAN NO. / UAN NO.', type: 'text', category: 'info', calculationType: 'none', isRemovable: true, order: 3, width: '140px' },
  { id: 'col_4', key: 'teacherType', label: 'शिक्षक का प्रकार', type: 'text', category: 'info', calculationType: 'none', isRemovable: true, order: 4, width: '110px' },
  { id: 'col_5', key: 'teacherClass', label: 'शिक्षक का वर्ग', type: 'text', category: 'info', calculationType: 'none', isRemovable: true, order: 5, width: '90px' },
  { id: 'col_6', key: 'dob', label: 'Date Of Birth', type: 'text', category: 'info', calculationType: 'none', isRemovable: true, order: 6, width: '110px' },
  { id: 'col_7', key: 'shikshakoshId', label: 'E-Shikshakosh Teacher Id', type: 'text', category: 'info', calculationType: 'none', isRemovable: true, order: 7, width: '120px' },
  { id: 'col_8', key: 'accountNo', label: 'खाता संख्या', type: 'text', category: 'info', calculationType: 'none', isRemovable: true, order: 8, width: '140px' },
  { id: 'col_9', key: 'basicPay', label: 'मूल वेतन', type: 'number', category: 'earning', calculationType: 'none', isRemovable: false, order: 9, width: '100px' },
  { id: 'col_10', key: 'da', label: 'महंगाई भत्ता (63%)', type: 'number', category: 'earning', calculationType: 'da', rate: 63, isRemovable: true, order: 10, width: '110px' },
  { id: 'col_11', key: 'hra', label: 'आवास भत्ता (5%)', type: 'number', category: 'earning', calculationType: 'hra', rate: 5, isRemovable: true, order: 11, width: '100px' },
  { id: 'col_12', key: 'medical', label: 'चिकित्सा भत्ता', type: 'number', category: 'earning', calculationType: 'medical', defaultValue: 1000, isRemovable: true, order: 12, width: '90px' },
  { id: 'col_13', key: 'grossSalary', label: 'योग(9+10+11+12)', type: 'number', category: 'summary', calculationType: 'gross', isRemovable: true, order: 13, width: '110px' },
  { id: 'col_14', key: 'gpfNps', label: 'GPF/NPS Deduction', type: 'number', category: 'deduction', calculationType: 'nps', rate: 10, isRemovable: true, order: 14, width: '110px' },
  { id: 'col_15', key: 'gli', label: 'GLI', type: 'number', category: 'deduction', calculationType: 'none', defaultValue: 30, isRemovable: true, order: 15, width: '70px' },
  { id: 'col_16', key: 'itr', label: 'ITR', type: 'number', category: 'deduction', calculationType: 'none', defaultValue: 0, isRemovable: true, order: 16, width: '70px' },
  { id: 'col_17', key: 'totalDeduction', label: 'योग(14+15+16)', type: 'number', category: 'summary', calculationType: 'totalDeduction', isRemovable: true, order: 17, width: '110px' },
  { id: 'col_18', key: 'netPayment', label: 'Net Payment', type: 'number', category: 'summary', calculationType: 'netPayment', isRemovable: true, order: 18, width: '110px' }
];

// ── Sample 9 Rows from Attached Bihar Govt Document ────────────────────────
const SAMPLE_ROWS = [
  {
    srNo: 1,
    teacherName: 'DAYA SHANKAR PRASAD',
    pranNo: '110212956449',
    teacherType: 'HEAD MASTER',
    teacherClass: '',
    dob: '25-01-1983',
    shikshakoshId: '42623074',
    accountNo: '39649662313',
    basicPay: 36100,
    da: 22743,
    hra: 1805,
    medical: 1000,
    grossSalary: 61648,
    gpfNps: 5884,
    gli: 30,
    itr: 0,
    totalDeduction: 5914,
    netPayment: 55734
  },
  {
    srNo: 2,
    teacherName: 'MD WASIM AKRAM',
    pranNo: '110168607520',
    teacherType: 'TRE-1',
    teacherClass: '11-12th',
    dob: '15-01-1989',
    shikshakoshId: '24264975',
    accountNo: '42464684671',
    basicPay: 34970,
    da: 22031,
    hra: 1749,
    medical: 1000,
    grossSalary: 59750,
    gpfNps: 5700,
    gli: 30,
    itr: 0,
    totalDeduction: 5730,
    netPayment: 54020
  },
  {
    srNo: 3,
    teacherName: 'PRADEEP KUMAR',
    pranNo: '110109717949',
    teacherType: 'TRE-2',
    teacherClass: '11-12th',
    dob: '15-02-1987',
    shikshakoshId: '24106220',
    accountNo: '39474762948',
    basicPay: 33950,
    da: 21389,
    hra: 1698,
    medical: 1000,
    grossSalary: 58037,
    gpfNps: 5534,
    gli: 30,
    itr: 0,
    totalDeduction: 5564,
    netPayment: 52473
  },
  {
    srNo: 4,
    teacherName: 'ABHISHEK KUMAR',
    pranNo: '110203544471',
    teacherType: 'TRE-3',
    teacherClass: '11-12th',
    dob: '05-07-1991',
    shikshakoshId: '81270164',
    accountNo: '32294018130',
    basicPay: 32960,
    da: 20765,
    hra: 1648,
    medical: 1000,
    grossSalary: 56373,
    gpfNps: 5373,
    gli: 30,
    itr: 0,
    totalDeduction: 5403,
    netPayment: 50971
  },
  {
    srNo: 5,
    teacherName: 'PRABHAKAR KUMAR BITU',
    pranNo: '110261112101',
    teacherType: 'TRE-3',
    teacherClass: '11-12th',
    dob: '28-10-1997',
    shikshakoshId: '81269670',
    accountNo: '40584057566',
    basicPay: 32960,
    da: 20765,
    hra: 1648,
    medical: 1000,
    grossSalary: 56373,
    gpfNps: 5373,
    gli: 30,
    itr: 0,
    totalDeduction: 5403,
    netPayment: 50971
  },
  {
    srNo: 6,
    teacherName: 'MINTU KUMARI',
    pranNo: '110202865013',
    teacherType: 'TRE-3',
    teacherClass: '11-12th',
    dob: '05-04-1987',
    shikshakoshId: '91421448',
    accountNo: '33735180539',
    basicPay: 32960,
    da: 20765,
    hra: 1648,
    medical: 1000,
    grossSalary: 56373,
    gpfNps: 5373,
    gli: 30,
    itr: 0,
    totalDeduction: 5403,
    netPayment: 50971
  },
  {
    srNo: 7,
    teacherName: 'PRIYANKA SHIVAM',
    pranNo: '110233245598',
    teacherType: 'TRE-3',
    teacherClass: '11-12th',
    dob: '16-01-1986',
    shikshakoshId: '91318304',
    accountNo: '32047627893',
    basicPay: 32960,
    da: 20765,
    hra: 1648,
    medical: 1000,
    grossSalary: 56373,
    gpfNps: 5373,
    gli: 30,
    itr: 0,
    totalDeduction: 5403,
    netPayment: 50971
  },
  {
    srNo: 8,
    teacherName: 'DIPTI',
    pranNo: '110149913452',
    teacherType: 'TRE-1',
    teacherClass: '9-10th',
    dob: '08-01-1988',
    shikshakoshId: '24206692',
    accountNo: '42512512303',
    basicPay: 33880,
    da: 21344,
    hra: 1695,
    medical: 1000,
    grossSalary: 57919,
    gpfNps: 5522,
    gli: 30,
    itr: 0,
    totalDeduction: 5552,
    netPayment: 52367
  },
  {
    srNo: 9,
    teacherName: 'SUNIL KUMAR',
    pranNo: '110109748196',
    teacherType: 'TRE-1',
    teacherClass: '9-10th',
    dob: '04-11-1985',
    shikshakoshId: '18295637',
    accountNo: '31522478100',
    basicPay: 33880,
    da: 21344,
    hra: 1695,
    medical: 1000,
    grossSalary: 57919,
    gpfNps: 5522,
    gli: 30,
    itr: 0,
    totalDeduction: 5552,
    netPayment: 52367
  }
];

// Helper: Calculate totals
function calculateTotals(columns, rows) {
  const totals = {};
  if (!rows || rows.length === 0) return totals;

  columns.forEach(col => {
    if (col.type === 'number' && col.calculationType !== 'srNo') {
      const sum = rows.reduce((acc, row) => {
        const val = parseFloat(row[col.key]) || 0;
        return acc + val;
      }, 0);
      totals[col.key] = Math.round(sum);
    }
  });

  return totals;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/salary-slip/default-config
// Return default 18-column config and sample data
// ─────────────────────────────────────────────────────────────────────────────
router.get('/default-config', authenticateTeacherOrAdmin, (req, res) => {
  res.json({
    columns: DEFAULT_COLUMNS,
    sampleRows: SAMPLE_ROWS,
    rates: {
      daRate: 63,
      hraRate: 5,
      medicalDefault: 1000,
      npsRate: 10,
      gliDefault: 30,
      itrDefault: 0
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/salary-slip
// Get statements for logged-in teacher's school or by UDISE filter
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'teacher') {
      query.udiseCode = req.user.udiseCode;
    } else if (req.query.udiseCode) {
      query.udiseCode = req.query.udiseCode;
    }

    if (req.query.month) query.month = req.query.month;
    if (req.query.year) query.year = parseInt(req.query.year, 10);

    const statements = await SalarySlip.find(query)
      .sort({ year: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: statements.length,
      statements
    });
  } catch (error) {
    console.error('Error fetching salary slips:', error);
    res.status(500).json({ success: false, message: 'Server error fetching statements.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/salary-slip/teachers-for-school
// Load teachers from TeacherDirectory for this school to populate rows easily
// ─────────────────────────────────────────────────────────────────────────────
router.get('/teachers-for-school', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const udise = req.query.udiseCode || (req.user.role === 'teacher' ? req.user.udiseCode : null);
    if (!udise) {
      return res.status(400).json({ message: 'UDISE code required.' });
    }

    const teachers = await TeacherDirectory.find({
      udise: { $regex: new RegExp(`^${udise.trim()}$`, 'i') },
      isActive: true
    }).sort({ srNo: 1 }).lean();

    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Error fetching teachers for school:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/salary-slip/:id
// Get a specific statement
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const statement = await SalarySlip.findById(req.params.id);
    if (!statement) {
      return res.status(404).json({ success: false, message: 'Statement not found.' });
    }

    // Teachers can only view their own school's statements
    if (req.user.role === 'teacher' && statement.udiseCode !== req.user.udiseCode) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to school data.' });
    }

    res.json({ success: true, statement });
  } catch (error) {
    console.error('Error fetching statement:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/salary-slip
// Create a new statement
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    let { udiseCode, schoolName, month, year, title, columns, rows, notes, status, headmasterName, headmasterDesignation, headmasterSignatureUrl, schoolSealUrl } = req.body;

    let teacherDoc = null;
    if (req.user.role === 'teacher' || req.user.id) {
      teacherDoc = await Teacher.findById(req.user.id);
      if (teacherDoc && !schoolName) {
        schoolName = teacherDoc.schoolName;
      }
    }

    if (req.user.role === 'teacher') {
      udiseCode = req.user.udiseCode;
    }

    if (!headmasterSignatureUrl && teacherDoc) headmasterSignatureUrl = teacherDoc.headmasterSignatureUrl;
    if (!schoolSealUrl && teacherDoc) schoolSealUrl = teacherDoc.schoolSealUrl;
    if (!headmasterName && teacherDoc) headmasterName = teacherDoc.headmasterName || teacherDoc.fullName;
    if (!headmasterDesignation && teacherDoc) headmasterDesignation = teacherDoc.headmasterDesignation || 'Head Master (प्रधानाध्यापक)';

    if (!udiseCode || !month || !year) {
      return res.status(400).json({ message: 'UDISE code, month, and year are required.' });
    }

    const cols = (columns && columns.length > 0) ? columns : DEFAULT_COLUMNS;
    const rws = rows || [];
    const totals = calculateTotals(cols, rws);

    const statement = new SalarySlip({
      udiseCode,
      schoolName: schoolName || 'Government School',
      month,
      year: parseInt(year, 10),
      title: title || 'अनुपस्थित एवं वेतन विवरणी',
      status: status || 'Draft',
      columns: cols,
      rows: rws,
      totals,
      notes: notes || '',
      headmasterName: headmasterName || '',
      headmasterDesignation: headmasterDesignation || 'Head Master (प्रधानाध्यापक)',
      headmasterSignatureUrl: headmasterSignatureUrl || '',
      schoolSealUrl: schoolSealUrl || '',
      createdBy: req.user.id,
      creatorName: req.user.fullName || req.user.name || req.user.username || 'Teacher'
    });

    await statement.save();

    res.status(201).json({
      success: true,
      message: 'Absentee and Salary Statement created successfully!',
      statement
    });
  } catch (error) {
    console.error('Error creating salary slip:', error);
    res.status(500).json({ success: false, message: 'Failed to create statement.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/salary-slip/:id
// Update an existing statement (columns, rows, month, year, status)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const statement = await SalarySlip.findById(req.params.id);
    if (!statement) {
      return res.status(404).json({ success: false, message: 'Statement not found.' });
    }

    if (req.user.role === 'teacher' && statement.udiseCode !== req.user.udiseCode) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const { schoolName, month, year, title, columns, rows, notes, status, headmasterName, headmasterDesignation, headmasterSignatureUrl, schoolSealUrl } = req.body;

    if (schoolName) statement.schoolName = schoolName;
    if (month) statement.month = month;
    if (year) statement.year = parseInt(year, 10);
    if (title) statement.title = title;
    if (notes !== undefined) statement.notes = notes;
    if (status) statement.status = status;
    if (headmasterName !== undefined) statement.headmasterName = headmasterName;
    if (headmasterDesignation !== undefined) statement.headmasterDesignation = headmasterDesignation;
    if (headmasterSignatureUrl !== undefined) statement.headmasterSignatureUrl = headmasterSignatureUrl;
    if (schoolSealUrl !== undefined) statement.schoolSealUrl = schoolSealUrl;

    if (columns) statement.columns = columns;
    if (rows) statement.rows = rows;

    // Recalculate totals
    statement.totals = calculateTotals(statement.columns, statement.rows);

    await statement.save();

    res.json({
      success: true,
      message: 'Statement updated successfully!',
      statement
    });
  } catch (error) {
    console.error('Error updating statement:', error);
    res.status(500).json({ success: false, message: 'Failed to update statement.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/salary-slip/:id
// Delete a statement
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const statement = await SalarySlip.findById(req.params.id);
    if (!statement) {
      return res.status(404).json({ success: false, message: 'Statement not found.' });
    }

    if (req.user.role === 'teacher' && statement.udiseCode !== req.user.udiseCode) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await SalarySlip.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Statement deleted successfully.' });
  } catch (error) {
    console.error('Error deleting statement:', error);
    res.status(500).json({ success: false, message: 'Failed to delete statement.' });
  }
});

module.exports = router;
