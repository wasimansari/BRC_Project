const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { About } = require('../models');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// @route   GET /api/about
// @desc    Get about content
// @access  Public
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About({
        vision: 'To be a leading educational institution that nurtures creativity, critical thinking, and lifelong learning among students, preparing them for success in an ever-changing world.',
        mission: ['Improve quality of education', 'Teacher training & monitoring', 'Policy implementation'],
        beoProfile: {
          name: 'Dr. Rajesh Kumar',
          qualification: 'M.Ed., Ph.D. in Education',
          experience: '15+ Years in Educational Administration',
          mobile: '+91 98765 43210',
          email: 'beo@example.edu',
          message: 'It is my privilege to lead this institution towards excellence in education.',
          image: ''
        },
        organizationalStructure: [],
        staffDetails: []
      });
      await about.save();
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching about content', error: error.message });
  }
});

// @route   PUT /api/about
// @desc    Update about content
// @access  Public
router.put('/', upload.single('image'), async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About();
    }

    const data = req.body;

    // Handle vision and mission
    if (data.vision) about.vision = data.vision;
    if (data.mission) {
      try {
        about.mission = typeof data.mission === 'string' ? JSON.parse(data.mission) : data.mission;
      } catch (e) {
        about.mission = data.mission;
      }
    }

    // Handle BEO Profile
    if (data.beoName || data.beoQualification || req.file) {
      let imageUrl = about.beoProfile?.image || '';

      if (req.file) {
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'school-about/beo' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        const uploadResult = await uploadPromise;
        imageUrl = uploadResult.secure_url;
      } else if (data.existingImage) {
        imageUrl = data.existingImage;
      }

      about.beoProfile = {
        name: data.beoName || about.beoProfile?.name || '',
        qualification: data.beoQualification || about.beoProfile?.qualification || '',
        experience: data.beoExperience || about.beoProfile?.experience || '',
        mobile: data.beoMobile || about.beoProfile?.mobile || '',
        email: data.beoEmail || about.beoProfile?.email || '',
        message: data.beoMessage || about.beoProfile?.message || '',
        image: imageUrl
      };
    }

    // Handle organizational structure
    if (data.organizationalStructure) {
      try {
        about.organizationalStructure = typeof data.organizationalStructure === 'string'
          ? JSON.parse(data.organizationalStructure)
          : data.organizationalStructure;
      } catch (e) {
        about.organizationalStructure = data.organizationalStructure;
      }
    }

    // Handle staff details
    if (data.staffDetails) {
      try {
        about.staffDetails = typeof data.staffDetails === 'string'
          ? JSON.parse(data.staffDetails)
          : data.staffDetails;
      } catch (e) {
        about.staffDetails = data.staffDetails;
      }
    }

    about.updatedAt = new Date();
    const savedAbout = await about.save();
    res.json(savedAbout);
  } catch (error) {
    console.error('Error updating about:', error);
    res.status(500).json({ message: 'Error updating about content', error: error.message });
  }
});

// @route   POST /api/about/staff
// @desc    Add staff with image upload
// @access  Public
router.post('/staff', upload.single('image'), async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About({ staffDetails: [] });
    }

    let imageUrl = '';
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'school-about/staff' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;
      imageUrl = uploadResult.secure_url;
    }

    const newStaff = {
      name: req.body.name,
      designation: req.body.designation,
      mobile: req.body.mobile || '',
      email: req.body.email || '',
      image: imageUrl
    };

    about.staffDetails.push(newStaff);
    await about.save();
    res.status(201).json(about.staffDetails[about.staffDetails.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding staff', error: error.message });
  }
});

// @route   DELETE /api/about/staff/:index
// @desc    Delete staff
// @access  Public
router.delete('/staff/:index', async (req, res) => {
  try {
    const about = await About.findOne();
    if (!about) {
      return res.status(404).json({ message: 'About content not found' });
    }

    const index = parseInt(req.params.index);
    if (index >= 0 && index < about.staffDetails.length) {
      about.staffDetails.splice(index, 1);
      await about.save();
      res.json({ message: 'Staff deleted successfully' });
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff', error: error.message });
  }
});

module.exports = router;