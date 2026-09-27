import { Component, OnInit } from '@angular/core';
import { TeacherDirectoryService, TeacherDirectory, TeacherStats, ExcelUploadResponse } from '../../services/teacher-directory.service';
import { app_constants } from '../../../constant';

@Component({
  selector: 'app-admin-teacher-directory',
  templateUrl: './admin-teacher-directory.component.html',
  styleUrls: ['./admin-teacher-directory.component.css']
})
export class AdminTeacherDirectoryComponent implements OnInit {
  teachers: TeacherDirectory[] = [];
  filteredTeachers: TeacherDirectory[] = [];
  loading = true;
  
  // Stats
  stats: TeacherStats = {
    totalTeachers: 0,
    totalDistricts: 0,
    totalBlocks: 0,
    totalSubjects: 0
  };

  // Form data
  teacherFormData: Partial<TeacherDirectory> = this.getEmptyForm();
  editingTeacher: TeacherDirectory | null = null;

  // File upload
  selectedFile: File | null = null;
  isUploading = false;
  isDragOver = false;
  uploadResult: ExcelUploadResponse | null = null;

  // Filters
  searchTerm = '';
  selectedDistrict = '';
  selectedBlock = '';
  districts: string[] = [];
  blocks: string[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  constructor(private teacherService: TeacherDirectoryService) {}

  ngOnInit(): void {
    this.loadTeachers();
    this.loadStats();
    this.loadDistrictsAndBlocks();
  }

  getEmptyForm(): Partial<TeacherDirectory> {
    return {
      teacherId: '',
      teacherName: '',
      class: '',
      subject: '',
      highestQualification: '',
      schoolName: '',
      udise: '',
      contactNo: '',
      postingBlock: '',
      postingDistrict: '',
      homeDistrict: '',
      isCrcSchool: '',
      crcSchool: '',
      isActive: true
    };
  }

  loadTeachers(): void {
    this.loading = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading teachers:', err);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.teacherService.getTeacherStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadDistrictsAndBlocks(): void {
    this.districts = app_constants.upDistricts;
    this.blocks = app_constants.upBlocks;
  }

  applyFilters(): void {
    let filtered = [...this.teachers];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.teacherName?.toLowerCase().includes(term) ||
        t.teacherId?.toLowerCase().includes(term) ||
        t.postingDistrict?.toLowerCase().includes(term) ||
        t.postingBlock?.toLowerCase().includes(term) ||
        t.schoolName?.toLowerCase().includes(term)
      );
    }

    if (this.selectedDistrict) {
      filtered = filtered.filter(t => t.postingDistrict === this.selectedDistrict);
    }

    if (this.selectedBlock) {
      filtered = filtered.filter(t => t.postingBlock === this.selectedBlock);
    }

    // Update unique districts and blocks from data
    this.districts = [...new Set(this.teachers.map(t => t.postingDistrict).filter(Boolean))];
    this.blocks = [...new Set(this.teachers.map(t => t.postingBlock).filter(Boolean))];

    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredTeachers = filtered.slice(start, start + this.pageSize);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDistrict = '';
    this.selectedBlock = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  // File handling
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.uploadResult = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadResult = null;
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.uploadResult = null;
  }

  uploadExcel(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.teacherService.uploadExcel(this.selectedFile).subscribe({
      next: (result) => {
        this.isUploading = false;
        this.uploadResult = result;
        this.selectedFile = null;
        this.loadTeachers();
        this.loadStats();
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadResult = {
          message: 'Error uploading file',
          totalRows: 0,
          inserted: 0,
          updated: 0,
          errors: [err.error?.message || err.message || 'Unknown error']
        };
      }
    });
  }

  // CRUD operations
  saveTeacher(): void {
    if (this.editingTeacher) {
      this.teacherService.updateTeacher(this.editingTeacher._id || '', this.teacherFormData).subscribe({
        next: () => {
          this.cancelEdit();
          this.loadTeachers();
          this.loadStats();
        },
        error: (err) => console.error('Error updating teacher:', err)
      });
    } else {
      this.teacherService.addTeacher(this.teacherFormData).subscribe({
        next: () => {
          this.teacherFormData = this.getEmptyForm();
          this.loadTeachers();
          this.loadStats();
        },
        error: (err) => console.error('Error adding teacher:', err)
      });
    }
  }

  editTeacher(teacher: TeacherDirectory): void {
    this.editingTeacher = teacher;
    this.teacherFormData = { ...teacher };
  }

  cancelEdit(): void {
    this.editingTeacher = null;
    this.teacherFormData = this.getEmptyForm();
  }

  deleteTeacher(id: string): void {
    if (confirm('Are you sure you want to delete this teacher?')) {
      this.teacherService.deleteTeacher(id).subscribe({
        next: () => {
          this.loadTeachers();
          this.loadStats();
        },
        error: (err) => console.error('Error deleting teacher:', err)
      });
    }
  }

  exportToExcel(): void {
    this.teacherService.exportToExcel();
  }
}