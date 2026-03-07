import { Component, OnInit } from '@angular/core';
import { DownloadService } from '../../services/download.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface DownloadFile {
  id: string;
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
  selector: 'app-downloads',
  
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.css']
})
export class DownloadsPageComponent implements OnInit {
  downloads: DownloadFile[] = [];
  categories: Category[] = [];
  activeCategory = 'all';
  loading = true;
  error = '';

  constructor(private downloadService: DownloadService) {}

  ngOnInit() {
    this.loadDownloads();
    this.loadCategories();
  }

  loadDownloads() {
    this.loading = true;
    this.downloadService.getAllDownloads().subscribe({
      next: (data: any[]) => {
        // Map API response to DownloadFile interface
        this.downloads = data.map(item => ({
          id: item._id || item.id,
          name: item.title,
          description: item.description || '',
          type: item.fileType || 'pdf',
          size: this.formatFileSize(item.fileSize || 0),
          date: new Date(item.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          category: item.category,
          icon: this.getIconForType(item.fileType),
          color: this.getColorForType(item.fileType),
          url: item.fileUrl
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading downloads:', err);
        this.error = 'Failed to load downloads';
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.downloadService.getCategories().subscribe({
      next: (categories: string[]) => {
        // Map API categories to Category interface
        this.categories = [
          { id: 'all', name: 'All', icon: 'fas fa-th' },
          ...categories.map(cat => ({
            id: cat,
            name: this.formatCategoryName(cat),
            icon: this.getIconForCategory(cat)
          }))
        ];
      },
      error: (err: any) => {
        console.error('Error loading categories:', err);
        // Fallback to default categories
        this.categories = [
          { id: 'all', name: 'All', icon: 'fas fa-th' },
          { id: 'forms', name: 'Forms', icon: 'fas fa-file-signature' },
          { id: 'syllabus', name: 'Syllabus', icon: 'fas fa-book' },
          { id: 'results', name: 'Results', icon: 'fas fa-chart-line' },
          { id: 'notices', name: 'Notices', icon: 'fas fa-bell' },
          { id: 'calendar', name: 'Calendar', icon: 'fas fa-calendar-alt' }
        ];
      }
    });
  }

  get filteredDownloads(): DownloadFile[] {
    if (this.activeCategory === 'all') {
      return this.downloads;
    }
    return this.downloads.filter(d => d.category === this.activeCategory);
  }

  get recentDownloads(): DownloadFile[] {
    return this.downloads.slice(0, 4);
  }

  filterDownloads(categoryId: string) {
    this.activeCategory = categoryId;
  }

  downloadFile(file: DownloadFile) {
    if (file.url) {
      // For PDFs, use a download link with proper filename
      if (file.type === 'pdf') {
        // Ensure filename doesn't have duplicate .pdf extension
        const filename = file.name.endsWith('.pdf') ? file.name : file.name + '.pdf';
        const link = document.createElement('a');
        link.href = file.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For images, open in new tab
        window.open(file.url, '_blank');
      }
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private getIconForType(fileType: string): string {
    if (fileType === 'pdf') return 'fas fa-file-pdf';
    return 'fas fa-file-image';
  }

  private getColorForType(fileType: string): string {
    if (fileType === 'pdf') return '#e74c3c';
    return '#27ae60';
  }

  private getIconForCategory(category: string): string {
    const icons: { [key: string]: string } = {
      'forms': 'fas fa-file-signature',
      'syllabus': 'fas fa-book',
      'results': 'fas fa-chart-line',
      'notices': 'fas fa-bell',
      'calendar': 'fas fa-calendar-alt'
    };
    return icons[category] || 'fas fa-file';
  }
}
