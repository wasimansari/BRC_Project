import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnhancedNewsService, DepartmentNews, NewsContentType } from '../../services/enhanced-news.service';

@Component({
  selector: 'app-news-preview',
  templateUrl: './news-preview.component.html',
  styleUrls: ['./news-preview.component.css']
})
export class NewsPreviewComponent implements OnInit {
  latestNews: DepartmentNews[] = [];
  loading: boolean = true;
  NewsContentType = NewsContentType;

  constructor(
    private newsService: EnhancedNewsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLatestNews();
  }

  loadLatestNews() {
    // Always force refresh to get latest data
    this.newsService.forceRefreshNews().subscribe({
      next: (news) => {
        // Get latest 3 active news items
        this.latestNews = news
          .filter(item => item.isActive)
          .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
          .slice(0, 3);
        this.loading = false;
        console.log('Loaded latest news:', this.latestNews);
      },
      error: (err) => {
        console.error('Error loading latest news:', err);
        // Try localStorage fallback
        const storedNews = this.newsService.getFromLocalStorage();
        if (storedNews) {
          this.latestNews = storedNews
            .filter(item => item.isActive)
            .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
            .slice(0, 3);
          console.log('Loaded from localStorage fallback:', this.latestNews);
        }
        this.loading = false;
      }
    });
  }

  getContentIcon(contentType: any): string {
    return this.newsService.getContentIcon(contentType);
  }

  getContentTypeLabel(contentType: any): string {
    return this.newsService.getContentTypeLabel(contentType);
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  navigateToNews() {
    this.router.navigate(['/department-news']);
  }

  // Refresh news data (can be called from other components)
  refreshNews() {
    this.loadLatestNews();
  }
}
