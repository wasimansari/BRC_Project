import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface MasterTeacher {
  _id?: string;
  udiseCode?: string;
  schoolName?: string;
  teacherName: string;
  teacherType: string;
  teacherClass: string;
  pranNo: string;
  dob: string;
  teacherId: string;
  accountNo: string;
  basicPay: number;
  customFields?: Record<string, any>;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterTeacherResponse {
  success: boolean;
  udiseCode?: string;
  schoolName?: string;
  count?: number;
  data: MasterTeacher[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherMasterService {
  private readonly API_URL = getFullUrl('/teacher-master');

  constructor(private http: HttpClient) {}

  getTeachers(udiseCode?: string, schoolName?: string): Observable<MasterTeacherResponse> {
    const params: any = {};
    if (udiseCode) params.udiseCode = udiseCode;
    if (schoolName) params.schoolName = schoolName;
    return this.http.get<MasterTeacherResponse>(this.API_URL, { params });
  }

  addTeacher(teacher: Partial<MasterTeacher>): Observable<{ success: boolean; data: MasterTeacher; message: string }> {
    return this.http.post<{ success: boolean; data: MasterTeacher; message: string }>(
      this.API_URL,
      teacher
    );
  }

  updateTeacher(id: string, teacher: Partial<MasterTeacher>): Observable<{ success: boolean; data: MasterTeacher; message: string }> {
    return this.http.put<{ success: boolean; data: MasterTeacher; message: string }>(
      `${this.API_URL}/${id}`,
      teacher
    );
  }

  deleteTeacher(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/${id}`
    );
  }

  seedSampleTeachers(replace: boolean = false): Observable<MasterTeacherResponse> {
    return this.http.post<MasterTeacherResponse>(
      `${this.API_URL}/seed-pdf`,
      {},
      { params: { replace: replace ? 'true' : 'false' } }
    );
  }
}
