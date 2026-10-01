import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface TeacherDocument {
  _id: string;
  udiseCode: string;
  teacherName: string;
  title: string;
  docType: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  status: string;
  adminRemarks: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminTeacherDocsService {
  private apiUrl = getFullUrl('/admin-teacher-docs');

  constructor(private http: HttpClient) {}

  getAllDocuments(filters?: any): Observable<TeacherDocument[]> {
    let params = {};
    if (filters) {
      params = { ...filters };
    }
    return this.http.get<TeacherDocument[]>(this.apiUrl, { params });
  }

  updateDocumentStatus(id: string, status: string, adminRemarks: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status, adminRemarks });
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
