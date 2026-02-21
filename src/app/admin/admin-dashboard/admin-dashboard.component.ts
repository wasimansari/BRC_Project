import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {
    if (!localStorage.getItem('isAdminLoggedIn')) {
      this.router.navigate(['/admin/login']);
    }
    this.loadStoredData();
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
