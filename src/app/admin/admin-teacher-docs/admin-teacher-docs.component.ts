import { Component, OnInit } from '@angular/core';
import { AdminTeacherDocsService, TeacherDocument } from '../../services/admin-teacher-docs.service';
import { AuthService, AdminUser } from '../../services/auth.service';
import { getFullUrl } from '../../core/constants/api-endpoints';

@Component({
  selector: 'app-admin-teacher-docs',
  templateUrl: './admin-teacher-docs.component.html',
  styleUrls: ['./admin-teacher-docs.component.css']
})
export class AdminTeacherDocsComponent implements OnInit {
  documents: TeacherDocument[] = [];
  filteredDocuments: TeacherDocument[] = [];
  stats: any = { total: 0, pending: 0, approved: 0, rejected: 0 };
  
  // Current admin
  currentAdmin: AdminUser | null = null;

  // Filtering
  statusFilter: string = '';
  searchQuery: string = '';
  dateFilter: string = '';

  // Modal/Action state
  selectedDoc: TeacherDocument | null = null;
  actionStatus: string = 'Pending';
  adminRemarks: string = '';
  isSubmitting: boolean = false;

  // Zoom signature modal
  previewSignatureUrl: string | null = null;
  previewSignerName: string = '';
  previewSignerRole: string = '';

  constructor(
    private docsService: AdminTeacherDocsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentAdmin = this.authService.getCurrentAdmin();
    this.authService.getMyProfile().subscribe({
      next: (admin) => this.currentAdmin = admin,
      error: () => {}
    });
    this.loadDocuments();
    this.loadStats();
  }

  loadDocuments() {
    this.docsService.getAllDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        this.applyFilters();
      },
      error: (err) => console.error('Error fetching documents:', err)
    });
  }

  loadStats() {
    this.docsService.getStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Error fetching stats:', err)
    });
  }

  applyFilters() {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchStatus = this.statusFilter ? doc.status === this.statusFilter : true;
      const query = this.searchQuery.toLowerCase();
      const matchSearch = query 
        ? (doc.teacherName?.toLowerCase().includes(query) || 
           doc.udiseCode?.toLowerCase().includes(query) ||
           doc.title?.toLowerCase().includes(query) ||
           doc.actionBy?.adminName?.toLowerCase().includes(query))
        : true;
      const matchDate = this.dateFilter
        ? (doc.uploadedAt && new Date(doc.uploadedAt).toISOString().split('T')[0] === this.dateFilter)
        : true;
      return matchStatus && matchSearch && matchDate;
    });
  }

  clearDateFilter() {
    this.dateFilter = '';
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openActionModal(doc: TeacherDocument) {
    this.selectedDoc = doc;
    this.actionStatus = doc.status;
    this.adminRemarks = doc.adminRemarks || '';
  }

  closeActionModal() {
    this.selectedDoc = null;
    this.actionStatus = 'Pending';
    this.adminRemarks = '';
  }

  submitAction() {
    if (!this.selectedDoc) return;

    this.isSubmitting = true;
    this.docsService.updateDocumentStatus(this.selectedDoc._id, this.actionStatus, this.adminRemarks)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          alert('Document status updated with official digital signature and notification sent.');
          this.loadDocuments();
          this.loadStats();
          this.closeActionModal();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error updating status:', err);
          alert('Failed to update status.');
        }
      });
  }

  zoomSignature(url?: string, name?: string, role?: string) {
    if (!url) return;
    this.previewSignatureUrl = url;
    this.previewSignerName = name || 'Authorized Official';
    this.previewSignerRole = role || 'Administrator';
  }

  closeZoomSignature() {
    this.previewSignatureUrl = null;
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'Approved': return 'badge bg-success';
      case 'Rejected': return 'badge bg-danger';
      case 'Pending': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDocumentUrl(id: string): string {
    return getFullUrl(`/teacher-docs/${id}/document`);
  }
}
