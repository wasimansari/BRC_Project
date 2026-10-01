import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface TeacherSignupData {
  udiseCode: string;
  mobileNo: string;
  email: string;
  fullName?: string;
}

export interface TeacherResponse {
  message: string;
  success?: boolean;
  otpVerified?: boolean;
  token?: string;
  teacher?: {
    udiseCode: string;
    schoolName: string;
    fullName: string;
    email?: string;
  };
}

export interface TeacherDocument {
  _id: string;
  udiseCode: string;
  teacherName: string;
  title: string;
  docType: string;
  description: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  status?: string;
  adminRemarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherAuthService {
  private readonly TEACHER_ENDPOINT = getFullUrl('/teacher');
  private readonly DOCS_ENDPOINT = getFullUrl('/teacher-docs');

  constructor(private http: HttpClient) {}

  // ─── AUTHENTICATION ──────────────────────────────────────────────
  signup(data: TeacherSignupData): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/signup`, data);
  }

  resendOtp(udiseCode: string, email: string): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/resend-otp`, { udiseCode, email });
  }

  verifyOtp(udiseCode: string, otp: string): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/verify-otp`, { udiseCode, otp });
  }

  setPassword(udiseCode: string, newPassword: string): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/set-password`, { udiseCode, newPassword });
  }

  login(udiseCode: string, password: string): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/login`, { udiseCode, password });
  }

  forgotPassword(udiseCode: string): Observable<TeacherResponse & { email?: string }> {
    return this.http.post<TeacherResponse & { email?: string }>(`${this.TEACHER_ENDPOINT}/forgot-password`, { udiseCode });
  }

  resetPassword(udiseCode: string, otp: string, newPassword: string): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/reset-password`, { udiseCode, otp, newPassword });
  }

  // ─── DOCUMENTS ───────────────────────────────────────────────────
  uploadDocument(formData: FormData): Observable<{ message: string, document: TeacherDocument }> {
    return this.http.post<{ message: string, document: TeacherDocument }>(
      `${this.DOCS_ENDPOINT}/upload`, 
      formData
    );
  }

  getMyDocuments(): Observable<{ documents: TeacherDocument[], total: number }> {
    return this.http.get<{ documents: TeacherDocument[], total: number }>(`${this.DOCS_ENDPOINT}/my-docs`);
  }

  deleteDocument(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.DOCS_ENDPOINT}/${id}`);
  }

  // ─── UTILS ───────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('isTeacherLoggedIn');
    localStorage.removeItem('teacherUdiseCode');
    localStorage.removeItem('teacherData');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('teacherToken');
  }

  getTeacherData() {
    const data = localStorage.getItem('teacherData');
    return data ? JSON.parse(data) : null;
  }
}
