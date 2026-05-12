import { Component, OnInit } from '@angular/core';
import { EnhancedNewsService, DepartmentNews, NewsFormData, NewsContentType } from '../../services/enhanced-news.service';

@Component({
  selector: 'app-admin-news',
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.css']
})
export class AdminNewsComponent implements OnInit {
  allNews: DepartmentNews[] = [];
  filteredNews: DepartmentNews[] = [];
  categories: string[] = [
    'Achievements',
    'Academics', 
    'Events',
    'Announcements',
    'Other'
  ];
  loading: boolean = true;
  
  // Form properties
  isEditMode: boolean = false;
  editingNewsId: string | null = null;
  
  formData: NewsFormData = {
    title: '',
    description: '',
    category: '',
    author: '',
    tags: [],
    contentType: NewsContentType.TEXT,
    textContent: '',
    isActive: true,
    displayOrder: 0
  };
  
  // File properties
  selectedImageFile: File | null = null;
  selectedPdfFile: File | null = null;
  imagePreview: string | null = null;
  pdfPreview: string | null = null;
  
  // Validation
  imageError: string = '';
  pdfError: string = '';
  formError: string = '';
  
  // Constants for file validation
  readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
  readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  readonly ALLOWED_PDF_TYPES = ['application/pdf'];
  
  // UI state
  isSubmitting: boolean = false;
  showPreviewModal: boolean = false;
  previewNews: DepartmentNews | null = null;
  
  // Filter state
  selectedCategory: string = 'all';
  showInactiveOnly: boolean = false;
  
  NewsContentType = NewsContentType;

  constructor(private newsService: EnhancedNewsService) {}

  ngOnInit() {
    this.loadNews();
    this.loadCategories();
  }

