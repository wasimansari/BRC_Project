# School Website - Eduubuzz

A comprehensive school website built with Angular frontend and Node.js backend, featuring admin panel for content management.

## Technology Stack

### Frontend
- **Angular 17** - Modern JavaScript framework
- **Bootstrap 5** - Responsive CSS framework
- **HTML5 & CSS3** - Standard web technologies
- **TypeScript** - Type-safe JavaScript

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage

### Hosting & Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

## Features

### Public Website
- Responsive design matching the provided mockup
- Hero section with slider
- Services section
- Popular courses display
- Statistics showcase
- Latest news section
- Online library
- Testimonials
- Events calendar
- Newsletter subscription
- Complete footer with links

### Admin Panel
- Secure login system
- Event management (add/delete with photo upload)
- News management
- Course management
- Real-time content updates
- File upload to Cloudinary

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd school-website
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run start

# Build for production
npm run build
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials:
# - MongoDB Atlas connection string
# - Cloudinary credentials
# - JWT secret key

# Run development server
npm run dev

# Run production server
npm start
```

### 4. Environment Variables

Create a `.env` file in the server directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-website
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (with image upload)
- `DELETE /api/events/:id` - Delete event

### News
- `GET /api/news` - Get all news
- `POST /api/news` - Create news
- `DELETE /api/news/:id` - Delete news

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `DELETE /api/courses/:id` - Delete course

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist/school-frontend`
4. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy automatically on push to main branch

### MongoDB Atlas
1. Create a free cluster
2. Get connection string
3. Add your IP to whitelist
4. Create database user with read/write permissions

### Cloudinary
1. Sign up for free account
2. Get API credentials from dashboard
3. Configure upload settings for images

## Project Structure

```
school-website/
├── src/
│   ├── app/
│   │   ├── components/          # Angular components
│   │   │   ├── header/
│   │   │   ├── hero-section/
│   │   │   ├── services/
│   │   │   ├── courses/
│   │   │   ├── statistics/
│   │   │   ├── news/
│   │   │   ├── library/
│   │   │   ├── testimonial/
│   │   │   ├── events/
│   │   │   └── footer/
│   │   ├── admin/              # Admin panel components
│   │   │   ├── admin-login/
│   │   │   └── admin-dashboard/
│   │   ├── app.module.ts
│   │   ├── app.component.ts
│   │   └── ...
│   ├── assets/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── server/
│   ├── server.js               # Express server
│   ├── package.json
│   └── .env.example
├── angular.json
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
