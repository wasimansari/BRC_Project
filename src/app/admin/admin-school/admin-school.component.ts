import { Component, OnInit } from '@angular/core';
import { SchoolService, School, SchoolStats, ExcelUploadResponse } from '../../services/school.service';
import { app_constants } from '../../../constant';

@Component({
  selector: 'app-admin-school',
  templateUrl: './admin-school.component.html',
  styleUrls: ['./admin-school.component.css']
})
export class AdminSchoolComponent implements OnInit {
  schools: School[] = [];
  filteredSchools: School[] = [];
  loading = true;
  
  // Stats
  stats: SchoolStats = {
    totalSchools: 0,
    totalDistricts: 0,
    totalBlocks: 0,
    schoolsWithCrc: 0
  };

  // Form data
  schoolFormData: Partial<School> = this.getEmptyForm();
  editingSchool: School | null = null;

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

  constructor(private schoolService: SchoolService) {}

  ngOnInit(): void {
    this.loadSchools();
    this.loadStats();
    this.loadDistrictsAndBlocks();
  }

  getEmptyForm(): Partial<School> {
    return {
      district: '',
      block: '',
      udiseCode: '',
      schoolName: '',
      hmHtName: '',
      mobileNo: '',
      crc: '',
      crcName: '',
      isActive: true
    };
  }

  loadSchools(): void {
    this.loading = true;
    this.schoolService.getAllSchools().subscribe({
      next: (data) => {
        this.schools = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading schools:', err);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.schoolService.getSchoolStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadDistrictsAndBlocks(): void {
    // Load from constant as fallback, and filter from loaded schools
    this.districts = app_constants.upDistricts;
    this.blocks = app_constants.upBlocks;
  }

  applyFilters(): void {
    let filtered = [...this.schools];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.schoolName?.toLowerCase().includes(term) ||
        s.udiseCode?.toLowerCase().includes(term) ||
        s.district?.toLowerCase().includes(term) ||
        s.block?.toLowerCase().includes(term)
      );
    }

    if (this.selectedDistrict) {
      filtered = filtered.filter(s => s.district === this.selectedDistrict);
    }

    if (this.selectedBlock) {
      filtered = filtered.filter(s => s.block === this.selectedBlock);
    }

    // Update unique districts and blocks from data
    this.districts = [...new Set(this.schools.map(s => s.district).filter(Boolean))];
    this.blocks = [...new Set(this.schools.map(s => s.block).filter(Boolean))];

    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredSchools = filtered.slice(start, start + this.pageSize);
    console.log('school list',this.filteredSchools)
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
    this.schoolService.uploadExcel(this.selectedFile).subscribe({
      next: (result) => {
        this.isUploading = false;
        this.uploadResult = result;
        this.selectedFile = null;
        this.loadSchools();
        this.loadStats();
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadResult = {
          message: 'Error uploading file',
          totalRows: 0,
          inserted: 0,
          updated: 0,
          errors: [err.message || 'Unknown error']
        };
      }
    });
  }

  // CRUD operations
  saveSchool(): void {
    if (this.editingSchool) {
      this.schoolService.updateSchool(this.editingSchool._id || '', this.schoolFormData).subscribe({
        next: () => {
          this.cancelEdit();
          this.loadSchools();
          this.loadStats();
        },
        error: (err) => console.error('Error updating school:', err)
      });
    } else {
      this.schoolService.addSchool(this.schoolFormData).subscribe({
        next: () => {
          this.schoolFormData = this.getEmptyForm();
          this.loadSchools();
          this.loadStats();
        },
        error: (err) => console.error('Error adding school:', err)
      });
    }
  }

  editSchool(school: School): void {
    this.editingSchool = school;
    this.schoolFormData = { ...school };
  }

  cancelEdit(): void {
    this.editingSchool = null;
    this.schoolFormData = this.getEmptyForm();
  }

  deleteSchool(id: string): void {
    if (confirm('Are you sure you want to delete this school?')) {
      this.schoolService.deleteSchool(id).subscribe({
        next: () => {
          this.loadSchools();
          this.loadStats();
        },
        error: (err) => console.error('Error deleting school:', err)
      });
    }
  }

  exportToExcel(): void {
    this.schoolService.exportToExcel();
  }
}