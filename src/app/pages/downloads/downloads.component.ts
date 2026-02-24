import { Component } from '@angular/core';

interface DownloadFile {
  id: number;
  name: string;
  description: string;
  type: string;
  size: string;
  date: string;
  category: string;
  icon: string;
  color: string;
  url: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-downloads-page',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.css']
})
export class DownloadsPageComponent {
  activeCategory: string = 'all';

  categories: Category[] = [
    { id: 'forms', name: 'Forms', icon: 'fas fa-file-signature' },
    { id: 'syllabus', name: 'Syllabus', icon: 'fas fa-book' },
    { id: 'results', name: 'Results', icon: 'fas fa-chart-line' },
    { id: 'notices', name: 'Notices', icon: 'fas fa-bell' },
    { id: 'calendar', name: 'Calendar', icon: 'fas fa-calendar-alt' }
  ];

  downloads: DownloadFile[] = [
    {
      id: 1,
      name: 'Student Registration Form',
      description: 'New student admission registration form for academic year 2024-25',
      type: 'PDF',
      size: '256 KB',
      date: '15 Jan 2024',
      category: 'forms',
      icon: 'fas fa-file-pdf',
      color: '#e74c3c',
      url: '#'
    },
    {
      id: 2,
      name: 'Fee Structure 2024-25',
      description: 'Complete fee structure including tuition, transport, and hostel charges',
      type: 'PDF',
      size: '128 KB',
      date: '10 Jan 2024',
      category: 'notices',
      icon: 'fas fa-file-invoice',
      color: '#3498db',
      url: '#'
    },
    {
      id: 3,
      name: 'Class 6 Syllabus',
      description: 'Complete syllabus for Class 6 for the academic year 2024-25',
      type: 'PDF',
      size: '512 KB',
      date: '05 Jan 2024',
      category: 'syllabus',
      icon: 'fas fa-book-open',
      color: '#9b59b6',
      url: '#'
    },
    {
      id: 4,
      name: 'Class 7 Syllabus',
      description: 'Complete syllabus for Class 7 for the academic year 2024-25',
      type: 'PDF',
      size: '480 KB',
      date: '05 Jan 2024',
      category: 'syllabus',
      icon: 'fas fa-book-open',
      color: '#9b59b6',
      url: '#'
    },
    {
      id: 5,
      name: 'Class 8 Syllabus',
      description: 'Complete syllabus for Class 8 for the academic year 2024-25',
      type: 'PDF',
      size: '520 KB',
      date: '05 Jan 2024',
      category: 'syllabus',
      icon: 'fas fa-book-open',
      color: '#9b59b6',
      url: '#'
    },
    {
      id: 6,
      name: 'Half Yearly Results 2024',
      description: 'Class 6-8 half yearly examination results',
      type: 'PDF',
      size: '320 KB',
      date: '20 Dec 2023',
      category: 'results',
      icon: 'fas fa-file-csv',
      color: '#27ae60',
      url: '#'
    },
    {
      id: 7,
      name: 'Parent Consent Form',
      description: 'Medical and activity consent form for parents',
      type: 'PDF',
      size: '180 KB',
      date: '15 Dec 2023',
      category: 'forms',
      icon: 'fas fa-file-contract',
      color: '#e74c3c',
      url: '#'
    },
    {
      id: 8,
      name: 'Academic Calendar 2024',
      description: 'Important dates and events for the academic year 2024',
      type: 'PDF',
      size: '245 KB',
      date: '01 Dec 2023',
      category: 'calendar',
      icon: 'fas fa-calendar-check',
      color: '#f39c12',
      url: '#'
    },
    {
      id: 9,
      name: 'Holiday List 2024',
      description: 'List of holidays andvacation for the year 2024',
      type: 'PDF',
      size: '95 KB',
      date: '01 Dec 2023',
      category: 'calendar',
      icon: 'fas fa-calendar-minus',
      color: '#f39c12',
      url: '#'
    },
    {
      id: 10,
      name: 'Exam Guidelines',
      description: 'Examination guidelines and instructions for students',
      type: 'PDF',
      size: '156 KB',
      date: '20 Nov 2023',
      category: 'notices',
      icon: 'fas fa-clipboard-list',
      color: '#3498db',
      url: '#'
    },
    {
      id: 11,
      name: 'Transport Route List',
      description: 'Available transport routes and pickup points',
      type: 'PDF',
      size: '380 KB',
      date: '15 Nov 2023',
      category: 'notices',
      icon: 'fas fa-bus',
      color: '#1abc9c',
      url: '#'
    },
    {
      id: 12,
      name: 'Annual Exam Results',
      description: 'Class 6-8 annual examination results 2023',
      type: 'Excel',
      size: '420 KB',
      date: '10 Nov 2023',
      category: 'results',
      icon: 'fas fa-file-excel',
      color: '#27ae60',
      url: '#'
    }
  ];

  recentDownloads = this.downloads.slice(0, 4);

  get filteredDownloads(): DownloadFile[] {
    if (this.activeCategory === 'all') {
      return this.downloads;
    }
    return this.downloads.filter(file => file.category === this.activeCategory);
  }

  filterDownloads(categoryId: string): void {
    this.activeCategory = categoryId;
  }

  downloadFile(file: DownloadFile): void {
    console.log('Download requested:', file.name);
    alert(`Download started: ${file.name}\nFile type: ${file.type}\nSize: ${file.size}`);
  }
}