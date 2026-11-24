import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface AdminUser {
  _id?: string;
  id?: string;
  username: string;
  role: 'superadmin' | 'admin';
  name?: string;
  email?: string;
  contactNumber?: string;
  designation?: string;
  signature?: string;
  signaturePublicId?: string;
  isActive?: boolean;
  allowedPages?: string[];
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  message: string;
  admin?: AdminUser;
}

export interface SignupResponse {
  message: string;
  role?: string;
  admin?: AdminUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_ENDPOINT = getFullUrl('/auth');

  constructor(private http: HttpClient) {}

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.AUTH_ENDPOINT}/login`, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('adminToken', response.token);
          localStorage.setItem('adminRole', response.role);
          localStorage.setItem('isAdminLoggedIn', 'true');
          if (response.admin) {
            localStorage.setItem('adminUser', JSON.stringify(response.admin));
          }
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Register a new admin
   */
  signup(username: string, password: string, secretKey?: string): Observable<SignupResponse> {
    const payload = secretKey 
      ? { username, password, secretKey } 
      : { username, password };
    return this.http.post<SignupResponse>(`${this.AUTH_ENDPOINT}/signup`, payload);
  }

  /**
   * Create a new admin (requires superadmin token)
   */
  createAdmin(username: string, password: string): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.AUTH_ENDPOINT}/create-admin`, { username, password });
  }

  /**
   * Get all admins (Master Admin only)
   */
  getAllAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.AUTH_ENDPOINT}/admins`);
  }

  /**
   * Send sub-admin verification OTP to their email (Master Admin only)
   */
  sendSubAdminOtp(data: { email: string }): Observable<any> {
    return this.http.post(`${this.AUTH_ENDPOINT}/send-subadmin-otp`, data);
  }

  /**
   * Verify sub-admin email verification OTP (Master Admin only)
   */
  verifySubAdminOtp(data: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.AUTH_ENDPOINT}/verify-subadmin-otp`, data);
  }

  /**
   * Create a new sub-admin with verified email, details and page-wise access (Master Admin only)
   */
  createAdminUser(data: FormData | any): Observable<any> {
    return this.http.post(`${this.AUTH_ENDPOINT}/admins`, data);
  }

  /**
   * Update admin user (role, name, email, designation, contact, status, signature, password, allowedPages)
   */
  updateAdminUser(id: string, data: FormData | any): Observable<any> {
    return this.http.put(`${this.AUTH_ENDPOINT}/admins/${id}`, data);
  }

  /**
   * Delete an admin user (Master Admin only)
   */
  deleteAdminUser(id: string): Observable<any> {
    return this.http.delete(`${this.AUTH_ENDPOINT}/admins/${id}`);
  }

  /**
   * Delete all sub-admins (Master Admin only)
   */
  deleteAllSubAdmins(): Observable<any> {
    return this.http.delete(`${this.AUTH_ENDPOINT}/subadmins/all`);
  }

  /**
   * Get current logged-in admin's profile
   */
  getMyProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.AUTH_ENDPOINT}/me`).pipe(
      tap(admin => {
        if (admin) {
          localStorage.setItem('adminUser', JSON.stringify(admin));
          localStorage.setItem('adminRole', admin.role);
        }
      })
    );
  }

  /**
   * Update current admin's own profile and signature
   */
  updateMyProfile(data: FormData | any): Observable<any> {
    return this.http.put(`${this.AUTH_ENDPOINT}/profile`, data).pipe(
      tap((res: any) => {
        if (res?.admin) {
          localStorage.setItem('adminUser', JSON.stringify(res.admin));
        }
      })
    );
  }

  /**
   * Standalone upload signature
   */
  uploadSignature(data: FormData | any): Observable<any> {
    return this.http.post(`${this.AUTH_ENDPOINT}/upload-signature`, data);
  }

  /**
   * Check if logged in admin has access to a specific dashboard page/tab
   */
  canAccessPage(pageKey: string): boolean {
    if (this.isMasterAdmin()) {
      return true;
    }
    // Sub-admins NEVER have access to admin-management / admin details
    if (pageKey === 'admin-management') {
      return false;
    }
    // Main dashboard overview is accessible to all logged in admins
    if (pageKey === 'dashboard') {
      return true;
    }
    const admin = this.getCurrentAdmin();
    if (!admin || !admin.allowedPages) {
      // Default fallback: teacher docs if nothing specified
      return pageKey === 'teacher-docs';
    }
    return admin.allowedPages.includes(pageKey);
  }

  /**
   * Get stored admin user profile
   */
  getCurrentAdmin(): AdminUser | null {
    const raw = localStorage.getItem('adminUser');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if logged in user is Master Admin (superadmin)
   */
  isMasterAdmin(): boolean {
    return this.getRole() === 'superadmin';
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  /**
   * Get admin role
   */
  getRole(): string | null {
    return localStorage.getItem('adminRole');
  }

  /**
   * Check if admin is logged in
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  }

  /**
   * Logout admin
   */
  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAdminLoggedIn');
  }

  /**
   * Get auth headers with token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
