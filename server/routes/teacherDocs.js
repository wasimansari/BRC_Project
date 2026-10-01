const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { TeacherDocument, Teacher } = require('../models');
const jwt = require('jsonwebtoken');

// ── Teacher JWT Auth Middleware (inline) ──────────────────
function authenticateTeacher(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
    if (decoded.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher role required.' });
    }
    req.teacher = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ── Multer — memory storage for Cloudinary upload ─────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, images (JPG/PNG), and Word documents are allowed.'));
    }
  }
});

// ── Cloudinary upload helper ──────────────────────────────
function uploadToCloudinary(buffer, folder, filename, isPdf) {
  return new Promise((resolve, reject) => {
    const resourceType = isPdf ? 'raw' : 'auto';
    const stream = cloudinary.uploader.upload_stream(
      { folder: `brc/teacher-docs/${folder}`, public_id: filename, resource_type: resourceType },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        
        let finalUrl = result.secure_url;
        if (isPdf) {
          finalUrl = finalUrl.replace('/image/upload/', '/raw/upload/');
          if (!finalUrl.endsWith('.pdf')) {
            finalUrl += '.pdf';
          }
        }
        resolve({ ...result, secure_url: finalUrl });
      }
    );
    stream.end(buffer);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher-docs/upload
// Upload a document from teacher dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.post('/upload', authenticateTeacher, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const { title, docType, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Document title is required.' });

    const { udiseCode, id } = req.teacher;

    // Get teacher name
    const teacher = await Teacher.findById(id);

    // Upload to Cloudinary
    const filename = `${udiseCode}_${Date.now()}`;
    let fileUrl = '';
    let filePublicId = '';

    try {
      const isPdf = req.file.mimetype === 'application/pdf';
      const result = await uploadToCloudinary(req.file.buffer, udiseCode, filename, isPdf);
      fileUrl = result.secure_url;
      filePublicId = result.public_id;
    } catch (cloudErr) {
      console.error('Cloudinary upload error:', cloudErr.message);
      return res.status(500).json({ message: 'File upload failed. Please try again.' });
    }

    const doc = await TeacherDocument.create({
      udiseCode,
      teacherName: teacher ? teacher.fullName : '',
      title,
      docType:     docType || 'Other',
      description: description || '',
      fileUrl,
      filePublicId,
      fileName:    req.file.originalname,
      fileSize:    req.file.size,
      mimeType:    req.file.mimetype
    });

    res.status(201).json({
      message: 'Document uploaded successfully!',
      document: doc
    });

  } catch (error) {
    console.error('Teacher doc upload error:', error);
    if (error.message && error.message.includes('Only PDF')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    res.status(500).json({ message: 'Server error during upload.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/teacher-docs/my-docs
// Get all documents uploaded by the logged-in teacher
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-docs', authenticateTeacher, async (req, res) => {
  try {
    const docs = await TeacherDocument.find({ udiseCode: req.teacher.udiseCode })
      .sort({ uploadedAt: -1 });
    res.json({ documents: docs, total: docs.length });
  } catch (error) {
    console.error('Get docs error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/teacher-docs/:id
// Delete a document (teacher can only delete their own)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authenticateTeacher, async (req, res) => {
  try {
    const doc = await TeacherDocument.findOne({
      _id: req.params.id,
      udiseCode: req.teacher.udiseCode
    });

    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    // Delete from Cloudinary
    if (doc.filePublicId) {
      try {
        await cloudinary.uploader.destroy(doc.filePublicId, { resource_type: 'auto' });
      } catch (err) {
        console.error('Cloudinary delete error:', err.message);
      }
    }

    await TeacherDocument.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully.' });

  } catch (error) {
    console.error('Delete doc error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/teacher-docs/:id/document
// View a document inline
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/document', async (req, res) => {
  try {
    const doc = await TeacherDocument.findById(req.params.id);
    if (!doc || !doc.fileUrl) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const isPdf = doc.fileUrl.endsWith('.pdf') || doc.mimeType === 'application/pdf';
    const fileName = doc.fileName || (isPdf ? 'document.pdf' : 'document.jpg');

    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Content-Type', isPdf ? 'application/pdf' : (doc.mimeType || 'image/jpeg'));

    let fetchUrl = doc.fileUrl;
    if (isPdf && fetchUrl.includes('/raw/upload/') && fetchUrl.endsWith('.pdf')) {
      fetchUrl = fetchUrl.slice(0, -4);
    }
    
    // For legacy uploads that were uploaded as raw but don't have .pdf extension in db
    if (isPdf && fetchUrl.includes('/image/upload/')) {
       fetchUrl = fetchUrl.replace('/image/upload/', '/raw/upload/');
    }

    const https = require('https');
    const request = https.get(fetchUrl, { timeout: 30000 }, (cloudinaryRes) => {
      if (cloudinaryRes.statusCode !== 200) {
        return res.status(cloudinaryRes.statusCode).json({ message: 'Failed to fetch file from storage' });
      }
      cloudinaryRes.pipe(res);
    });

    request.on('timeout', () => {
      request.destroy();
      res.status(504).json({ message: 'Request timed out' });
    });

    request.on('error', (error) => {
      console.error('Error fetching document:', error);
      res.status(500).json({ message: 'Error viewing document' });
    });

  } catch (error) {
    console.error('Document view error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
