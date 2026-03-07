import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface DownloadFile {
  _id?: string;
  id?: number;
  category: string;
  title: string;
  description: string;
  fileUrl: string;
  filePublicId?: string;
  fileType: 'pdf' | 'image';
  fileSize: number;
  originalFileName: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DownloadCategory {
  value: string;
  label: string;
  icon: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private apiUrl = getFullUrl('/downloads');

  constructor(private http: HttpClient) {}

  getAllDownloads(): Observable<DownloadFile[]> {
    return this.http.get<DownloadFile[]>(this.apiUrl);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + '/categories');
  }

  getDownloadsByCategory(category: string): Observable<DownloadFile[]> {
    return this.http.get<DownloadFile[]>(`${this.apiUrl}?category=${category}`);
  }

  addDownload(formData: FormData): Observable<DownloadFile> {
    return this.http.post<DownloadFile>(this.apiUrl, formData);
  }

  updateDownload(id: string, formData: FormData): Observable<DownloadFile> {
    return this.http.put<DownloadFile>(`${this.apiUrl}/${id}`, formData);
  }

  deleteDownload(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get categories from server or return defaults
  getDefaultCategories(): DownloadCategory[] {
    return [
      { value: 'forms', label: 'Forms', icon: 'fas fa-file-signature', isDefault: true },
      { value: 'syllabus', label: 'Syllabus', icon: 'fas fa-book', isDefault: true },
      { value: 'results', label: 'Results', icon: 'fas fa-chart-line', isDefault: true },
      { value: 'notices', label: 'Notices', icon: 'fas fa-bell', isDefault: true },
      { value: 'calendar', label: 'Calendar', icon: 'fas fa-calendar-alt', isDefault: true }
    ];
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
