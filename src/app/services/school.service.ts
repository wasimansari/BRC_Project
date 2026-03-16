import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { app_constants } from '../../constant';

export interface School {
  _id?: string;
  srNo: number;
  district: string;
  block: string;
  udiseCode: string;
  schoolName: string;
  hmHtName: string;
  mobileNo: string;
  crc: string;
  crcName: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SchoolStats {
  totalSchools: number;
  totalDistricts: number;
  totalBlocks: number;
  schoolsWithCrc: number;
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
export class SchoolService {
  private readonly API_URL = app_constants.baseUrl + '/schools';

  constructor(private http: HttpClient) { }

  getAllSchools(filters?: { district?: string; block?: string; search?: string }): Observable<School[]> {
    let params = new HttpParams();
    if (filters?.district) params = params.set('district', filters.district);
    if (filters?.block) params = params.set('block', filters.block);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<School[]>(this.API_URL, { params });
  }

  getSchoolStats(): Observable<SchoolStats> {
    return this.http.get<SchoolStats>(this.API_URL + '/stats');
  }

  addSchool(school: Partial<School>): Observable<School> {
    return this.http.post<School>(this.API_URL, school);
  }

  updateSchool(id: string, school: Partial<School>): Observable<School> {
    return this.http.put<School>(`${this.API_URL}/${id}`, school);
  }

  deleteSchool(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  deleteAllSchools(): Observable<{ message: string }> {
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

  getDistricts(): Observable<string[]> {
    return this.http.get<string[]>(this.API_URL + '/districts');
  }

  getBlocks(): Observable<string[]> {
    return this.http.get<string[]>(this.API_URL + '/blocks');
  }
}