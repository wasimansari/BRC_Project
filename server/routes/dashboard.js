const express = require('express');
const router = express.Router();
const { School, Teacher, TeacherDirectory, Training, News, TeacherDocument } = require('../models');

/**
 * Intelligent helper to classify school into grade bands:
 * 1-5 (Primary), 1-8 (Middle), 9-12 (Higher Secondary), 6-12 (Composite/Upgraded High)
 */
function classifySchool(name, category) {
  if (category && ['1-5', '1-8', '9-12', '6-12'].includes(category)) {
    return category;
  }
  const n = (name || '').toUpperCase().trim();
  const first = n.split(' ')[0];

  // 1. Higher Secondary / Secondary (9-12)
  if (
    n.includes('UCHCH') ||
    n.includes('UCHCHA') ||
    n.includes('HIGH SCHOOL') ||
    (n.includes('VIDYALAYA') && !n.includes('MADHYA') && !n.includes('PRATHMIK')) ||
    n.includes('9-12') ||
    n.includes('10-12')
  ) {
    return '9-12';
  }

  // 2. Upgraded High School / Composite (6-12)
  if (
    ['UHS'].includes(first) ||
    n.includes('6-12') ||
    n.includes('UTKRAMIT HIGH') ||
    n.includes('COMPOSITE')
  ) {
    return '6-12';
  }

  // 3. Middle / Upper Primary (1-8)
  if (
    ['UMS', 'GMS', 'MS'].includes(first) ||
    n.includes('MADHYA') ||
    n.includes('MIDDLE') ||
    n.includes('1-8')
  ) {
    return '1-8';
  }

  // 4. Primary (1-5)
  if (
    ['GPS', 'NPS', 'PS'].includes(first) ||
    n.includes('PRIMARY') ||
    n.includes('PRATHMIK') ||
    n.includes('1-5')
  ) {
    return '1-5';
  }

  return '1-5';
}

// @route   GET /api/dashboard/overview
// @desc    Get aggregate KPI statistics, running trainings, and latest news
// @access  Public / Admin
router.get('/overview', async (req, res) => {
  try {
    // 1. Schools & Grade Classification Breakdown
    const schools = await School.find({ isActive: true }).select('schoolName schoolCategory udiseCode district block').lean();
    const totalSchools = schools.length;
    let schools1to5 = 0;
    let schools1to8 = 0;
    let schools9to12 = 0;
    let schools6to12 = 0;

    schools.forEach((s) => {
      const cat = classifySchool(s.schoolName, s.schoolCategory);
      if (cat === '1-5') schools1to5++;
      else if (cat === '1-8') schools1to8++;
      else if (cat === '9-12') schools9to12++;
      else if (cat === '6-12') schools6to12++;
      else schools1to5++;
    });

    // 2. Teachers Count
    const dirCount = await TeacherDirectory.countDocuments({ isActive: { $ne: false } });
    const userCount = await Teacher.countDocuments({ isVerified: true });
    const totalTeachers = Math.max(dirCount, userCount, 1);

    // 3. Teacher Documents Requests (Pending Only)
    const pendingTeacherRequests = await TeacherDocument.countDocuments({ status: 'Pending' });
    const pendingRequestsList = await TeacherDocument.find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // 4. Trainings List (Annotated with Running / Upcoming / Completed status)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allTrainings = await Training.find({ isActive: { $ne: false } })
      .sort({ fromDate: -1, createdAt: -1 })
      .lean();

    const annotatedTrainings = allTrainings.map((t) => {
      let runStatus = 'Running';
      if (t.fromDate && new Date(t.fromDate) > today) {
        runStatus = 'Upcoming';
      } else if (t.toDate && new Date(t.toDate) < today) {
        runStatus = 'Completed';
      }
      return {
        ...t,
        runStatus
      };
    });

    // Extract running trainings, falling back to all active trainings if none strictly active right now
    const strictlyRunning = annotatedTrainings.filter(t => t.runStatus === 'Running');
    const runningTrainings = strictlyRunning.length > 0 
      ? strictlyRunning 
      : annotatedTrainings.slice(0, 6);

    // 5. Latest News
    const latestNews = await News.find({ isActive: { $ne: false } })
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({
      success: true,
      stats: {
        totalSchools,
        totalTeachers,
        schools1to5,
        schools1to8,
        schools9to12,
        schools6to12,
        pendingTeacherRequests,
        allTrainingsCount: allTrainings.length,
        totalNewsCount: await News.countDocuments()
      },
      runningTrainings,
      allTrainings: annotatedTrainings.slice(0, 8),
      latestNews,
      pendingRequestsList
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error loading dashboard metrics',
      error: error.message
    });
  }
});

module.exports = router;
