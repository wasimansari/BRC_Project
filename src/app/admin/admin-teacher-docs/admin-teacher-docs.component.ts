import { Component, OnInit } from '@angular/core';
import { AdminTeacherDocsService, TeacherDocument } from '../../services/admin-teacher-docs.service';
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
  
  // Filtering
  statusFilter: string = '';
  searchQuery: string = '';

  // Modal/Action state
  selectedDoc: TeacherDocument | null = null;
  actionStatus: string = 'Pending';
  adminRemarks: string = '';
  isSubmitting: boolean = false;

  constructor(private docsService: AdminTeacherDocsService) {}

  ngOnInit(): void {
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
           doc.title?.toLowerCase().includes(query))
        : true;
      return matchStatus && matchSearch;
    });
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
          alert('Document status updated and notification sent.');
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

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'Approved': return 'badge bg-success';
      case 'Rejected': return 'badge bg-danger';
      case 'Pending': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDocumentUrl(id: string): string {
    return getFullUrl(`/teacher-docs/${id}/document`);
  }
}
