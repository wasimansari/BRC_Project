import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip adding token for login and signup endpoints
    const isAuthEndpoint = request.url.includes('/auth/login') || request.url.includes('/auth/signup') || request.url.includes('/teacher/login') || request.url.includes('/teacher/signup');
    
    if (isAuthEndpoint) {
      return next.handle(request);
    }

    // Determine if it's a teacher route
    const isTeacherRoute = request.url.includes('/api/teacher') || request.url.includes('/api/teacher-docs');
    
    let token: string | null = null;
    if (isTeacherRoute) {
      token = localStorage.getItem('teacherToken');
    } else {
      token = this.authService.getToken();
    }

    if (token) {
      // Clone the request and add the authorization header
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(clonedRequest);
    }

    return next.handle(request);
  }
}