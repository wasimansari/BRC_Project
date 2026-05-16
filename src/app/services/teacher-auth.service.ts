import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface TeacherSignupData {
  udiseCode: string;
  mobileNo: string;
  schoolName: string;
  fullName?: string;
}

export interface TeacherResponse {
  message: string;  otp?: string;  password?: string;
  token?: string;
  teacher?: {
    udiseCode: string;
    schoolName: string;
    fullName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TeacherAuthService {
  private readonly TEACHER_ENDPOINT = getFullUrl('/teacher');

  constructor(private http: HttpClient) {}

  signup(data: TeacherSignupData): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/signup`, data);
  }

  requestOtp(udiseCode: string, mobileNo: string): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/request-otp`, { udiseCode, mobileNo });
  }

  verifyOtp(udiseCode: string, mobileNo: string, otp: string): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/verify-otp`, { udiseCode, mobileNo, otp });
  }

  login(udiseCode: string, password: string): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(`${this.TEACHER_ENDPOINT}/login`, { udiseCode, password });
  }
}
