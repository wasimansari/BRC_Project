import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BannerService, Banner } from '../../services/banner.service';
import { EventService, Event } from '../../services/event.service';
import { NewsService, News } from '../../services/news.service';
import { CourseService, Course } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { AboutService, AboutContent, BEOProfile, OrgStructure, StaffMember } from '../../services/about.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  selectedFile: File | null = null;
  eventTitle = '';
  eventDescription = '';
  eventDate = '';
  events: Event[] = [];
  news: News[] = [];
  courses: Course[] = [];

  // Banner properties
  banners: Banner[] = [];
  bannerTitle = '';
  bannerDescription = '';
  bannerOrder = 0;
  bannerIsActive = true;
  bannerFile: File | null = null;
  bannerPreview: string | null = null;
  
  // Edit mode properties
  isEditMode = false;
  editingBannerId: string | null = null;
  existingBannerImage: string | null = null;

  // Banner size validation
  bannerSizeError = '';
  readonly BANNER_WIDTH = 1920;
  readonly BANNER_HEIGHT = 800;

  // BEO Profile photo size validation
  beoSizeError = '';
  readonly BEO_IMAGE_WIDTH = 400;
  readonly BEO_IMAGE_HEIGHT = 400;

  // Staff photo size validation
  staffSizeError = '';
  readonly STAFF_IMAGE_WIDTH = 300;
  readonly STAFF_IMAGE_HEIGHT = 300;

  // About content properties
  aboutContent: AboutContent = {
    vision: '',
    mission: [],
    beoProfile: {
      name: '',
      qualification: '',
      experience: '',
      mobile: '',
      email: '',
      message: '',
      image: ''
    },
    organizationalStructure: [],
    staffDetails: []
  };

  // Form fields for about content
  visionText = '';
  missionItems: string[] = [''];
  
  // BEO Profile form
  beoName = '';
  beoQualification = '';
  beoExperience = '';
  beoMobile = '';
  beoEmail = '';
  beoMessage = '';
  beoImage: File | null = null;
  beoImagePreview: string | null = null;
  existingBeoImage: string | null = null;

  // Staff form
  staffName = '';
  staffDesignation = '';
  staffMobile = '';
  staffEmail = '';
  staffImage: File | null = null;
  staffImagePreview: string | null = null;

  // Org Structure form
  orgRole = '';
  orgIcon = 'fa-user-tie';
  orgColor = '#1abc9c';

  // Edit mode for staff
  editingStaffId: string | null = null;

  constructor(
    private router: Router,
    private bannerService: BannerService,
    private eventService: EventService,
    private newsService: NewsService,
    private courseService: CourseService,
    private authService: AuthService,
    private aboutService: AboutService
  ) {}

  ngOnInit() {
    if (!localStorage.getItem('isAdminLoggedIn')) {
      this.router.navigate(['/admin/login']);
    }
    this.loadStoredData();
    this.loadBanners();
    this.loadAboutContent();
  }

  // About Content Methods
  loadAboutContent() {
    this.aboutService.getAbout().subscribe({
      next: (data) => {
        this.aboutContent = data;
        this.visionText = data.vision || '';
        this.missionItems = data.mission && data.mission.length > 0 ? [...data.mission] : [''];
        
        if (data.beoProfile) {
          this.beoName = data.beoProfile.name || '';
          this.beoQualification = data.beoProfile.qualification || '';
          this.beoExperience = data.beoProfile.experience || '';
          this.beoMobile = data.beoProfile.mobile || '';
          this.beoEmail = data.beoProfile.email || '';
          this.beoMessage = data.beoProfile.message || '';
          this.existingBeoImage = data.beoProfile.image || null;
          this.beoImagePreview = data.beoProfile.image || null;
        }
        
        // Save to localStorage
        this.aboutService.saveToLocalStorage(data);
      },
      error: (err) => console.error('Error loading about content:', err)
    });
  }

  addMissionItem() {
    this.missionItems.push('');
  }

  removeMissionItem(index: number) {
    if (this.missionItems.length > 1) {
      this.missionItems.splice(index, 1);
    }
  }

  onBeoImageSelected(event: any) {
    this.beoImage = event.target.files[0];
    this.beoSizeError = '';
    
    if (this.beoImage) {
      // Validate image dimensions
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          
          // Allow some tolerance (+- 30px) for the dimensions
          const widthTolerance = 30;
          const heightTolerance = 30;
          
          if (Math.abs(width - this.BEO_IMAGE_WIDTH) > widthTolerance || 
              Math.abs(height - this.BEO_IMAGE_HEIGHT) > heightTolerance) {
            this.beoSizeError = `Image size should be ${this.BEO_IMAGE_WIDTH}x${this.BEO_IMAGE_HEIGHT}px (square photo recommended). Current: ${width}x${height}px`;
            // Clear the file to prevent submission
            this.beoImage = null;
            this.beoImagePreview = null;
            event.target.value = '';
            return;
          } else {
            this.beoImagePreview = e.target.result;
          }
        };
        
        img.onerror = () => {
          this.beoSizeError = 'Unable to load image. Please choose a valid image file.';
          this.beoImage = null;
          this.beoImagePreview = null;
          event.target.value = '';
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(this.beoImage);
    }
  }

  onStaffImageSelected(event: any) {
    this.staffImage = event.target.files[0];
    this.staffSizeError = '';
    
    if (this.staffImage) {
      // Validate image dimensions
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          
          // Allow some tolerance (+- 30px) for the dimensions
          const widthTolerance = 30;
          const heightTolerance = 30;
          
          if (Math.abs(width - this.STAFF_IMAGE_WIDTH) > widthTolerance || 
              Math.abs(height - this.STAFF_IMAGE_HEIGHT) > heightTolerance) {
            this.staffSizeError = `Image size should be ${this.STAFF_IMAGE_WIDTH}x${this.STAFF_IMAGE_HEIGHT}px (square photo recommended). Current: ${width}x${height}px`;
            // Clear the file to prevent submission
            this.staffImage = null;
            this.staffImagePreview = null;
            event.target.value = '';
            return;
          } else {
            this.staffImagePreview = e.target.result;
          }
        };
        
        img.onerror = () => {
          this.staffSizeError = 'Unable to load image. Please choose a valid image file.';
          this.staffImage = null;
          this.staffImagePreview = null;
          event.target.value = '';
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(this.staffImage);
    }
  }

  saveVisionMission() {
    const vision = this.visionText;
    const mission = this.missionItems.filter(item => item.trim() !== '');

    this.aboutService.updateVisionMission(vision, mission).subscribe({
      next: (response) => {
        this.aboutContent = response;
        this.aboutService.saveToLocalStorage(response);
        alert('Vision & Mission updated successfully!');
      },
      error: (err) => {
        console.error('Error saving vision & mission:', err);
        // Save locally anyway
        this.aboutContent.vision = vision;
        this.aboutContent.mission = mission;
        this.aboutService.saveToLocalStorage(this.aboutContent);
        alert('Vision & Mission saved locally!');
      }
    });
  }

  saveBeoProfile() {
    if (!this.beoName || !this.beoQualification) {
      alert('Please fill in required fields');
      return;
    }

    const beoProfile: BEOProfile = {
      name: this.beoName,
      qualification: this.beoQualification,
      experience: this.beoExperience,
      mobile: this.beoMobile,
      email: this.beoEmail,
      message: this.beoMessage,
      image: this.existingBeoImage || ''
    };

    // Use FormData to upload image to Cloudinary      // Check dimension validation before saving
      if (this.beoImage && this.beoSizeError) {
        alert('Please fix the BEO image dimension error before saving');
        return;
      }

      this.aboutService.updateBeoProfile(beoProfile, this.beoImage || undefined, this.existingBeoImage || undefined).subscribe({
      next: (response) => {
        this.aboutContent = response;
        this.existingBeoImage = response.beoProfile?.image || null;
        this.beoImagePreview = response.beoProfile?.image || null;
        this.beoImage = null;
        this.aboutService.saveToLocalStorage(response);
        alert('BEO Profile updated successfully! Image uploaded to Cloudinary.');
      },
      error: (err) => {
        console.error('Error saving BEO profile:', err);
        // Save locally anyway
        this.aboutContent.beoProfile = {
          ...beoProfile,
          image: this.beoImagePreview || this.existingBeoImage || ''
        };
        this.aboutService.saveToLocalStorage(this.aboutContent);
        alert('BEO Profile saved locally!');
      }
    });
  }

  addStaff() {
    if (!this.staffName || !this.staffDesignation) {
      alert('Please fill in required fields');
      return;
    }

    // Check dimension validation before saving
    if (this.staffImage && this.staffSizeError) {
      alert('Please fix the staff image dimension error before saving');
      return;
    }

    // Use the API to add staff with image upload to Cloudinary
    const formData = new FormData();
    formData.append('name', this.staffName);
    formData.append('designation', this.staffDesignation);
    formData.append('mobile', this.staffMobile);
    formData.append('email', this.staffEmail);
    
    if (this.staffImage) {
      formData.append('image', this.staffImage);
    }

    // If editing, use update method instead
    if (this.editingStaffId && this.aboutContent.staffDetails) {
      const index = this.aboutContent.staffDetails?.findIndex(s => 
        (s._id || s.id?.toString()) === this.editingStaffId
      ) ?? -1;
      
      if (index >= 0) {
        const existingStaff = this.aboutContent.staffDetails?.[index];
        const updatedStaff = {
          ...existingStaff,
          name: this.staffName,
          designation: this.staffDesignation,
          mobile: this.staffMobile,
          email: this.staffEmail,
          image: this.staffImagePreview || existingStaff?.image || ''
        };
        
        // If new image selected, we need to upload via API
        if (this.staffImage) {
          this.aboutService.updateStaffDetails(this.aboutContent.staffDetails?.map((s, i) => 
            i === index ? updatedStaff : s
          ) || []).subscribe({
            next: (response) => {
              this.aboutContent = response;
              this.aboutService.saveToLocalStorage(response);
              this.resetStaffForm();
              alert('Staff updated successfully! Image uploaded to Cloudinary.');
            },
            error: (err) => {
              console.error('Error updating staff:', err);
              if (this.aboutContent.staffDetails) {
                this.aboutContent.staffDetails[index] = updatedStaff;
              }
              this.aboutService.saveToLocalStorage(this.aboutContent);
              this.resetStaffForm();
              alert('Staff updated locally!');
            }
          });
        } else {
          if (this.aboutContent.staffDetails) {
            this.aboutContent.staffDetails[index] = updatedStaff;
          }
          this.aboutService.updateStaffDetails(this.aboutContent.staffDetails).subscribe({
            next: (response) => {
              this.aboutContent = response;
              this.aboutService.saveToLocalStorage(response);
              this.resetStaffForm();
              alert('Staff updated successfully!');
            },
            error: (err) => {
              console.error('Error updating staff:', err);
              this.aboutService.saveToLocalStorage(this.aboutContent);
              this.resetStaffForm();
              alert('Staff updated locally!');
            }
          });
        }
      }
    } else {
      // Add new staff via API
      this.aboutService.addStaff(formData).subscribe({
        next: (response) => {
          if (!this.aboutContent.staffDetails) {
            this.aboutContent.staffDetails = [];
          }
          this.aboutContent.staffDetails.push(response);
          this.aboutService.saveToLocalStorage(this.aboutContent);
          this.resetStaffForm();
          alert('Staff added successfully! Image uploaded to Cloudinary.');
        },
        error: (err) => {
          console.error('Error adding staff:', err);
          // Save locally as fallback
          const newStaff: StaffMember = {
            id: Date.now(),
            name: this.staffName,
            designation: this.staffDesignation,
            mobile: this.staffMobile,
            email: this.staffEmail,
            image: this.staffImagePreview || undefined
          };
          if (!this.aboutContent.staffDetails) {
            this.aboutContent.staffDetails = [];
          }
          this.aboutContent.staffDetails.push(newStaff);
          this.aboutService.saveToLocalStorage(this.aboutContent);
          this.resetStaffForm();
          alert('Staff added locally!');
        }
      });
    }
  }

  editStaff(staff: StaffMember) {
    this.staffName = staff.name;
    this.staffDesignation = staff.designation;
    this.staffMobile = staff.mobile;
    this.staffEmail = staff.email;
    this.staffImagePreview = staff.image || null;
    this.editingStaffId = staff.id?.toString() || staff._id || null;
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteStaff(index: number) {
    if (confirm('Are you sure you want to delete this staff member?')) {
      // Use index-based deletion as per backend API
      this.aboutService.deleteStaff(index.toString()).subscribe({
        next: () => {
          if (this.aboutContent.staffDetails) {
            this.aboutContent.staffDetails.splice(index, 1);
            this.aboutService.saveToLocalStorage(this.aboutContent);
          }
          alert('Staff deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting staff:', err);
          // Fallback to local deletion
          if (this.aboutContent.staffDetails) {
            this.aboutContent.staffDetails.splice(index, 1);
            this.aboutService.saveToLocalStorage(this.aboutContent);
          }
          alert('Staff deleted locally!');
        }
      });
    }
  }

  resetStaffForm() {
    this.staffName = '';
    this.staffDesignation = '';
    this.staffMobile = '';
    this.staffEmail = '';
    this.staffImage = null;
    this.staffImagePreview = null;
    this.editingStaffId = null;
  }

  addOrgStructure() {
    if (!this.orgRole) {
      alert('Please enter a role');
      return;
    }

    const newOrg: OrgStructure = {
      role: this.orgRole,
      icon: this.orgIcon,
      color: this.orgColor
    };

    if (!this.aboutContent.organizationalStructure) {
      this.aboutContent.organizationalStructure = [];
    }

    this.aboutContent.organizationalStructure.push(newOrg);

    this.aboutService.updateAbout(this.aboutContent).subscribe({
      next: (response) => {
        this.aboutContent = response;
        this.aboutService.saveToLocalStorage(response);
        this.orgRole = '';
        alert('Organization structure added successfully!');
      },
      error: (err) => {
        console.error('Error adding org structure:', err);
        this.aboutService.saveToLocalStorage(this.aboutContent);
        this.orgRole = '';
        alert('Organization structure saved locally!');
      }
    });
  }

  deleteOrgStructure(index: number) {
    if (confirm('Are you sure you want to delete this organization structure item?')) {
      this.aboutContent.organizationalStructure?.splice(index, 1);

      this.aboutService.updateAbout(this.aboutContent).subscribe({
        next: (response) => {
          this.aboutContent = response;
          this.aboutService.saveToLocalStorage(response);
          alert('Organization structure deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting org structure:', err);
          this.aboutService.saveToLocalStorage(this.aboutContent);
          alert('Organization structure deleted locally!');
        }
      });
    }
  }

  // Banner Methods
  loadBanners() {
    this.bannerService.getAllBanners().subscribe({
      next: (data) => {
        this.banners = data;
        // Store in localStorage for hero section
        localStorage.setItem('banners', JSON.stringify(data));
      },
      error: (err) => console.error('Error loading banners:', err)
    });
  }

  onBannerFileSelected(event: any) {
    this.bannerFile = event.target.files[0];
    this.bannerSizeError = '';
    
    if (this.bannerFile) {
      // Validate image dimensions
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          
          // Allow some tolerance (+- 50px) for the dimensions
          const widthTolerance = 50;
          const heightTolerance = 50;
          
          if (Math.abs(width - this.BANNER_WIDTH) > widthTolerance || 
              Math.abs(height - this.BANNER_HEIGHT) > heightTolerance) {
            this.bannerSizeError = `Image size should be ${this.BANNER_WIDTH}x${this.BANNER_HEIGHT}px. Current: ${width}x${height}px`;
            // Clear the file to prevent submission
            this.bannerFile = null;
            this.bannerPreview = null;
            event.target.value = '';
          } else {
            // this.bannerPreview = URL.createObjectURL(this.bannerFile);
          }
        };
        
        img.onerror = () => {
          this.bannerSizeError = 'Unable to load image. Please choose a valid image file.';
          this.bannerFile = null;
          this.bannerPreview = null;
          event.target.value = '';
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(this.bannerFile);
    }
  }

  addBanner() {
    if (!this.bannerTitle || (!this.bannerFile && !this.isEditMode)) {
      alert('Please provide title and image');
      return;
    }

    if (this.isEditMode) {
      this.updateBanner();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.bannerTitle);
    formData.append('description', this.bannerDescription);
    formData.append('order', this.bannerOrder.toString());
    formData.append('isActive', this.bannerIsActive.toString());
    formData.append('image', this.bannerFile!);

    this.bannerService.createBanner(formData).subscribe({
      next: (response) => {
        this.banners.push(response);
        this.resetBannerForm();
        alert('Banner added successfully!');
        this.loadBanners();
      },
      error: (err) => {
        console.error('Error adding banner:', err);
        alert('Error adding banner');
      }
    });
  }

  editBanner(banner: Banner) {
    this.isEditMode = true;
    this.editingBannerId = banner._id || null;
    this.bannerTitle = banner.title;
    this.bannerDescription = banner.description || '';
    this.bannerOrder = banner.order || 0;
    this.bannerIsActive = banner.isActive ?? true;
    this.existingBannerImage = banner.image;
    this.bannerPreview = banner.image;
    this.bannerFile = null;
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateBanner() {
    if (!this.bannerTitle || !this.editingBannerId) {
      alert('Please provide title');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.bannerTitle);
    formData.append('description', this.bannerDescription);
    formData.append('order', this.bannerOrder.toString());
    formData.append('isActive', this.bannerIsActive.toString());
    
    // Only append new image if selected
    if (this.bannerFile) {
      formData.append('image', this.bannerFile);
    } else if (this.existingBannerImage) {
      formData.append('existingImage', this.existingBannerImage);
    }

    this.bannerService.updateBanner(this.editingBannerId!, formData).subscribe({
      next: (response) => {
        this.resetBannerForm();
        alert('Banner updated successfully!');
        this.loadBanners();
      },
      error: (err) => {
        console.error('Error updating banner:', err);
        alert('Error updating banner');
      }
    });
  }

  cancelEdit() {
    this.resetBannerForm();
  }

  resetBannerForm() {
    this.bannerTitle = '';
    this.bannerDescription = '';
    this.bannerOrder = 0;
    this.bannerIsActive = true;
    this.bannerFile = null;
    this.bannerPreview = null;
    this.isEditMode = false;
    this.editingBannerId = null;
    this.existingBannerImage = null;
  }

  toggleBannerStatus(banner: Banner) {
    const updatedStatus = !banner.isActive;
    this.bannerService.toggleBannerStatus(banner._id!, updatedStatus).subscribe({
      next: (response) => {
        banner.isActive = updatedStatus;
        this.loadBanners();
      },
      error: (err) => console.error('Error updating banner:', err)
    });
  }

  deleteBanner(id: string) {
    if (confirm('Are you sure you want to delete this banner?')) {
      this.bannerService.deleteBanner(id).subscribe({
        next: () => {
          this.banners = this.banners.filter(b => b._id !== id);
          this.loadBanners();
          alert('Banner deleted successfully!');
        },
        error: (err) => console.error('Error deleting banner:', err)
      });
    }
  }

  loadStoredData() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        localStorage.setItem('events', JSON.stringify(data));
      },
      error: (err) => {
        console.error('Error loading events:', err);
        const storedEvents = localStorage.getItem('events');
        if (storedEvents) this.events = JSON.parse(storedEvents);
      }
    });

    this.newsService.getNews().subscribe({
      next: (data) => {
        this.news = data;
        localStorage.setItem('news', JSON.stringify(data));
      },
      error: (err) => {
        console.error('Error loading news:', err);
        const storedNews = localStorage.getItem('news');
        if (storedNews) this.news = JSON.parse(storedNews);
      }
    });

    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        localStorage.setItem('courses', JSON.stringify(data));
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        const storedCourses = localStorage.getItem('courses');
        if (storedCourses) this.courses = JSON.parse(storedCourses);
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  addEvent() {
    if (this.eventTitle && this.eventDescription && this.eventDate) {
      const formData = new FormData();
      formData.append('title', this.eventTitle);
      formData.append('description', this.eventDescription);
      formData.append('date', this.eventDate);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.eventService.createEvent(formData).subscribe({
        next: (response) => {
          this.events.push(response);
          localStorage.setItem('events', JSON.stringify(this.events));
          this.eventTitle = '';
          this.eventDescription = '';
          this.eventDate = '';
          this.selectedFile = null;
          alert('Event added successfully!');
        },
        error: (err) => {
          console.error('Error adding event:', err);
          alert('Error adding event');
        }
      });
    }
  }

  addNews() {
    const title = prompt('Enter news title:');
    const description = prompt('Enter news description:');
    const imageUrl = prompt('Enter image URL (or leave empty for default):');
    
    if (title && description) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      this.newsService.createNews(formData).subscribe({
        next: (response) => {
          this.news.push(response);
          localStorage.setItem('news', JSON.stringify(this.news));
          alert('News added successfully!');
        },
        error: (err) => {
          console.error('Error adding news:', err);
          alert('Error adding news');
        }
      });
    }
  }

  addCourse() {
    const title = prompt('Enter course title:');
    const description = prompt('Enter course description:');
    const imageUrl = prompt('Enter image URL (or leave empty for default):');
    
    if (title && description) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      this.courseService.createCourse(formData).subscribe({
        next: (response) => {
          this.courses.push(response);
          localStorage.setItem('courses', JSON.stringify(this.courses));
          alert('Course added successfully!');
        },
        error: (err) => {
          console.error('Error adding course:', err);
          alert('Error adding course');
        }
      });
    }
  }

  deleteEvent(id: string | number) {
    const eventId = typeof id === 'string' ? id : this.events.find(e => e.id === id)?._id || id.toString();
    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.events = this.events.filter(event => event.id !== id);
        localStorage.setItem('events', JSON.stringify(this.events));
        alert('Event deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting event:', err);
        alert('Error deleting event');
      }
    });
  }

  deleteNews(id: string | number) {
    const newsId = typeof id === 'string' ? id : this.news.find(n => n.id === id)?._id || id.toString();
    this.newsService.deleteNews(newsId).subscribe({
      next: () => {
        this.news = this.news.filter(item => item.id !== id);
        localStorage.setItem('news', JSON.stringify(this.news));
        alert('News deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting news:', err);
        alert('Error deleting news');
      }
    });
  }

  deleteCourse(id: string | number) {
    const courseId = typeof id === 'string' ? id : this.courses.find(c => c.id === id)?._id || id.toString();
    this.courseService.deleteCourse(courseId).subscribe({
      next: () => {
        this.courses = this.courses.filter(course => course.id !== id);
        localStorage.setItem('courses', JSON.stringify(this.courses));
        alert('Course deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting course:', err);
        alert('Error deleting course');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