  loadNews() {
    this.loading = true;
    // Force refresh to get latest data from API
    this.newsService.getAllNews(true).subscribe({
      next: (news) => {
        console.log('📰 Loaded news in admin:', news.length, 'items');
        this.allNews = news.sort((a, b) => b.displayOrder - a.displayOrder);
        this.filteredNews = [...this.allNews];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading news:', err);
        const storedNews = this.newsService.getFromLocalStorage();
        if (storedNews) {
          this.allNews = storedNews.sort((a, b) => b.displayOrder - a.displayOrder);
          this.filteredNews = [...this.allNews];
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
        // Use hardcoded categories as fallback
        this.categories = [
          'Achievements',
          'Academics', 
          'Events',
          'Announcements',
          'Other'
        ];
      }
    });
  }

  // Form Methods
  resetForm() {
    this.formData = {
      title: '',
      description: '',
      category: '',
      author: '',
      tags: [],
      contentType: NewsContentType.TEXT,
      textContent: '',
      isActive: true,
      displayOrder: 0
    };
    
    this.selectedImageFile = null;
    this.selectedPdfFile = null;
    this.imagePreview = null;
    this.pdfPreview = null;
    this.imageError = '';
    this.pdfError = '';
    this.formError = '';
    this.isEditMode = false;
    this.editingNewsId = null;
  }

  editNews(news: DepartmentNews) {
    this.isEditMode = true;
    this.editingNewsId = news._id || news.id?.toString() || null;
    
    this.formData = {
      title: news.title,
      description: news.description,
      category: news.category,
      author: news.author,
      tags: [...news.tags],
      contentType: news.content.type,
      textContent: news.content.text || '',
      isActive: news.isActive,
      displayOrder: news.displayOrder
    };
    
    // Set preview for existing content
    if (news.content.type === NewsContentType.IMAGE && news.content.imageUrl) {
      this.imagePreview = news.content.imageUrl;
    } else if (news.content.type === NewsContentType.PDF && news.content.pdfUrl) {
      this.pdfPreview = news.content.pdfUrl;
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  validateForm(): boolean {
    this.formError = '';
    
    if (!this.formData.title.trim()) {
      this.formError = 'Title is required';
      return false;
    }
    
    if (!this.formData.description.trim()) {
      this.formError = 'Description is required';
      return false;
    }
    
    if (!this.formData.category.trim()) {
      this.formError = 'Category is required';
      return false;
    }
    
    if (!this.formData.author.trim()) {
      this.formError = 'Author is required';
      return false;
    }
    
    if (this.formData.contentType === NewsContentType.TEXT && !this.formData.textContent?.trim()) {
      this.formError = 'Text content is required for text articles';
      return false;
    }
    
    if (this.formData.contentType === NewsContentType.IMAGE && !this.selectedImageFile && !this.imagePreview) {
      this.formError = 'Image is required for image news';
      return false;
    }
    
    if (this.formData.contentType === NewsContentType.PDF && !this.selectedPdfFile && !this.pdfPreview) {
      this.formError = 'PDF is required for PDF news';
      return false;
    }
    
    if (this.imageError || this.pdfError) {
      this.formError = 'Please fix file validation errors';
      return false;
    }
    
    return true;
  }

  submitForm() {
    if (!this.validateForm()) {
      return;
    }
    
    this.isSubmitting = true;
    
    const submitData: NewsFormData = {
      ...this.formData,
      imageFile: this.selectedImageFile || undefined,
      pdfFile: this.selectedPdfFile || undefined
    };
    
    if (this.isEditMode && this.editingNewsId) {
      this.updateNews(this.editingNewsId, submitData);
    } else {
      this.createNews(submitData);
    }
  }

  createNews(data: NewsFormData) {
    this.newsService.createNews(data).subscribe({
      next: (response) => {
        this.allNews.unshift(response);
        this.filteredNews = [...this.allNews];
        this.newsService.saveToLocalStorage(this.allNews);
        this.resetForm();
        this.isSubmitting = false;
        alert('News created successfully!');
      },
      error: (err) => {
        console.error('Error creating news:', err);
        this.formError = 'Error creating news. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  updateNews(id: string, data: NewsFormData) {
    this.newsService.updateNews(id, data).subscribe({
      next: (response) => {
        const index = this.allNews.findIndex(news => (news._id || news.id?.toString()) === id);
        if (index >= 0) {
          this.allNews[index] = response;
          this.filteredNews = [...this.allNews];
        }
        this.newsService.saveToLocalStorage(this.allNews);
        this.resetForm();
        this.isSubmitting = false;
        alert('News updated successfully!');
      },
      error: (err) => {
        console.error('Error updating news:', err);
        this.formError = 'Error updating news. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  deleteNews(id: string) {
    if (!confirm('Are you sure you want to delete this news? This action cannot be undone.')) {
      return;
    }
    
    this.newsService.deleteNews(id).subscribe({
      next: () => {
        this.allNews = this.allNews.filter(news => (news._id || news.id?.toString()) !== id);
        this.filteredNews = [...this.allNews];
        this.newsService.saveToLocalStorage(this.allNews);
        alert('News deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting news:', err);
        alert('Error deleting news. Please try again.');
      }
    });
  }

  toggleNewsStatus(news: DepartmentNews) {
    const id = news._id || news.id?.toString();
    if (!id) return;
    
    this.newsService.toggleNewsStatus(id).subscribe({
      next: (response) => {
        const index = this.allNews.findIndex(n => (n._id || n.id?.toString()) === id);
        if (index >= 0) {
          this.allNews[index] = response;
          this.filteredNews = [...this.allNews];
        }
        this.newsService.saveToLocalStorage(this.allNews);
      },
      error: (err) => {
        console.error('Error toggling news status:', err);
        alert('Error updating news status. Please try again.');
      }
    });
  }

  // File Handling Methods
  onImageSelected(event: any) {
    const file = event.target.files[0];
    this.imageError = '';
    
    if (file) {
      if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        this.imageError = 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
        event.target.value = '';
        return;
      }
      
      if (file.size > this.MAX_IMAGE_SIZE) {
        this.imageError = 'Image size should be less than 5MB';
        event.target.value = '';
        return;
      }
      
      this.selectedImageFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onPdfSelected(event: any) {
    const file = event.target.files[0];
    this.pdfError = '';
    
    if (file) {
      if (!this.ALLOWED_PDF_TYPES.includes(file.type)) {
        this.pdfError = 'Please select a valid PDF file';
        event.target.value = '';
        return;
      }
      
      if (file.size > this.MAX_PDF_SIZE) {
        this.pdfError = 'PDF size should be less than 10MB';
        event.target.value = '';
        return;
      }
      
      this.selectedPdfFile = file;
      this.pdfPreview = file.name;
    }
  }

  clearImage() {
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.imageError = '';
  }

  clearPdf() {
    this.selectedPdfFile = null;
    this.pdfPreview = null;
    this.pdfError = '';
  }

  // Tag Management
  addTag(event: any) {
    const tag = event.target.value.trim();
    if (tag && !this.formData.tags.includes(tag)) {
      this.formData.tags.push(tag);
      event.target.value = '';
    }
  }

  removeTag(index: number) {
    this.formData.tags.splice(index, 1);
  }

  // Filter Methods
  filterNews() {
    let filtered = [...this.allNews];
    
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === this.selectedCategory);
    }
    
    if (this.showInactiveOnly) {
      filtered = filtered.filter(news => !news.isActive);
    }
    
    this.filteredNews = filtered;
  }

  onCategoryFilterChange(category: string) {
    this.selectedCategory = category;
    this.filterNews();
  }

  toggleInactiveFilter() {
    this.showInactiveOnly = !this.showInactiveOnly;
    this.filterNews();
  }

  // Preview Methods
  openPreviewModal(news: DepartmentNews) {
    this.previewNews = news;
    this.showPreviewModal = true;
    document.body.style.overflow = 'hidden';
  }

  closePreview() {
    this.showPreviewModal = false;
    this.previewNews = null;
    document.body.style.overflow = 'auto';
  }

  // Utility Methods
  getContentIcon(contentType: NewsContentType): string {
    return this.newsService.getContentIcon(contentType);
  }

  getContentTypeLabel(contentType: NewsContentType): string {
    return this.newsService.getContentTypeLabel(contentType);
  }

  formatFileSize(bytes: number): string {
    return this.newsService.formatFileSize(bytes);
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

  openPdfInNewTab(pdfUrl: string) {
    window.open(pdfUrl, '_blank');
  }

  // Content Type Change Handler
  onContentTypeChange() {
    // Clear file selections when changing content type
    if (this.formData.contentType !== NewsContentType.IMAGE) {
      this.clearImage();
    }
    if (this.formData.contentType !== NewsContentType.PDF) {
      this.clearPdf();
    }
    if (this.formData.contentType !== NewsContentType.TEXT) {
      this.formData.textContent = '';
    }
  }
}
