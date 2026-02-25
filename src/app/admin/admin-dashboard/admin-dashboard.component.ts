import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  events: any[] = [];
  news: any[] = [];
  courses: any[] = [];

  // Banner properties
  banners: any[] = [];
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

  private apiUrl = 'http://localhost:5000/api';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    if (!localStorage.getItem('isAdminLoggedIn')) {
      this.router.navigate(['/admin/login']);
    }
    this.loadStoredData();
    this.loadBanners();
  }

  // Banner Methods
  loadBanners() {
    this.http.get<any[]>(`${this.apiUrl}/banners/all`).subscribe({
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

    this.http.post<any>(`${this.apiUrl}/banners`, formData).subscribe({
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

  editBanner(banner: any) {
    this.isEditMode = true;
    this.editingBannerId = banner._id;
    this.bannerTitle = banner.title;
    this.bannerDescription = banner.description || '';
    this.bannerOrder = banner.order || 0;
    this.bannerIsActive = banner.isActive;
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

    this.http.put<any>(`${this.apiUrl}/banners/${this.editingBannerId}`, formData).subscribe({
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

  toggleBannerStatus(banner: any) {
    const updatedStatus = !banner.isActive;
    this.http.put<any>(`${this.apiUrl}/banners/${banner._id}`, {
      isActive: updatedStatus
    }).subscribe({
      next: (response) => {
        banner.isActive = updatedStatus;
        this.loadBanners();
      },
      error: (err) => console.error('Error updating banner:', err)
    });
  }

  deleteBanner(id: string) {
    if (confirm('Are you sure you want to delete this banner?')) {
      this.http.delete(`${this.apiUrl}/banners/${id}`).subscribe({
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
    const storedEvents = localStorage.getItem('events');
    const storedNews = localStorage.getItem('news');
    const storedCourses = localStorage.getItem('courses');
    
    if (storedEvents) this.events = JSON.parse(storedEvents);
    if (storedNews) this.news = JSON.parse(storedNews);
    if (storedCourses) this.courses = JSON.parse(storedCourses);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  addEvent() {
    if (this.eventTitle && this.eventDescription && this.eventDate) {
      const newEvent = {
        id: Date.now(),
        title: this.eventTitle,
        description: this.eventDescription,
        date: this.eventDate,
        image: this.selectedFile ? URL.createObjectURL(this.selectedFile) : 'https://via.placeholder.com/400x250/007bff/ffffff?text=Event'
      };
      
      this.events.push(newEvent);
      localStorage.setItem('events', JSON.stringify(this.events));
      
      this.eventTitle = '';
      this.eventDescription = '';
      this.eventDate = '';
      this.selectedFile = null;
      
      alert('Event added successfully!');
    }
  }

  addNews() {
    const title = prompt('Enter news title:');
    const description = prompt('Enter news description:');
    
    if (title && description) {
      const newNews = {
        id: Date.now(),
        title,
        description,
        image: 'https://via.placeholder.com/400x250/007bff/ffffff?text=News'
      };
      
      this.news.push(newNews);
      localStorage.setItem('news', JSON.stringify(this.news));
      alert('News added successfully!');
    }
  }

  addCourse() {
    const title = prompt('Enter course title:');
    const description = prompt('Enter course description:');
    
    if (title && description) {
      const newCourse = {
        id: Date.now(),
        title,
        description,
        image: 'https://via.placeholder.com/400x250/007bff/ffffff?text=Course',
        rating: 4.5
      };
      
      this.courses.push(newCourse);
      localStorage.setItem('courses', JSON.stringify(this.courses));
      alert('Course added successfully!');
    }
  }

  deleteEvent(id: number) {
    this.events = this.events.filter(event => event.id !== id);
    localStorage.setItem('events', JSON.stringify(this.events));
  }

  deleteNews(id: number) {
    this.news = this.news.filter(item => item.id !== id);
    localStorage.setItem('news', JSON.stringify(this.news));
  }

  deleteCourse(id: number) {
    this.courses = this.courses.filter(course => course.id !== id);
    localStorage.setItem('courses', JSON.stringify(this.courses));
  }

  logout() {
    localStorage.removeItem('isAdminLoggedIn');
    this.router.navigate(['/admin/login']);
  }
}
