import { Component, OnInit } from '@angular/core';
import { EnhancedNewsService, DepartmentNews, NewsContentType } from '../../services/enhanced-news.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-department-news',
  templateUrl: './department-news.component.html',
  styleUrls: ['./department-news.component.css']
})
export class DepartmentNewsComponent implements OnInit {
  allNews: DepartmentNews[] = [];
  filteredNews: DepartmentNews[] = [];
  categories: string[] = [];
  selectedCategory: string = 'all';
  loading: boolean = true;
  selectedNews: DepartmentNews | null = null;
  showNewsDetail: boolean = false;
  NewsContentType = NewsContentType;

  constructor(
    private newsService: EnhancedNewsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadNews();
    
    // Check if category is specified in route
    this.route.params.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.filterNews();
      }
    });
  }

  loadNews() {
    this.loading = true;
    // Use force refresh to get latest data
    this.newsService.forceRefreshNews().subscribe({
      next: (news) => {
        this.allNews = news.sort((a, b) => b.displayOrder - a.displayOrder);
        this.filteredNews = [...this.allNews];
        this.loadCategories();
        this.loading = false;
        console.log('Department news loaded:', this.allNews);
      },
      error: (err) => {
        console.error('Error loading news:', err);
        // Try localStorage fallback
        const storedNews = this.newsService.getFromLocalStorage();
        if (storedNews) {
          this.allNews = storedNews.filter(item => item.isActive).sort((a, b) => b.displayOrder - a.displayOrder);
          this.filteredNews = [...this.allNews];
          this.loadCategories();
        }
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.newsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        // Extract categories from current news
        this.categories = [...new Set(this.allNews.map(news => news.category))];
      }
    });
  }

  filterNews() {
    if (this.selectedCategory === 'all') {
      this.filteredNews = [...this.allNews];
    } else {
      this.filteredNews = this.allNews.filter(news => news.category === this.selectedCategory);
    }
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.filterNews();
  }

  openNewsDetail(news: DepartmentNews) {
    this.selectedNews = news;
    this.showNewsDetail = true;
    document.body.style.overflow = 'hidden';
  }

  closeNewsDetail() {
    this.showNewsDetail = false;
    this.selectedNews = null;
    document.body.style.overflow = 'auto';
  }

  getContentIcon(contentType: NewsContentType): string {
    return this.newsService.getContentIcon(contentType);
  }

  getContentTypeLabel(contentType: NewsContentType): string {
    return this.newsService.getContentTypeLabel(contentType);
  }

  formatFileSize(bytes: number): string {
    return this.newsService.formatFileSize(bytes);
  }

  downloadPdf(pdfUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openPdfInNewTab(pdfUrl: string) {
    window.open(pdfUrl, '_blank');
  }

  truncateText(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
