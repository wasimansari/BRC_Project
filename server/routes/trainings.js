const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const https = require('https');
const { Training } = require('../models');

// Multer storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadToCloudinary = (fileBuffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'brc-trainings', resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        
        let finalUrl = result.secure_url;
        if (resourceType === 'raw') {
          finalUrl = finalUrl.replace('/image/upload/', '/raw/upload/');
          if (!finalUrl.endsWith('.pdf')) {
            finalUrl += '.pdf';
          }
        }
        resolve({ ...result, secure_url: finalUrl });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

router.get('/', async (req, res) => {
  try {
    const trainings = await Training.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trainings', error: error.message });
  }
});

router.post('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'document', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description, link, category, fromDate, toDate, isActive, displayOrder } = req.body;
    let thumbnailUrl = '';
    let thumbnailPublicId = '';
    let documentUrl = '';
    let documentPublicId = '';
    let documentOriginalName = '';

    if (req.files && req.files['thumbnail']) {
      const file = req.files['thumbnail'][0];
      const uploadResult = await uploadToCloudinary(file.buffer, 'image');
      thumbnailUrl = uploadResult.secure_url;
      thumbnailPublicId = uploadResult.public_id;
    }

    if (req.files && req.files['document']) {
      const file = req.files['document'][0];
      const isPdf = file.mimetype === 'application/pdf';
      const resourceType = isPdf ? 'raw' : 'image';
      const uploadResult = await uploadToCloudinary(file.buffer, resourceType);
      documentUrl = uploadResult.secure_url;
      documentPublicId = uploadResult.public_id;
      documentOriginalName = file.originalname;
    }

    const training = new Training({
      title, description, link, category, fromDate, toDate,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
      displayOrder: parseInt(displayOrder) || 0,
      thumbnailUrl, thumbnailPublicId, documentUrl, documentPublicId, documentOriginalName
    });

    const savedTraining = await training.save();
    res.json(savedTraining);
  } catch (error) {
    res.status(500).json({ message: 'Error creating training', error: error.message });
  }
});

router.put('/:id', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'document', maxCount: 1 }]), async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const { title, description, link, category, fromDate, toDate, isActive, displayOrder } = req.body;

    if (req.files && req.files['thumbnail']) {
      if (training.thumbnailPublicId) {
        await cloudinary.uploader.destroy(training.thumbnailPublicId, { resource_type: 'image' }).catch(console.error);
      }
      const file = req.files['thumbnail'][0];
      const uploadResult = await uploadToCloudinary(file.buffer, 'image');
      training.thumbnailUrl = uploadResult.secure_url;
      training.thumbnailPublicId = uploadResult.public_id;
    }

    if (req.files && req.files['document']) {
      if (training.documentPublicId) {
        const isOldPdf = training.documentOriginalName && training.documentOriginalName.toLowerCase().endsWith('.pdf');
        await cloudinary.uploader.destroy(training.documentPublicId, { resource_type: isOldPdf ? 'raw' : 'image' }).catch(console.error);
      }
      const file = req.files['document'][0];
      const isPdf = file.mimetype === 'application/pdf';
      const uploadResult = await uploadToCloudinary(file.buffer, isPdf ? 'raw' : 'image');
      training.documentUrl = uploadResult.secure_url;
      training.documentPublicId = uploadResult.public_id;
      training.documentOriginalName = file.originalname;
    }

    if (title) training.title = title;
    if (description) training.description = description;
    if (link !== undefined) training.link = link;
    if (category !== undefined) training.category = category;
    if (fromDate !== undefined) training.fromDate = fromDate;
    if (toDate !== undefined) training.toDate = toDate;
    if (isActive !== undefined) training.isActive = (isActive === 'true' || isActive === true);
    if (displayOrder !== undefined) training.displayOrder = parseInt(displayOrder) || 0;

    const updatedTraining = await training.save();
    res.json(updatedTraining);
  } catch (error) {
    res.status(500).json({ message: 'Error updating training', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    if (training.thumbnailPublicId) {
      await cloudinary.uploader.destroy(training.thumbnailPublicId, { resource_type: 'image' }).catch(console.error);
    }
    if (training.documentPublicId) {
      const isOldPdf = training.documentOriginalName && training.documentOriginalName.toLowerCase().endsWith('.pdf');
      await cloudinary.uploader.destroy(training.documentPublicId, { resource_type: isOldPdf ? 'raw' : 'image' }).catch(console.error);
    }

    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: 'Training deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting training', error: error.message });
  }
});

router.get('/:id/document', async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training || !training.documentUrl) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const isPdf = training.documentUrl.endsWith('.pdf');
    const fileName = training.documentOriginalName || (isPdf ? 'document.pdf' : 'document.jpg');

    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Content-Type', isPdf ? 'application/pdf' : 'image/jpeg');

    let fetchUrl = training.documentUrl;
    if (isPdf && fetchUrl.includes('/raw/upload/') && fetchUrl.endsWith('.pdf')) {
      // Cloudinary stores raw files without the .pdf extension internally, 
      // even though we appended it to the database URL for reference.
      fetchUrl = fetchUrl.slice(0, -4);
    }

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
