import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { app_constants } from '../../constant';

export interface TeacherDirectory {
  _id?: string;
  srNo: number;
  teacherId: string;
  teacherName: string;
  class: string;
  subject: string;
  highestQualification: string;
  schoolName: string;
  udise: string;
  contactNo: string;
  postingBlock: string;
  postingDistrict: string;
  homeDistrict: string;
  isCrcSchool: string;
  crcSchool: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeacherStats {
  totalTeachers: number;
  totalDistricts: number;
  totalBlocks: number;
  totalSubjects: number;
}

export interface ExcelUploadResponse {
  message: string;
  totalRows: number;
  inserted: number;
  updated: number;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TeacherDirectoryService {
  private readonly API_URL = app_constants.baseUrl + '/teacher-directory';

  constructor(private http: HttpClient) { }

  getAllTeachers(filters?: { postingDistrict?: string; postingBlock?: string; search?: string }): Observable<TeacherDirectory[]> {
    let params = new HttpParams();
    if (filters?.postingDistrict) params = params.set('postingDistrict', filters.postingDistrict);
    if (filters?.postingBlock) params = params.set('postingBlock', filters.postingBlock);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<TeacherDirectory[]>(this.API_URL, { params });
  }

  getTeacherStats(): Observable<TeacherStats> {
    return this.http.get<TeacherStats>(this.API_URL + '/stats');
  }

  addTeacher(teacher: Partial<TeacherDirectory>): Observable<TeacherDirectory> {
    return this.http.post<TeacherDirectory>(this.API_URL, teacher);
  }

  updateTeacher(id: string, teacher: Partial<TeacherDirectory>): Observable<TeacherDirectory> {
    return this.http.put<TeacherDirectory>(`${this.API_URL}/${id}`, teacher);
  }

  deleteTeacher(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  deleteAllTeachers(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.API_URL);
  }

  uploadExcel(file: File): Observable<ExcelUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ExcelUploadResponse>(this.API_URL + '/upload-excel', formData);
  }

  exportToPdf(): void {
    window.open(this.API_URL + '/export-pdf', '_blank');
  }

  exportToExcel(): void {
    window.open(this.API_URL + '/export-excel', '_blank');
  }
}
