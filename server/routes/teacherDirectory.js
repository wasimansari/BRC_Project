const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const pdfkit = require('pdfkit');
const { TeacherDirectory } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Multer storage for Excel files
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   GET /api/teacher-directory
// @desc    Get all teachers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { postingDistrict, postingBlock, search, isActive } = req.query;
    let filter = {};
    
    if (postingDistrict) filter.postingDistrict = postingDistrict;
    if (postingBlock) filter.postingBlock = postingBlock;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { teacherName: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } },
        { schoolName: { $regex: search, $options: 'i' } },
        { postingDistrict: { $regex: search, $options: 'i' } },
        { postingBlock: { $regex: search, $options: 'i' } }
      ];
    }
    
    const teachers = await TeacherDirectory.find(filter).sort({ srNo: 1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher-directory/export-excel
// @desc    Export teachers to Excel
// @access  Public
router.get('/export-excel', async (req, res) => {
  try {
    const teachers = await TeacherDirectory.find({ isActive: true }).sort({ srNo: 1 });
    
    // Prepare data for Excel
    const excelData = teachers.map(teacher => ({
      'Sr No': teacher.srNo,
      'Teacher Id': teacher.teacherId || '',
      'Teacher Name': teacher.teacherName || '',
      'Class': teacher.class || '',
      'Subject': teacher.subject || '',
      'Highest Qualification': teacher.highestQualification || '',
      'School Name': teacher.schoolName || '',
      'Udise': teacher.udise || '',
      'Contact No': teacher.contactNo || '',
      'Posting Bl': teacher.postingBlock || '',
      'Posting District': teacher.postingDistrict || '',
      'Home District': teacher.homeDistrict || '',
      'iS CRC School': teacher.isCrcSchool || '',
      'CRC School': teacher.crcSchool || '',
      'Status': teacher.isActive ? 'Active' : 'Inactive'
    }));
    
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    
    worksheet['!cols'] = [
      { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 15 },
      { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 10 }
    ];
    
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Teachers');
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=teacher-directory.xlsx');
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher-directory/export-pdf
// @desc    Export teachers to PDF
// @access  Public
router.get('/export-pdf', async (req, res) => {
  // Simple PDF implementation, similar to schools but adapted
  try {
    const teachers = await TeacherDirectory.find({ isActive: true }).sort({ srNo: 1 });
    const doc = new pdfkit({ margin: 20 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=teacher-directory.pdf');
    doc.pipe(res);
    
    doc.fontSize(18).text('Teacher Directory Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    
    const tableTop = 120;
    const columns = [
      { header: 'Sr No', x: 20, width: 40 },
      { header: 'Teacher Id', x: 60, width: 80 },
      { header: 'Name', x: 140, width: 100 },
      { header: 'School Name', x: 240, width: 140 },
      { header: 'Subject', x: 380, width: 80 },
      { header: 'Contact', x: 460, width: 80 },
      { header: 'Posting Dist', x: 540, width: 70 }
    ];
    
    doc.rect(10, tableTop - 5, 600, 20).fill('#3498db');
    doc.fillColor('white');
    doc.fontSize(8);
    columns.forEach(col => doc.text(col.header, col.x, tableTop, { width: col.width }));
    doc.fillColor('black');
    
    let y = tableTop + 20;
    let currentPage = 1;
    
    teachers.forEach((teacher, index) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
        currentPage++;
        doc.rect(10, y - 5, 600, 20).fill('#3498db');
        doc.fillColor('white');
        doc.fontSize(8);
        columns.forEach(col => doc.text(col.header, col.x, y, { width: col.width }));
        doc.fillColor('black');
        y += 20;
      }
      
      const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
      doc.rect(10, y - 3, 600, 15).fill(bgColor);
      
      doc.fontSize(7);
      doc.text(String(teacher.srNo), 20, y, { width: 40 });
      doc.text(teacher.teacherId || '', 60, y, { width: 80 });
      doc.text(teacher.teacherName ? teacher.teacherName.substring(0, 20) : '', 140, y, { width: 100 });
      doc.text(teacher.schoolName ? teacher.schoolName.substring(0, 25) : '', 240, y, { width: 140 });
      doc.text(teacher.subject || '', 380, y, { width: 80 });
      doc.text(teacher.contactNo || '', 460, y, { width: 80 });
      doc.text(teacher.postingDistrict || '', 540, y, { width: 70 });
      
      y += 15;
    });
    
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.text(`Page ${i + 1} of ${pageCount}`, 20, doc.page.height - 20, { align: 'center' });
    }
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teacher-directory/stats
// @desc    Get teacher statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalTeachers = await TeacherDirectory.countDocuments({ isActive: true });
    const districts = await TeacherDirectory.distinct('postingDistrict', { isActive: true });
    const blocks = await TeacherDirectory.distinct('postingBlock', { isActive: true });
    const subjects = await TeacherDirectory.distinct('subject', { isActive: true });
    
    res.json({
      totalTeachers,
      totalDistricts: districts.length,
      totalBlocks: blocks.length,
      totalSubjects: subjects.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/teacher-directory/upload-excel
// @desc    Upload Excel file with teacher data
// @access  Private
router.post('/upload-excel', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const lastTeacher = await TeacherDirectory.findOne().sort({ srNo: -1 });
    let currentSrNo = lastTeacher ? lastTeacher.srNo : 0;

    const teachersToInsert = [];
    const errors = [];

    // Get all existing teacher ids to avoid multiple DB calls
    const existingTeacherRecords = await TeacherDirectory.find({}, { teacherId: 1 }).lean();
    const existingIds = new Set(existingTeacherRecords.map(t => t.teacherId));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Normalize row keys to handle whitespace and casing issues
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
        normalizedRow[normalizedKey] = row[key];
      });
      
      const teacherData = {
        srNo: ++currentSrNo,
        teacherId: String(normalizedRow['teacherid'] || ''),
        teacherName: normalizedRow['teachername'] || '',
        class: normalizedRow['class'] || '',
        subject: normalizedRow['subject'] || '',
        highestQualification: normalizedRow['highestqualification'] || '',
        schoolName: normalizedRow['schoolname'] || '',
        udise: String(normalizedRow['udise'] || ''),
        contactNo: String(normalizedRow['contactno'] || normalizedRow['mobile'] || normalizedRow['mobileno'] || ''),
        postingBlock: normalizedRow['postingblock'] || normalizedRow['postingbl'] || '',
        postingDistrict: normalizedRow['postingdistrict'] || '',
        homeDistrict: normalizedRow['homedistrict'] || '',
        isCrcSchool: normalizedRow['iscrcschool'] || '',
        crcSchool: normalizedRow['crcschool'] || '',
        isActive: true
      };

      if (!teacherData.teacherId || !teacherData.teacherName || !teacherData.schoolName || !teacherData.udise) {
        errors.push(`Row ${i + 2}: Missing required fields (Teacher Id, Teacher Name, School Name, Udise)`);
        continue;
      }

      if (existingIds.has(teacherData.teacherId)) {
        errors.push(`Row ${i + 2}: Teacher Id ${teacherData.teacherId} already uploaded.`);
      } else {
        teachersToInsert.push(teacherData);
        existingIds.add(teacherData.teacherId); // Prevent duplicates within the same file
      }
    }

    let insertedCount = 0;
    if (teachersToInsert.length > 0) {
      await TeacherDirectory.insertMany(teachersToInsert, { ordered: false });
      insertedCount = teachersToInsert.length;
    }

    res.status(201).json({
      message: 'Excel file processed successfully',
      totalRows: data.length,
      inserted: insertedCount,
      updated: 0,
      errors: errors
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ message: 'Error processing Excel file', error: error.message });
  }
});

// @route   POST /api/teacher-directory
// @desc    Add single teacher
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacherData = req.body;

    const existingTeacher = await TeacherDirectory.findOne({ teacherId: teacherData.teacherId });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher with this ID already exists' });
    }

    const lastTeacher = await TeacherDirectory.findOne().sort({ srNo: -1 });
    teacherData.srNo = lastTeacher ? lastTeacher.srNo + 1 : 1;

    const newTeacher = new TeacherDirectory(teacherData);
    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/teacher-directory/:id
// @desc    Update teacher
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const teacher = await TeacherDirectory.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (updateData.teacherId && updateData.teacherId !== teacher.teacherId) {
      const existingTeacher = await TeacherDirectory.findOne({ teacherId: updateData.teacherId });
      if (existingTeacher) {
        return res.status(400).json({ message: 'Teacher with this ID already exists' });
      }
    }

    Object.assign(teacher, updateData);
    const updatedTeacher = await teacher.save();
    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/teacher-directory/:id
// @desc    Delete teacher
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await TeacherDirectory.findByIdAndDelete(id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/teacher-directory
// @desc    Delete all teachers
// @access  Private
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await TeacherDirectory.deleteMany({});
    res.json({ message: 'All teachers deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
