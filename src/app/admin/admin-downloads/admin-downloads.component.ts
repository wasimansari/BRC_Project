import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DownloadService, DownloadFile, DownloadCategory } from '../../services/download.service';

@Component({
  selector: 'app-admin-downloads',
  templateUrl: './admin-downloads.component.html',
  styleUrls: ['./admin-downloads.component.css']
})
export class AdminDownloadsComponent implements OnInit {
  downloadForm!: FormGroup;
  downloads: DownloadFile[] = [];
  filteredDownloads: DownloadFile[] = [];
  selectedCategory: string = 'all';
  editingDownload: DownloadFile | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading: boolean = false;
  showModal: boolean = false;
  confirmDeleteId: string | null = null;
  fileSizeError: string = '';
  
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  // Use default categories
  categories: DownloadCategory[] = this.downloadService.getDefaultCategories();
  
  // Organize downloads by category
  downloadsByCategory: { [key: string]: DownloadFile[] } = {};

  constructor(
    private fb: FormBuilder,
    private downloadService: DownloadService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDownloads();
  }

  initForm(): void {
    this.downloadForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      isActive: [true]
    });
  }

  loadDownloads(): void {
    this.loading = true;
    this.downloadService.getAllDownloads().subscribe({
      next: (data) => {
        this.downloads = data;
        this.organizeDownloadsByCategory();
        this.filterDownloads();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading downloads:', err);
        this.loading = false;
      }
    });
  }

  organizeDownloadsByCategory(): void {
    this.downloadsByCategory = {};
    
    // Initialize with all categories
    this.categories.forEach(cat => {
      this.downloadsByCategory[cat.value] = [];
    });

    // Group downloads by category
    this.downloads.forEach(download => {
      if (!this.downloadsByCategory[download.category]) {
        this.downloadsByCategory[download.category] = [];
      }
      this.downloadsByCategory[download.category].push(download);
    });
  }

  filterDownloads(): void {
    if (this.selectedCategory === 'all') {
      this.filteredDownloads = [...this.downloads];
    } else {
      this.filteredDownloads = this.downloads.filter(d => d.category === this.selectedCategory);
    }
  }

  onTabChange(category: string): void {
    this.selectedCategory = category;
    this.filterDownloads();
  }

  getCategoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label || value;
  }

  getCategoryIcon(value: string): string {
    return this.categories.find(c => c.value === value)?.icon || 'fas fa-file';
  }

  getCategoryCount(category: string): number {
    return this.downloadsByCategory[category]?.length || 0;
  }

  getAllCount(): number {
    return this.downloads.length;
  }

  // File handling
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileSizeError = '';
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.fileSizeError = `File size exceeds 5MB limit. Current size: ${this.downloadService.formatFileSize(file.size)}`;
        this.selectedFile = null;
        input.value = '';
        return;
      }

      // Check file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        this.fileSizeError = 'Only PDF and image files (JPG, PNG, JPEG) are allowed';
        this.selectedFile = null;
        input.value = '';
        return;
      }

      this.selectedFile = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        // For PDF, show icon preview
        this.previewUrl = null;
      }
    }
  }

  // Modal handling
  openAddModal(): void {
    this.editingDownload = null;
    this.downloadForm.reset({ category: this.selectedCategory === 'all' ? '' : this.selectedCategory, title: '', description: '', isActive: true });
    this.selectedFile = null;
    this.previewUrl = null;
    this.fileSizeError = '';
    this.showModal = true;
  }

  openEditModal(download: DownloadFile): void {
    this.editingDownload = download;
    this.downloadForm.patchValue({
      category: download.category,
      title: download.title,
      description: download.description,
      isActive: download.isActive
    });
    
    // Show preview based on file type
    if (download.fileType === 'image') {
      this.previewUrl = download.fileUrl;
    } else {
      this.previewUrl = null;
    }
    this.selectedFile = null;
    this.fileSizeError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingDownload = null;
    this.selectedFile = null;
    this.previewUrl = null;
    this.fileSizeError = '';
  }

  onSubmit(): void {
    if (this.downloadForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('category', this.downloadForm.get('category')?.value);
    formData.append('title', this.downloadForm.get('title')?.value);
    formData.append('description', this.downloadForm.get('description')?.value);
    formData.append('isActive', this.downloadForm.get('isActive')?.value);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.editingDownload) {
      if (!this.selectedFile) {
        alert('Please select a file to upload');
        return;
      }
      this.downloadService.updateDownload(this.editingDownload._id!, formData).subscribe({
        next: () => {
          this.loadDownloads();
          this.closeModal();
          alert('File updated successfully!');
        },
        error: (err) => {
          console.error('Error updating file:', err);
          alert(err.error?.message || 'Failed to update file');
        }
      });
    } else {
      if (!this.selectedFile) {
        alert('Please select a file');
        return;
      }
      this.downloadService.addDownload(formData).subscribe({
        next: () => {
          this.loadDownloads();
          this.closeModal();
          alert('File added successfully!');
        },
        error: (err) => {
          console.error('Error adding file:', err);
          alert(err.error?.message || 'Failed to add file');
        }
      });
    }
  }

  confirmDelete(id: string): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  deleteDownload(): void {
    if (!this.confirmDeleteId) return;

    this.downloadService.deleteDownload(this.confirmDeleteId).subscribe({
      next: () => {
        this.loadDownloads();
        this.confirmDeleteId = null;
        alert('File deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting file:', err);
        alert('Failed to delete file');
      }
    });
  }

  getFileIcon(fileType: string): string {
    return fileType === 'pdf' ? 'fas fa-file-pdf' : 'fas fa-file-image';
  }

  getFileColor(fileType: string): string {
    return fileType === 'pdf' ? '#e74c3c' : '#3498db';
  }

  getFormattedSize(size: number): string {
    return this.downloadService.formatFileSize(size);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
