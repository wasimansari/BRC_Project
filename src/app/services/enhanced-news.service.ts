import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { app_constants } from '../../constant';

export enum NewsContentType {
  TEXT = 'text',
  IMAGE = 'image',
  PDF = 'pdf'
}

export interface NewsContent {
  type: NewsContentType;
  text?: string;
  imageUrl?: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface DepartmentNews {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  content: NewsContent;
  category: string;
  isActive: boolean;
  displayOrder: number;
  publishDate: Date;
  author: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NewsFormData {
  title: string;
  description: string;
  category: string;
  author: string;
  tags: string[];
  contentType: NewsContentType;
  textContent?: string;
  imageFile?: File;
  pdfFile?: File;
  isActive: boolean;
  displayOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class EnhancedNewsService {
  private readonly NEWS_ENDPOINT = app_constants.baseUrl + app_constants.news.getAll;
  private readonly UPLOAD_ENDPOINT = app_constants.baseUrl + '/news'; // Use existing news upload endpoint

  // Local fallback news data
  private localNews: DepartmentNews[] = [
    {
      id: 1,
      title: 'School Wins Best Institution Award',
      description: 'Our institution has been awarded the Best School Award for excellence in education and innovative teaching methods.',
      content: {
        type: NewsContentType.TEXT,
        text: 'We are proud to announce that our school has been recognized as the Best Institution for the academic year 2024-2025. This award reflects our commitment to quality education and holistic development of students.'
      },
      category: 'Achievements',
      isActive: true,
      displayOrder: 1,
      publishDate: new Date('2024-01-15'),
      author: 'Principal Office',
      tags: ['award', 'achievement', 'excellence']
    },
    {
      id: 2,
      title: 'New Computer Lab Inaugurated',
      description: 'State-of-the-art computer lab with 50 latest systems inaugurated by the Chief Guest.',
      content: {
        type: NewsContentType.IMAGE,
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop'
      },
      category: 'Infrastructure',
      isActive: true,
      displayOrder: 2,
      publishDate: new Date('2024-01-10'),
      author: 'IT Department',
      tags: ['infrastructure', 'technology', 'computer lab']
    },
    {
      id: 3,
      title: 'Annual Academic Calendar 2024-25',
      description: 'Download the complete academic calendar with examination schedules and holidays.',
      content: {
        type: NewsContentType.PDF,
        pdfUrl: '/assets/sample-calendar.pdf',
        thumbnailUrl: '/assets/pdf-thumbnail.png',
        fileName: 'academic-calendar-2024-25.pdf',
        fileSize: 2048000
      },
      category: 'Academics',
      isActive: true,
      displayOrder: 3,
      publishDate: new Date('2024-01-05'),
      author: 'Academic Office',
      tags: ['calendar', 'schedule', 'exams']
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get all news from API
   */
  getAllNews(forceRefresh: boolean = false): Observable<DepartmentNews[]> {
    // First try to get from localStorage (user-created news)
    const storedNews = this.getFromLocalStorage();
    if (storedNews && storedNews.length > 0 && !forceRefresh) {
      console.log('Using news from localStorage');
      return of(storedNews);
    }

    // If no localStorage data or force refresh, try API
    return this.http.get<any>(this.NEWS_ENDPOINT).pipe(
      map(response => {
        // Handle different response formats
        let newsData: DepartmentNews[] = [];
        
        if (response && response.success && response.data) {
          // API returns {success: true, data: [...]}
          newsData = response.data;
          console.log('✅ Loaded news from API (success format):', newsData.length, 'items');
        } else if (Array.isArray(response)) {
          // API returns direct array
          newsData = response;
          console.log('✅ Loaded news from API (array format):', newsData.length, 'items');
        } else if (response && Array.isArray(response.data)) {
          // API returns {data: [...]}
          newsData = response.data;
          console.log('✅ Loaded news from API (data format):', newsData.length, 'items');
        }
        
        if (newsData && newsData.length > 0) {
          // Transform data if needed
          const transformedNews = newsData.map(item => this.transformNewsData(item));
          // Cache the data in localStorage for offline support
          this.saveToLocalStorage(transformedNews);
          return transformedNews;
        } else {
          console.log('API returned empty, using localStorage fallback');
          return this.getFromLocalStorage() || this.localNews;
        }
      }),
      catchError(error => {
        console.error('❌ Error fetching news from API:', error);
        console.log('🔄 Using localStorage fallback');
        return of(this.getFromLocalStorage() || this.localNews);
      })
    );
  }

  /**
   * Get active news only (for public display)
   */
  getActiveNews(): Observable<DepartmentNews[]> {
    return this.getAllNews().pipe(
      map(news => news.filter(item => item.isActive))
    );
  }

  /**
   * Force refresh news data (bypasses cache)
   */
  forceRefreshNews(): Observable<DepartmentNews[]> {
    return this.getAllNews(true);
  }

  /**
   * Get news by category
   */
  getNewsByCategory(category: string): Observable<DepartmentNews[]> {
    return this.getAllNews().pipe(
      map(news => news.filter(item => item.category === category && item.isActive))
    );
  }

  /**
   * Get news by ID
   */
  getNewsById(id: string): Observable<DepartmentNews | undefined> {
    return this.getAllNews().pipe(
      map(news => news.find(item => (item._id || item.id?.toString()) === id))
    );
  }

  /**
   * Transform news data from server response to frontend format
   */
  private transformNewsData(serverNews: any): DepartmentNews {
    return {
      id: serverNews._id || serverNews.id,
      title: serverNews.title,
      description: serverNews.description,
      content: serverNews.content || {
        type: NewsContentType.TEXT,
        text: serverNews.description
      },
      category: serverNews.category || 'Other',
      author: serverNews.author || 'Admin',
      tags: serverNews.tags || [],
      isActive: serverNews.isActive !== false,
      displayOrder: serverNews.displayOrder || 0,
      publishDate: serverNews.publishDate || serverNews.createdAt || new Date(),
      createdAt: serverNews.createdAt || new Date(),
      updatedAt: serverNews.updatedAt || new Date()
    };
  }

  /**
   * Handle file upload to Cloudinary
   */
  private handleFileUpload(formData: NewsFormData): Observable<any> {
    if (formData.contentType === NewsContentType.IMAGE && formData.imageFile) {
      return this.uploadFile(formData.imageFile, 'image');
    } else if (formData.contentType === NewsContentType.PDF && formData.pdfFile) {
      return this.uploadFile(formData.pdfFile, 'pdf');
    } else {
      // No file upload needed for text content
      return of(null);
    }
  }

  /**
   * Create new news with file upload support
   */
  createNews(formData: NewsFormData): Observable<DepartmentNews> {
    // Create FormData for file upload
    const form = new FormData();
    
    // Add basic fields
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('category', formData.category);
    form.append('author', formData.author);
    form.append('tags', JSON.stringify(formData.tags));
    form.append('contentType', formData.contentType);
    form.append('isActive', formData.isActive.toString());
    form.append('displayOrder', formData.displayOrder.toString());
    
    // Add content based on type
    if (formData.contentType === NewsContentType.TEXT && formData.textContent) {
      form.append('textContent', formData.textContent);
    }
    
    // Add file if provided
    if (formData.contentType === NewsContentType.IMAGE && formData.imageFile) {
      form.append('file', formData.imageFile);
    } else if (formData.contentType === NewsContentType.PDF && formData.pdfFile) {
      form.append('file', formData.pdfFile);
    }
    
    return this.http.post<any>(this.NEWS_ENDPOINT, form).pipe(
      map((response: any) => {
        // Handle different response formats from existing server
        if (response.success && response.data) {
          console.log('✅ News created successfully:', response.data.title);
          localStorage.removeItem('department_news');
          return this.transformNewsData(response.data);
        } else if (response._id || response.id) {
          console.log('✅ News created successfully:', response.title);
          localStorage.removeItem('department_news');
          return this.transformNewsData(response);
        } else {
          return response;
        }
      }),
      catchError((error) => {
        console.error('❌ Error creating news:', error);
        console.log('🔄 Creating news locally as fallback');
        
        // Create a local news item as fallback
        const newNews: DepartmentNews = {
          id: Date.now(),
          title: formData.title,
          description: formData.description,
          content: this.createContentFromFormData(formData),
          category: formData.category,
          isActive: formData.isActive,
          displayOrder: formData.displayOrder,
          publishDate: new Date(),
          author: formData.author,
          tags: formData.tags,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save to local storage
        const currentNews = this.getFromLocalStorage() || [];
        currentNews.unshift(newNews);
        this.saveToLocalStorage(currentNews);
        
        return of(newNews);
      })
    );
  }

  /**
   * Update existing news
   */
  updateNews(id: string, formData: NewsFormData): Observable<DepartmentNews> {
    const form = new FormData();
    
    // Add basic fields
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('category', formData.category);
    form.append('author', formData.author);
    form.append('tags', JSON.stringify(formData.tags));
    form.append('contentType', formData.contentType);
    form.append('isActive', formData.isActive.toString());
    form.append('displayOrder', formData.displayOrder.toString());
    
    // Add content based on type
    if (formData.contentType === NewsContentType.TEXT && formData.textContent) {
      form.append('textContent', formData.textContent);
    } else if (formData.contentType === NewsContentType.IMAGE && formData.imageFile) {
      form.append('imageFile', formData.imageFile);
    } else if (formData.contentType === NewsContentType.PDF && formData.pdfFile) {
      form.append('pdfFile', formData.pdfFile);
    }

    return this.http.put<DepartmentNews>(`${this.NEWS_ENDPOINT}/${id}`, form).pipe(
      catchError((error) => {
        console.log('Backend not available, using local fallback:', error);
        
        // Update local storage as fallback
        const currentNews = this.getFromLocalStorage() || [];
        const newsIndex = currentNews.findIndex(news => (news._id || news.id?.toString()) === id);
        
        if (newsIndex >= 0) {
          const updatedNews: DepartmentNews = {
            ...currentNews[newsIndex],
            title: formData.title,
            description: formData.description,
            content: this.createContentFromFormData(formData),
            category: formData.category,
            isActive: formData.isActive,
            displayOrder: formData.displayOrder,
            author: formData.author,
            tags: formData.tags,
            updatedAt: new Date()
          };
          
          currentNews[newsIndex] = updatedNews;
          this.saveToLocalStorage(currentNews);
          
          return of(updatedNews);
        }
        
        // If not found, return error
        return throwError(() => new Error('News item not found'));
      })
    );
  }

  /**
   * Delete a news item by ID
   */
  deleteNews(id: string): Observable<void> {
    return this.http.delete<void>(`${app_constants.baseUrl + app_constants.departmentNews.delete}/${id}`).pipe(
      catchError((error) => {
        console.log('Backend not available, using local fallback:', error);
        
        // Delete from local storage as fallback
        const currentNews = this.getFromLocalStorage() || [];
        const filteredNews = currentNews.filter(news => (news._id || news.id?.toString()) !== id);
        this.saveToLocalStorage(filteredNews);
        
        return of(void 0);
      })
    );
  }

  /**
   * Toggle news status (active/inactive)
   */
  toggleNewsStatus(id: string): Observable<DepartmentNews> {
    return this.http.patch<DepartmentNews>(`${app_constants.baseUrl + app_constants.departmentNews.toggle}/${id}`, {}).pipe(
      catchError((error) => {
        console.log('Backend not available, using local fallback:', error);
        
        // Toggle status in local storage as fallback
        const currentNews = this.getFromLocalStorage() || [];
        const newsIndex = currentNews.findIndex(news => (news._id || news.id?.toString()) === id);
        
        if (newsIndex >= 0) {
          const toggledNews = {
            ...currentNews[newsIndex],
            isActive: !currentNews[newsIndex].isActive,
            updatedAt: new Date()
          };
          
          currentNews[newsIndex] = toggledNews;
          this.saveToLocalStorage(currentNews);
          
          return of(toggledNews);
        }
        
        // If not found, return error
        return throwError(() => new Error('News item not found'));
      })
    );
  }

  /**
   * Create NewsContent object from form data
   */
  private createContentFromFormData(formData: NewsFormData): NewsContent {
    const content: NewsContent = {
      type: formData.contentType
    };

    switch (formData.contentType) {
      case NewsContentType.TEXT:
        content.text = formData.textContent || '';
        break;
      case NewsContentType.IMAGE:
        // For local fallback, use a placeholder image
        content.imageUrl = 'https://images.unsplash.com/photo-1554224155-6f6aab4b3c1a?w=800&h=600&fit=crop';
        content.thumbnailUrl = 'https://images.unsplash.com/photo-1554224155-6f6aab4b3c1a?w=400&h=300&fit=crop';
        break;
      case NewsContentType.PDF:
        // For local fallback, use placeholder PDF info
        content.pdfUrl = '/assets/sample-document.pdf';
        content.fileName = formData.pdfFile?.name || 'document.pdf';
        content.fileSize = formData.pdfFile?.size || 1024 * 1024; // 1MB default
        break;
    }

    return content;
  }

  /**
   * Upload file to Cloudinary
   */
  uploadFile(file: File, type: 'image' | 'pdf'): Observable<{ url: string; thumbnailUrl?: string; fileName: string; fileSize: number }> {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    
    return this.http.post<{ url: string; thumbnailUrl?: string; fileName: string; fileSize: number }>(this.UPLOAD_ENDPOINT, form).pipe(
      tap(response => {
        console.log(`✅ ${type.toUpperCase()} uploaded successfully:`, response.fileName);
      }),
      catchError(error => {
        console.error(`❌ Error uploading ${type}:`, error);
        console.log('🔄 Using placeholder as fallback');
        
        // Return placeholder data as fallback
        if (type === 'image') {
          return of({
            url: 'https://images.unsplash.com/photo-1554224155-6f6aab4b3c1a?w=800&h=600&fit=crop',
            thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6f6aab4b3c1a?w=400&h=300&fit=crop',
            fileName: file.name,
            fileSize: file.size
          });
        } else {
          return of({
            url: '/assets/sample-document.pdf',
            fileName: file.name,
            fileSize: file.size
          });
        }
      })
    );
  }

  /**
   * Get news categories
   */
  getCategories(): Observable<string[]> {
    return this.http.get<any>(this.NEWS_ENDPOINT + '/categories/list').pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching categories:', error);
        // Return hardcoded categories as fallback
        return of([
          'Achievements',
          'Academics', 
          'Events',
          'Announcements',
          'Other'
        ]);
      })
    );
  }

  /**
   * Get local fallback news (for offline usage)
   */
  getLocalNews(): DepartmentNews[] {
    return this.localNews;
  }

  /**
   * Save to localStorage for offline support
   */
  saveToLocalStorage(news: DepartmentNews[]): void {
    try {
      localStorage.setItem('department_news', JSON.stringify(news));
    } catch (error) {
      console.error('Error saving news to localStorage:', error);
    }
  }

  /**
   * Get from localStorage
   */
  getFromLocalStorage(): DepartmentNews[] | null {
    try {
      const stored = localStorage.getItem('department_news');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting news from localStorage:', error);
      return null;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get content icon based on type
   */
  getContentIcon(contentType: NewsContentType): string {
    switch (contentType) {
      case NewsContentType.TEXT:
        return 'fa-file-text';
      case NewsContentType.IMAGE:
        return 'fa-image';
      case NewsContentType.PDF:
        return 'fa-file-pdf';
      default:
        return 'fa-file';
    }
  }

  /**
   * Get content type label
   */
  getContentTypeLabel(contentType: NewsContentType): string {
    switch (contentType) {
      case NewsContentType.TEXT:
        return 'Text Article';
      case NewsContentType.IMAGE:
        return 'Image News';
      case NewsContentType.PDF:
        return 'PDF Document';
      default:
        return 'Unknown';
    }
  }
}
