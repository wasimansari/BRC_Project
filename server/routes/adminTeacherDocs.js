const express = require('express');
const router = express.Router();
const { TeacherDocument, Teacher } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { sendDocumentStatusEmail } = require('../utils/mailer');

// @route   GET /api/admin-teacher-docs
// @desc    Get all teacher documents (admin)
// @access  Private (Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, udiseCode, docType } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (udiseCode) filter.udiseCode = { $regex: udiseCode, $options: 'i' };
    if (docType) filter.docType = docType;
    
    const docs = await TeacherDocument.find(filter).sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (error) {
    console.error('Error fetching admin teacher docs:', error);
    res.status(500).json({ message: 'Server error fetching documents', error: error.message });
  }
});

// @route   PUT /api/admin-teacher-docs/:id/status
// @desc    Update teacher document status and send email
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const doc = await TeacherDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.status = status;
    if (adminRemarks !== undefined) {
      doc.adminRemarks = adminRemarks;
    }
    await doc.save();

    // Fetch the teacher details to send email
    const teacher = await Teacher.findOne({ udiseCode: doc.udiseCode });
    if (teacher && teacher.email) {
      // Send notification email
      try {
        await sendDocumentStatusEmail(
          teacher.email, 
          teacher.fullName || teacher.udiseCode, 
          doc.title, 
          status, 
          adminRemarks
        );
      } catch (mailError) {
        console.error('Error sending document status email:', mailError);
        // We do not fail the request if the email fails, just log it.
      }
    }

    res.json({ message: 'Document status updated successfully', document: doc });
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ message: 'Server error updating document status', error: error.message });
  }
});

// @route   GET /api/admin-teacher-docs/stats
// @desc    Get stats for teacher documents
// @access  Private (Admin)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const total = await TeacherDocument.countDocuments();
    const pending = await TeacherDocument.countDocuments({ status: 'Pending' });
    const approved = await TeacherDocument.countDocuments({ status: 'Approved' });
    const rejected = await TeacherDocument.countDocuments({ status: 'Rejected' });
    
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats', error: error.message });
  }
});

module.exports = router;
