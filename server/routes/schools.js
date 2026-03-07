const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const pdfkit = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { School } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Multer storage for Excel files
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   GET /api/schools
// @desc    Get all schools
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { district, block, search, isActive } = req.query;
    let filter = {};
    
    if (district) filter.district = district;
    if (block) filter.block = block;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { schoolName: { $regex: search, $options: 'i' } },
        { udiseCode: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { block: { $regex: search, $options: 'i' } }
      ];
    }
    
    const schools = await School.find(filter).sort({ srNo: 1 });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/schools/export-pdf
// @desc    Export schools to PDF
// @access  Public
router.get('/export-pdf', async (req, res) => {
  try {
    const schools = await School.find({ isActive: true }).sort({ srNo: 1 });
    
    const doc = new pdfkit({ margin: 20 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=school-details.pdf');
    
    doc.pipe(res);
    
    // Title
    doc.fontSize(18).text('School Details Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    
    // Table header
    const tableTop = 120;
    const columns = [
      { header: 'Sr No', x: 20, width: 40 },
      { header: 'District', x: 60, width: 70 },
      { header: 'Block', x: 130, width: 70 },
      { header: 'UDISE Code', x: 200, width: 80 },
      { header: 'School Name', x: 280, width: 150 },
      { header: 'HM/HT Name', x: 430, width: 100 },
      { header: 'Mobile', x: 530, width: 80 }
    ];
    
    // Draw header background
    doc.rect(10, tableTop - 5, 610, 20).fill('#3498db');
    doc.fillColor('white');
    doc.fontSize(8);
    columns.forEach(col => {
      doc.text(col.header, col.x, tableTop, { width: col.width });
    });
    doc.fillColor('black');
    
    // Draw table rows
    let y = tableTop + 20;
    let currentPage = 1;
    
    schools.forEach((school, index) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
        currentPage++;
        
        // Redraw header on new page
        doc.rect(10, y - 5, 610, 20).fill('#3498db');
        doc.fillColor('white');
        doc.fontSize(8);
        columns.forEach(col => {
          doc.text(col.header, col.x, y, { width: col.width });
        });
        doc.fillColor('black');
        y += 20;
      }
      
      const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
      doc.rect(10, y - 3, 610, 15).fill(bgColor);
      
      doc.fontSize(7);
      doc.text(String(school.srNo), 20, y, { width: 40 });
      doc.text(school.district || '', 60, y, { width: 70 });
      doc.text(school.block || '', 130, y, { width: 70 });
      doc.text(school.udiseCode || '', 200, y, { width: 80 });
      doc.text(school.schoolName ? school.schoolName.substring(0, 25) : '', 280, y, { width: 150 });
      doc.text(school.hmHtName || '', 430, y, { width: 100 });
      doc.text(school.mobileNo || '', 530, y, { width: 80 });
      
      y += 15;
    });
    
    // Footer
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

// @route   GET /api/schools/stats
// @desc    Get school statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalSchools = await School.countDocuments({ isActive: true });
    const districts = await School.distinct('district', { isActive: true });
    const blocks = await School.distinct('block', { isActive: true });
    const schoolsWithCrc = await School.countDocuments({ crc: 'Yes', isActive: true });
    
    res.json({
      totalSchools,
      totalDistricts: districts.length,
      totalBlocks: blocks.length,
      schoolsWithCrc
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/schools/upload-excel
// @desc    Upload Excel file with school data
// @access  Private
router.post('/upload-excel', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Get current max srNo
    const lastSchool = await School.findOne().sort({ srNo: -1 });
    let currentSrNo = lastSchool ? lastSchool.srNo : 0;

    const schoolsToInsert = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Map Excel columns to schema fields (case-insensitive)
      const schoolData = {
        srNo: ++currentSrNo,
        district: row.District || row.district || '',
        block: row.Block || row.block || '',
        udiseCode: String(row['Udise Code'] || row.udiseCode || row['UDISE Code'] || ''),
        schoolName: row['School Name'] || row.schoolName || '',
        hmHtName: row['HM/HT Name'] || row.hmHtName || row['HM Name'] || row['HT Name'] || '',
        mobileNo: String(row['Mobile No'] || row.mobileNo || row.Mobile || ''),
        crc: row.CRC || row.crc || '',
        crcName: row['CRC Name'] || row.crcName || '',
        isActive: true
      };

      // Validation
      if (!schoolData.district || !schoolData.block || !schoolData.udiseCode || !schoolData.schoolName) {
        errors.push(`Row ${i + 2}: Missing required fields (District, Block, Udise Code, School Name)`);
        continue;
      }

      // Check if school with this UDISE code already exists
      const existingSchool = await School.findOne({ udiseCode: schoolData.udiseCode });
      if (existingSchool) {
        // Update existing school
        Object.assign(existingSchool, schoolData);
        await existingSchool.save();
      } else {
        schoolsToInsert.push(schoolData);
      }
    }

    // Insert new schools in bulk
    let insertedCount = 0;
    if (schoolsToInsert.length > 0) {
      await School.insertMany(schoolsToInsert, { ordered: false });
      insertedCount = schoolsToInsert.length;
    }

    res.status(201).json({
      message: 'Excel file processed successfully',
      totalRows: data.length,
      inserted: insertedCount,
      updated: data.length - insertedCount - errors.length,
      errors: errors
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ message: 'Error processing Excel file', error: error.message });
  }
});

// @route   POST /api/schools
// @desc    Add single school
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { district, block, udiseCode, schoolName, hmHtName, mobileNo, crc, crcName, isActive } = req.body;

    // Check if school with this UDISE code already exists
    const existingSchool = await School.findOne({ udiseCode });
    if (existingSchool) {
      return res.status(400).json({ message: 'School with this UDISE code already exists' });
    }

    // Get max srNo
    const lastSchool = await School.findOne().sort({ srNo: -1 });
    const srNo = lastSchool ? lastSchool.srNo + 1 : 1;

    const newSchool = new School({
      srNo,
      district,
      block,
      udiseCode,
      schoolName,
      hmHtName: hmHtName || '',
      mobileNo: mobileNo || '',
      crc: crc || '',
      crcName: crcName || '',
      isActive: isActive !== undefined ? isActive : true
    });

    const savedSchool = await newSchool.save();
    res.status(201).json(savedSchool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/schools/:id
// @desc    Update school
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { district, block, udiseCode, schoolName, hmHtName, mobileNo, crc, crcName, isActive } = req.body;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if updating to an existing UDISE code
    if (udiseCode !== school.udiseCode) {
      const existingSchool = await School.findOne({ udiseCode });
      if (existingSchool) {
        return res.status(400).json({ message: 'School with this UDISE code already exists' });
      }
    }

    if (district) school.district = district;
    if (block) school.block = block;
    if (udiseCode) school.udiseCode = udiseCode;
    if (schoolName) school.schoolName = schoolName;
    if (hmHtName !== undefined) school.hmHtName = hmHtName;
    if (mobileNo !== undefined) school.mobileNo = mobileNo;
    if (crc !== undefined) school.crc = crc;
    if (crcName !== undefined) school.crcName = crcName;
    if (isActive !== undefined) school.isActive = isActive;

    const updatedSchool = await school.save();
    res.json(updatedSchool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/schools/:id
// @desc    Delete school
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findByIdAndDelete(id);
    
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/schools
// @desc    Delete all schools
// @access  Private
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await School.deleteMany({});
    res.json({ message: 'All schools deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/schools/districts
// @desc    Get all unique districts
// @access  Public
router.get('/districts', async (req, res) => {
  try {
    const districts = await School.distinct('district', { isActive: true });
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/schools/blocks
// @desc    Get all unique blocks
// @access  Public
router.get('/blocks', async (req, res) => {
  try {
    const blocks = await School.distinct('block', { isActive: true });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;