import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { app_constants } from '../../../constant';

@Component({
  selector: 'app-admin-trainings',
  templateUrl: './admin-trainings.component.html',
  styleUrls: ['./admin-trainings.component.css']
})
export class AdminTrainingsComponent implements OnInit {
  trainings: any[] = [];
  isLoading = false;
  isSaving = false;
  apiUrl = app_constants.baseUrl + '/trainings';
  
  showForm = false;
  currentTraining: any = { title: '', description: '', category: '', link: '', fromDate: '', toDate: '', isActive: true, displayOrder: 0 };
  isEditing = false;
  
  thumbnailFile: File | null = null;
  documentFile: File | null = null;
  thumbnailPreview: string | null = null;
  thumbnailError = '';
  documentError = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTrainings();
  }

  fetchTrainings() {
    this.isLoading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.trainings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  openAddForm() {
    this.isEditing = false;
    this.currentTraining = { title: '', description: '', category: '', link: '', fromDate: '', toDate: '', isActive: true, displayOrder: 0 };
    this.thumbnailFile = null;
    this.documentFile = null;
    this.thumbnailPreview = null;
    this.thumbnailError = '';
    this.documentError = '';
    this.showForm = true;
  }

  openEditForm(training: any) {
    this.isEditing = true;
    this.currentTraining = { ...training };
    this.thumbnailFile = null;
    this.documentFile = null;
    this.thumbnailPreview = training.thumbnailUrl || null;
    this.thumbnailError = '';
    this.documentError = '';
    this.showForm = true;
  }

  onThumbnailSelected(event: any) {
    this.thumbnailFile = event.target.files[0];
    this.thumbnailError = '';
    if (this.thumbnailFile) {
      if (this.thumbnailFile.size > 5 * 1024 * 1024) {
        this.thumbnailError = 'Thumbnail size must be less than 5MB.';
        this.thumbnailFile = null;
        event.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const widthTolerance = 100;
          const heightTolerance = 100;

          if (Math.abs(width - 800) > widthTolerance || Math.abs(height - 500) > heightTolerance) {
            this.thumbnailError = `Image dimensions should be around 800x500px. Current: ${width}x${height}px`;
            this.thumbnailFile = null;
            event.target.value = '';
          } else {
            this.thumbnailPreview = e.target.result;
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(this.thumbnailFile);
    }
  }

  onDocumentSelected(event: any) {
    this.documentFile = event.target.files[0];
    this.documentError = '';
    if (this.documentFile) {
      if (this.documentFile.size > 5 * 1024 * 1024) {
        this.documentError = 'Document size must be less than 5MB.';
        this.documentFile = null;
        event.target.value = '';
      }
    }
  }

  closeForm() {
    this.showForm = false;
  }

  saveTraining() {
    this.isSaving = true;
    
    const formData = new FormData();
    formData.append('title', this.currentTraining.title);
    formData.append('description', this.currentTraining.description);
    formData.append('category', this.currentTraining.category || '');
    formData.append('link', this.currentTraining.link || '');
    if (this.currentTraining.fromDate) formData.append('fromDate', this.currentTraining.fromDate);
    if (this.currentTraining.toDate) formData.append('toDate', this.currentTraining.toDate);
    formData.append('isActive', this.currentTraining.isActive ? 'true' : 'false');
    formData.append('displayOrder', this.currentTraining.displayOrder?.toString() || '0');
    
    if (this.thumbnailFile) formData.append('thumbnail', this.thumbnailFile);
    if (this.documentFile) formData.append('document', this.documentFile);

    if (this.isEditing) {
      this.http.put(`${this.apiUrl}/${this.currentTraining._id}`, formData).subscribe({
        next: () => {
          this.fetchTrainings();
          this.closeForm();
          this.isSaving = false;
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
        }
      });
    } else {
      this.http.post(this.apiUrl, formData).subscribe({
        next: () => {
          this.fetchTrainings();
          this.closeForm();
          this.isSaving = false;
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
        }
      });
    }
  }

  deleteTraining(id: string) {
    if (confirm('Are you sure you want to delete this training?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.fetchTrainings(),
        error: (err) => console.error(err)
      });
    }
  }
}
