import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherAuthService, TeacherDocument } from '../../services/teacher-auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {
  teacherData: any = null;
  documents: TeacherDocument[] = [];
  
  // UI State
  activeTab = 'upload'; // 'upload', 'my-docs', 'profile'
  isLoading = false;
  isUploading = false;
  toastMessage = '';
  toastType = 'success'; // 'success' or 'error'

  // Upload Form
  uploadTitle = '';
  uploadType = 'Letter';
  uploadDesc = '';
  selectedFile: File | null = null;
  
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private authService: TeacherAuthService, private router: Router) {}

  ngOnInit() {
    this.teacherData = this.authService.getTeacherData();
    if (!this.teacherData) {
      this.logout();
    }
    this.loadDocuments();
  }

  // ─── TABS & UI ──────────────────────────────────────────────
  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'my-docs') {
      this.loadDocuments();
    }
  }

  showToast(msg: string, type: string = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 4000);
  }

  // ─── UPLOAD DOCUMENT ────────────────────────────────────────
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('File size must be less than 5MB', 'error');
        this.fileInput.nativeElement.value = '';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    }
  }

  onUpload() {
    if (!this.uploadTitle || !this.selectedFile) {
      this.showToast('Title and file are required.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.uploadTitle);
    formData.append('docType', this.uploadType);
    formData.append('description', this.uploadDesc);
    formData.append('file', this.selectedFile);

    this.isUploading = true;
    this.authService.uploadDocument(formData).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.showToast('Document uploaded successfully!');
        this.resetUploadForm();
        this.loadDocuments();
      },
      error: (err) => {
        this.isUploading = false;
        this.showToast(err.error?.message || 'Upload failed.', 'error');
      }
    });
  }

  resetUploadForm() {
    this.uploadTitle = '';
    this.uploadType = 'Letter';
    this.uploadDesc = '';
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // ─── MY DOCUMENTS ───────────────────────────────────────────
  loadDocuments() {
    this.isLoading = true;
    this.authService.getMyDocuments().subscribe({
      next: (res) => {
        this.documents = res.documents;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load documents', err);
      }
    });
  }

  deleteDocument(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    this.authService.deleteDocument(id).subscribe({
      next: () => {
        this.showToast('Document deleted successfully');
        this.documents = this.documents.filter(d => d._id !== id);
      },
      error: (err) => {
        this.showToast('Failed to delete document', 'error');
      }
    });
  }

  // ─── LOGOUT ─────────────────────────────────────────────────
  logout() {
    this.authService.logout();
    this.router.navigate(['/teacher/login']);
  }
}
