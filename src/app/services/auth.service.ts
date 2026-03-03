import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface LoginResponse {
  token: string;
  role: string;
  message: string;
}

export interface SignupResponse {
  message: string;
  role?: string;
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