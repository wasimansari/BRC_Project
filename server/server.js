const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-website', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Schemas
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Models
const Event = mongoose.model('Event', eventSchema);
const News = mongoose.model('News', newsSchema);
const Course = mongoose.model('Course', courseSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Initialize default admin
const initializeAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword
      });
      await admin.save();
      console.log('Default admin user created');
    }
  } catch (error) {
    console.log('Error creating admin:', error);
  }
};

initializeAdmin();

// Event Routes
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

app.post('/api/events', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date } = req.body;
    
    let imageUrl = 'https://via.placeholder.com/400x250/007bff/ffffff?text=Event';
    
    if (req.file) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload_stream(
        { 
          folder: 'school-events',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            console.log('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'Error uploading image' });
          }
          imageUrl = result.secure_url;
          
          // Save event with image URL
          const event = new Event({
            title,
            description,
            date,
            image: imageUrl
          });
          
          event.save()
            .then(savedEvent => res.json(savedEvent))
            .catch(err => res.status(500).json({ message: 'Error saving event', error: err.message }));
        }
      );
      
      cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
        folder: 'school-events'
      }).then(result => {
        imageUrl = result.secure_url;
        
        const event = new Event({
          title,
          description,
          date,
          image: imageUrl
        });
        
        return event.save();
      }).then(savedEvent => {
        res.json(savedEvent);
      }).catch(err => {
        res.status(500).json({ message: 'Error saving event', error: err.message });
      });
    } else {
      const event = new Event({
        title,
        description,
        date,
        image: imageUrl
      });
      
      const savedEvent = await event.save();
      res.json(savedEvent);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// News Routes
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
});

app.post('/api/news', async (req, res) => {
  try {
    const { title, description } = req.body;
    const news = new News({
      title,
      description,
      image: 'https://via.placeholder.com/400x250/007bff/ffffff?text=News'
    });
    
    const savedNews = await news.save();
    res.json(savedNews);
  } catch (error) {
    res.status(500).json({ message: 'Error creating news', error: error.message });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting news', error: error.message });
  }
});

// Course Routes
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, rating } = req.body;
    const course = new Course({
      title,
      description,
      image: 'https://via.placeholder.com/400x250/007bff/ffffff?text=Course',
      rating: rating || 4.5
    });
    
    const savedCourse = await course.save();
    res.json(savedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
