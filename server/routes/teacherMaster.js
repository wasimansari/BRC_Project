const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { SchoolTeacherMaster, Teacher, School } = require('../models');

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

// ── Default 9 Sample Teachers from Bihar Govt Format ─────────────────────
const SAMPLE_TEACHERS = [
  {
    teacherName: 'DAYA SHANKAR PRASAD',
    pranNo: '110212956449',
    teacherType: 'HEAD MASTER',
    teacherClass: '',
    dob: '25-01-1983',
    teacherId: '42623074',
    accountNo: '39649662313',
    basicPay: 36100,
    order: 1
  },
  {
    teacherName: 'MD WASIM AKRAM',
    pranNo: '110168607520',
    teacherType: 'TRE-1',
    teacherClass: '11-12th',
    dob: '15-01-1989',
    teacherId: '24264975',
    accountNo: '42464684671',
    basicPay: 34970,
    order: 2
  },
  {
    teacherName: 'PRADEEP KUMAR',
    pranNo: '110109717949',
    teacherType: 'TRE-2',
    teacherClass: '11-12th',
    dob: '15-02-1987',
    teacherId: '24106220',
    accountNo: '39474762948',
    basicPay: 33950,
    order: 3
  },
  {
    teacherName: 'ABHISHEK KUMAR',
    pranNo: '110203544471',
    teacherType: 'TRE-3',
    teacherClass: '11-12th',
    dob: '05-07-1991',
    teacherId: '81270164',
    accountNo: '32294018130',
    basicPay: 32960,
    order: 4
  },
  {
    teacherName: 'PRABHAKAR KUMAR BITU',
    pranNo: '110261112101',
    teacherType: 'TRE-3',
    teacherClass: '11-12th',
    dob: '28-10-1997',
    teacherId: '81269670',
    accountNo: '40584057566',
    basicPay: 32960,
    order: 5
  },
  {
    teacherName: 'MINTU KUMARI',
    pranNo: '110202865013',
    teacherType: 'TRE-3',
    teacherClass: '11-12th',
    dob: '05-04-1987',
    teacherId: '91421448',
    accountNo: '33735180539',
    basicPay: 32960,
    order: 6
  },
  {
    teacherName: 'PRIYANKA SHIVAM',
    pranNo: '110233245598',
    teacherType: 'TRE-3',
    teacherClass: '11-12th',
    dob: '16-01-1986',
    teacherId: '91318304',
    accountNo: '32047627893',
    basicPay: 32960,
    order: 7
  },
  {
    teacherName: 'DIPTI',
    pranNo: '110149913452',
    teacherType: 'TRE-1',
    teacherClass: '9-10th',
    dob: '08-01-1988',
    teacherId: '24206692',
    accountNo: '42512512303',
    basicPay: 33880,
    order: 8
  },
  {
    teacherName: 'SUNIL KUMAR',
    pranNo: '110109748196',
    teacherType: 'TRE-1',
    teacherClass: '11-12th',
    dob: '02-01-1988',
    teacherId: '24206680',
    accountNo: '39017684693',
    basicPay: 34970,
    order: 9
  }
];

// Helper: resolve school info
async function resolveSchool(req) {
  let udiseCode = req.body?.udiseCode || req.query?.udiseCode || req.user?.udiseCode || '';
  let schoolName = req.body?.schoolName || req.query?.schoolName || req.user?.schoolName || '';

  // 1. If teacher user logged in, check Teacher profile
  if ((!udiseCode || !schoolName) && req.user?.id) {
    try {
      const t = await Teacher.findById(req.user.id).select('udiseCode schoolName school fullName');
      if (t) {
        if (!udiseCode) udiseCode = t.udiseCode || (t.school ? t.school.udiseCode : '');
        if (!schoolName) schoolName = t.schoolName || (t.school ? t.school.name : '');
      }
    } catch (e) {
      // Ignore lookup error
    }
  }

  // 2. If schoolName is still missing but we have udiseCode, look up School collection
  if (udiseCode && !schoolName) {
    try {
      const s = await School.findOne({
        $or: [
          { udiseCode: String(udiseCode).trim() },
          { udise: String(udiseCode).trim() }
        ]
      }).select('name schoolName udiseCode');
      if (s) {
        schoolName = s.name || s.schoolName || '';
      }
    } catch (e) {
      // Ignore lookup error
    }
  }

  // 3. Fallbacks if still not resolved
  if (!udiseCode) {
    udiseCode = '10021507703';
  }
  if (!schoolName) {
    schoolName = 'UHS MAHAMMADPUR MAJHAULIA';
  }

  return { udiseCode: String(udiseCode).trim(), schoolName: String(schoolName).trim() };
}

