export type SearchTypeId = "udise" | "school" | "district" | "block";

// Gallery Categories - stored here for easy dynamic management
export interface GalleryCategory {
  value: string;
  label: string;
  icon: string;
  isDefault: boolean;
}

export const galleryCategories: GalleryCategory[] = [
  { value: 'science-fair', label: 'Science Fair', icon: 'fas fa-flask', isDefault: true },
  { value: 'sports-day', label: 'Sports Day', icon: 'fas fa-running', isDefault: true },
  { value: 'cultural-festival', label: 'Cultural Festival', icon: 'fas fa-music', isDefault: true },
  { value: 'academic-event', label: 'Academic Event', icon: 'fas fa-graduation-cap', isDefault: true },
  { value: 'miscellaneous', label: 'Miscellaneous', icon: 'fas fa-images', isDefault: true }
];

export const app_constants = {
  baseUrl: 'http://localhost:5000/api',
  udise: { search: 'https://kys.udiseplus.gov.in/webapp/api/search-schools' },
  udiseKnowMore:{knowMore:'https://kys.udiseplus.gov.in/webapp/api/school/report-card?schoolId='},
  udiseProfileDetail:{udiseProfile:'https://kys.udiseplus.gov.in/webapp/api/school/profile?schoolId='},
  udiseEnrollmentDetail:{udiseEnrollment:'https://kys.udiseplus.gov.in/webapp/api/school-statistics/enrolment-teacher?schoolId='},
  auth: { login: '/auth/login', signup: '/auth/signup', createAdmin: '/auth/create-admin' },
  events: { getAll: '/events', create: '/events', delete: '/events' },
  news: { getAll: '/news', create: '/news', delete: '/news' },
  courses: { getAll: '/courses', create: '/courses', delete: '/courses' },
  banners: { getAll: '/banners', getActive: '/banners', create: '/banners', update: '/banners', delete: '/banners' },
  about: { get: '/about', update: '/about', addStaff: '/about/staff', deleteStaff: '/about/staff' },
  gallery: { getAll: '/gallery', getByCategory: '/gallery/category', create: '/gallery', update: '/gallery', delete: '/gallery' },
  schools: { getAll: '/schools', uploadExcel: '/schools/upload-excel', exportPdf: '/schools/export-pdf', stats: '/schools/stats' },
  searchTypes: { BY_SCHOOL_NAME: '1', BY_UDISE_CODE: '3', BY_DISTRICT: '4', BY_BLOCK: '5' },
  searchTypeId: ['udise', 'school', 'district', 'block'] as const,
  searchTypeConfig: {
    default: 'udise',
    types: [
      { id: 'udise', label: 'By UDISE Code', icon: 'fas fa-id-card' },
      { id: 'school', label: 'By School Name', icon: 'fas fa-graduation-cap' },
      { id: 'district', label: 'By District', icon: 'fas fa-map-marker-alt' },
      { id: 'block', label: 'By Block', icon: 'fas fa-map-marked-alt' }
    ]
  },
  upDistricts: ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Auraiya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kashganj', 'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Rae Bareli', 'Rampur', 'Saharanpur', 'Sant Kabir Nagar', 'Sant Ravidas Nagar', 'Shahjahanpur', 'Shamli', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
  upBlocks: ['Ahirori', 'Ajhuva', 'Amraudha', 'Araziline', 'Asothar', 'Atrauli', 'Auraiya', 'Aurai', 'Ayana', 'Badlapur', 'Baghra', 'Bah', 'Bahadurpur', 'Baraut', 'Begumganj', 'Bhargo', 'Bhojpur', 'Bibiganj', 'Bijpura', 'Bilari', 'Bilaspur', 'Bindki', 'Bisalpur', 'Bisanda', 'Bithoor', 'Bulandshahr', 'Chandausi', 'Chandpur', 'Charkhari', 'Chhibramau', 'Chirgaon', 'Dadamari', 'Dhanipur', 'Dhaurhara', 'Dibiyapur', 'Dudhi', 'Etmadpur', 'Farrukhabad', 'Fatehgarh', 'Fatehpur', 'Garautha', 'Garhmukteshwar', 'Ghatampur', 'Ghorawal', 'Gosaiganj', 'Gunnaur', 'Gursahaiganj', 'Haidergarh', 'Hapur', 'Harraiya', 'Hasanganj', 'Hastinapur', 'Husainganj', 'Iltifatganj', 'Indara', 'Itaunja', 'Jafarabad', 'Jagner', 'Jalaun', 'Jalusi', 'Jamalpur', 'Jamshila', 'Jaunpur', 'Jhansi', 'Kabrai', 'Kachhauna', 'Kadipur', 'Kaimganj', 'Kairana', 'Kamalganj', 'Kamor', 'Kandhala', 'Kannauj', 'Kanpur', 'Kapsethi', 'Karla', 'Karyakund', 'Kaushambi', 'Khaga', 'Khair', 'Khalilabad', 'Kheragarh', 'Kunda', 'Kunwarpur', 'Kurali', 'Laharpur', 'Lalganj', 'Lalitpur', 'Machhlishahr', 'Madhugarh', 'Mahmoodabad', 'Mainpuri', 'Malihabad', 'Mau', 'Mauranipur', 'Mawana', 'Meernagar', 'Meja', 'Milak', 'Mirzapur', 'Misrikh', 'Modinagar', 'Mohan', 'Mubarakpur', 'Mungaoli', 'Nadigaon', 'Nagina', 'Nagram', 'Narauli', 'Narayanpur', 'Nawabganj', 'Nichlaul', 'Nidhauli', 'Nigoh', 'Niwari', 'Orai', 'Padrauna', 'Pahala', 'Pailani', 'Paniyra', 'Paras Rampur', 'Parshadepur', 'Patara', 'Pindra', 'Pipraich', 'Pipri', 'Raibareilly', 'Rampur', 'Rampura', 'Ranipur', 'Rasara', 'Rath', 'Richha', 'Robertsganj', 'Rudauli', 'Rudrapur', 'Sadabad', 'Safipur', 'Sagri', 'Saharanpur', 'Sahaspur', 'Sahoo', 'Salempur', 'Samthar', 'Sanda', 'Sandsal', 'Sankalp', 'Sant Kabir Nagar', 'Saraimir', 'Shahabad', 'Shahganj', 'Shahjahanpur', 'Shankargarh', 'Shergarh', 'Siddharthnagar', 'Sikanderpur', 'Sikhi', 'Sultanpur', 'Sundaripur', 'Taddipura', 'Tanda', 'Thakurdwara', 'Thana Bhawan', 'Tindwari', 'Tori', 'Tyonthar', 'Ujhani', 'Umri', 'Unnao', 'Urwa', 'Usehat', 'Varanasi', 'Visheshwarganj', 'Vyaspur', 'Wazirganj', 'Zaidpur'],
  schoolSearchStats: [
    { icon: 'fas fa-school', value: '150+', label: 'Schools', color: '#1abc9c' },
    { icon: 'fas fa-users', value: '50,000+', label: 'Students', color: '#3498db' },
    { icon: 'fas fa-chalkboard-teacher', value: '2,000+', label: 'Teachers', color: '#9b59b6' },
    { icon: 'fas fa-building', value: '25+', label: 'Blocks', color: '#e67e22' }
  ],
  homepageStatistics: [
    { number: '2+', label: 'Years' },
    { number: '4+', label: 'Campuses' },
    { number: '1+', label: 'Courses' },
    { number: '0+', label: 'Country' }
  ],
  defaultBanners: [
    { title: 'Education Needs Complete Solution', description: 'We provide comprehensive educational services to help students achieve their full potential.', image: 'assets/images/hero/1.webp' },
    { title: 'Quality Education for Bright Future', description: 'Join thousands of students who have transformed their lives through our educational programs.', image: 'assets/images/hero/2.jpg' }
  ],
  testimonialsData: [
    { name: 'Sarah Johnson', role: 'Computer Science Student', text: 'The education I received here has been life-changing. The teachers are dedicated, and the learning environment is exceptional. I highly recommend this institution to anyone seeking quality education.', image: '../../../../assets/images/testimonials/testimonial1.webp' },
    { name: 'Michael Chen', role: 'Business Administration', text: 'Outstanding curriculum and fantastic faculty members. The hands-on projects and real-world experience prepared me perfectly for my career. This institution truly cares about student success.', image: '../../../../assets/images/testimonials/testimonial2.webp' },
    { name: 'Emily Williams', role: 'Engineering Student', text: 'I am grateful for the excellent mentorship and state-of-the-art facilities. The collaborative atmosphere and focus on practical learning have helped me grow both personally and professionally.', image: '../../../../assets/images/testimonials/testimonial3.webp' },
    { name: 'David Martinez', role: 'Medical Science', text: 'The comprehensive coursework and research opportunities exceeded my expectations. The support from professors and staff made my journey here truly memorable and rewarding.', image: '../../../../assets/images/testimonials/testimonial4.webp' },
    { name: 'Jessica Brown', role: 'Arts & Design', text: 'Creative freedom combined with expert guidance helped me develop my unique artistic style. The campus culture fosters innovation and encourages students to think outside the box.', image: '../../../../assets/images/testimonials/testimonial5.webp' }
  ],
  galleryTabsOrder: ['science-fair', 'sports-day', 'cultural-festival', 'academic-event', 'miscellaneous'],
  noticesData: [
    { day: '15', month: 'Jan', category: 'Academic', categoryClass: 'category-academic', title: 'Mid-Term Examination Schedule', description: 'Mid-term examinations will commence from 15th January 2025. All students must prepare accordingly.', link: '/notices' },
    { day: '10', month: 'Jan', category: 'Event', categoryClass: 'category-event', title: 'Annual Sports Day 2025', description: 'Join us for the annual sports day celebration. Various competitions and activities await!', link: '/events' },
    { day: '05', month: 'Jan', category: 'Notice', categoryClass: 'category-notice', title: 'School Transport Route Update', description: 'New transport routes have been finalized. Check the details for your route.', link: '/notices' },
    { day: '01', month: 'Jan', category: 'Holiday', categoryClass: 'category-holiday', title: 'Holiday Calendar 2025', description: 'The holiday calendar for 2025 is now available. Plan your vacations accordingly.', link: '/notices' },
    { day: '28', month: 'Dec', category: 'Academic', categoryClass: 'category-academic', title: 'New Session Registration Open', description: 'Registration for the new academic session 2025 is now open. Enroll soon!', link: '/admissions' },
    { day: '20', month: 'Dec', category: 'Event', categoryClass: 'category-event', title: 'Science Exhibition', description: 'Annual science exhibition showcasing innovative projects from students.', link: '/events' }
  ],
  adminDashboard:{
    isAdminLoggedIn:'isAdminLoggedIn',
    errorLoading:'Error loading about content',
    imgSize:'Image size should be',
    validImg:'Unable to load image. Please choose a valid image file.',
    visionSuccess:'Vision & Mission updated successfully!',
    errorVision:'Error saving vision & mission:',
    visionSaveLocal:'Vision & Mission saved locally!',
    fillRequired:'Please fill in required fields',
    beoImageFix:'Please fix the BEO image dimension error before saving',
    beoProfileSuccess:'BEO Profile updated successfully! Image uploaded to Cloudinary.',
    beoError:'Error saving BEO profile:'
  }
};