// ── GET /api/teacher-master (Fetch all teachers for school) ────────────────
router.get('/', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const { udiseCode, schoolName } = await resolveSchool(req);
    
    let teachers = await SchoolTeacherMaster.find({ udiseCode, isActive: true }).sort({ order: 1, createdAt: 1 });

    // Auto-seed sample teachers if database has none for this school
    if (!teachers || teachers.length === 0) {
      const docsToInsert = SAMPLE_TEACHERS.map(item => ({
        udiseCode,
        schoolName,
        teacherName: item.teacherName,
        teacherType: item.teacherType,
        teacherClass: item.teacherClass,
        pranNo: item.pranNo,
        dob: item.dob,
        teacherId: item.teacherId,
        accountNo: item.accountNo,
        basicPay: item.basicPay,
        order: item.order,
        customFields: {}
      }));
      teachers = await SchoolTeacherMaster.insertMany(docsToInsert);
    }

    res.json({
      success: true,
      udiseCode,
      schoolName,
      count: teachers.length,
      data: teachers
    });
  } catch (err) {
    console.error('Error fetching teacher master list:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers', error: err.message });
  }
});

// ── POST /api/teacher-master (Add a new teacher to school master) ──────────
router.post('/', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const { udiseCode, schoolName } = await resolveSchool(req);
    const {
      teacherName,
      teacherType,
      teacherClass,
      pranNo,
      dob,
      teacherId,
      accountNo,
      basicPay,
      customFields
    } = req.body;

    if (!teacherName || !teacherName.trim()) {
      return res.status(400).json({ success: false, message: 'Teacher name is required.' });
    }

    const maxOrderDoc = await SchoolTeacherMaster.findOne({ udiseCode }).sort({ order: -1 });
    const nextOrder = maxOrderDoc ? (maxOrderDoc.order || 0) + 1 : 1;

    const newTeacher = new SchoolTeacherMaster({
      udiseCode,
      schoolName,
      teacherName: teacherName.trim(),
      teacherType: teacherType || 'TRE-1',
      teacherClass: teacherClass || '',
      pranNo: pranNo || '',
      dob: dob || '',
      teacherId: teacherId || '',
      accountNo: accountNo || '',
      basicPay: Number(basicPay) || 0,
      customFields: customFields || {},
      order: nextOrder
    });

    await newTeacher.save();

    res.status(201).json({
      success: true,
      message: 'Teacher added successfully to Master list.',
      data: newTeacher
    });
  } catch (err) {
    console.error('Error creating teacher in master:', err);
    res.status(500).json({ success: false, message: 'Failed to add teacher', error: err.message });
  }
});

// ── PUT /api/teacher-master/:id (Update teacher details) ───────────────────
router.put('/:id', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teacherName,
      teacherType,
      teacherClass,
      pranNo,
      dob,
      teacherId,
      accountNo,
      basicPay,
      customFields,
      order,
      isActive
    } = req.body;

    const teacher = await SchoolTeacherMaster.findById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    if (teacherName !== undefined) teacher.teacherName = teacherName.trim();
    if (teacherType !== undefined) teacher.teacherType = teacherType;
    if (teacherClass !== undefined) teacher.teacherClass = teacherClass;
    if (pranNo !== undefined) teacher.pranNo = pranNo;
    if (dob !== undefined) teacher.dob = dob;
    if (teacherId !== undefined) teacher.teacherId = teacherId;
    if (accountNo !== undefined) teacher.accountNo = accountNo;
    if (basicPay !== undefined) teacher.basicPay = Number(basicPay) || 0;
    if (customFields !== undefined) teacher.customFields = customFields;
    if (order !== undefined) teacher.order = order;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();

    res.json({
      success: true,
      message: 'Teacher details updated successfully.',
      data: teacher
    });
  } catch (err) {
    console.error('Error updating teacher in master:', err);
    res.status(500).json({ success: false, message: 'Failed to update teacher', error: err.message });
  }
});

// ── DELETE /api/teacher-master/:id (Soft-delete or remove teacher) ─────────
router.delete('/:id', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SchoolTeacherMaster.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    res.json({
      success: true,
      message: 'Teacher removed from Master list successfully.'
    });
  } catch (err) {
    console.error('Error deleting teacher from master:', err);
    res.status(500).json({ success: false, message: 'Failed to delete teacher', error: err.message });
  }
});

// ── POST /api/teacher-master/seed-pdf (Reset/re-seed sample teachers) ──────
router.post('/seed-pdf', authenticateTeacherOrAdmin, async (req, res) => {
  try {
    const { udiseCode, schoolName } = await resolveSchool(req);

    // Optional: clear existing teachers if requested
    if (req.query.replace === 'true') {
      await SchoolTeacherMaster.deleteMany({ udiseCode });
    }

    const docsToInsert = SAMPLE_TEACHERS.map(item => ({
      udiseCode,
      schoolName,
      teacherName: item.teacherName,
      teacherType: item.teacherType,
      teacherClass: item.teacherClass,
      pranNo: item.pranNo,
      dob: item.dob,
      teacherId: item.teacherId,
      accountNo: item.accountNo,
      basicPay: item.basicPay,
      order: item.order,
      customFields: {}
    }));

    const teachers = await SchoolTeacherMaster.insertMany(docsToInsert);

    res.json({
      success: true,
      message: 'Default sample teachers seeded successfully.',
      count: teachers.length,
      data: teachers
    });
  } catch (err) {
    console.error('Error seeding sample teachers:', err);
    res.status(500).json({ success: false, message: 'Failed to seed sample teachers', error: err.message });
  }
});

module.exports = router;
