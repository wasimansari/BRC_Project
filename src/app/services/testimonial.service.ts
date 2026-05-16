import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { app_constants } from '../../constant';

export interface Testimonial {
  _id?: string;
  id?: string;
  name: string;
  role: string;
  text: string;
  image: string;
  imagePublicId?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private readonly API_URL = app_constants.baseUrl + '/testimonials';
  private readonly STORAGE_KEY = 'testimonials_data';

  constructor(private http: HttpClient) {}

  getTestimonials(): Observable<Testimonial[]> {
    // Try to fetch from backend first
    return this.http.get<Testimonial[]>(this.API_URL).pipe(
      catchError(() => {
        // Fallback to localStorage or default
        const stored = this.getFromLocalStorage();
        return of(stored && stored.length > 0 ? stored : this.getDefaultTestimonials());
      }),
      tap((data) => {
        if (data && data.length > 0) {
          this.saveToLocalStorage(data);
        }
      })
    );
  }

  createTestimonial(testimonial: Partial<Testimonial>, imageFile?: File): Observable<Testimonial> {
    const formData = new FormData();
    formData.append('name', testimonial.name || '');
    formData.append('role', testimonial.role || '');
    formData.append('text', testimonial.text || '');
    formData.append('image', testimonial.image || '');
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post<Testimonial>(this.API_URL, formData).pipe(
      catchError((error) => {
        console.error('Error creating testimonial:', error);
        return throwError(error);
      })
    );
  }

  updateTestimonial(id: string, testimonial: Partial<Testimonial>, imageFile?: File): Observable<Testimonial> {
    const formData = new FormData();
    formData.append('name', testimonial.name || '');
    formData.append('role', testimonial.role || '');
    formData.append('text', testimonial.text || '');
    formData.append('image', testimonial.image || '');
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.put<Testimonial>(`${this.API_URL}/${id}`, formData).pipe(
      catchError((error) => {
        console.error('Error updating testimonial:', error);
        return throwError(error);
      })
    );
  }

  deleteTestimonial(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting testimonial:', error);
        return throwError(error);
      })
    );
  }

  toggleTestimonialStatus(id: string): Observable<Testimonial> {
    return this.http.put<Testimonial>(`${this.API_URL}/${id}/toggle`, {}).pipe(
      catchError((error) => {
        console.error('Error toggling testimonial:', error);
        return throwError(error);
      })
    );
  }

  saveToLocalStorage(testimonials: Testimonial[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(testimonials));
    } catch (error) {
      console.error('Unable to save testimonials to localStorage:', error);
    }
  }

  getFromLocalStorage(): Testimonial[] | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) as Testimonial[] : null;
    } catch (error) {
      console.error('Unable to read testimonials from localStorage:', error);
      return null;
    }
  }

  resetToDefault(): void {
    this.saveToLocalStorage(this.getDefaultTestimonials());
  }

  private getDefaultTestimonials(): Testimonial[] {
    return app_constants.testimonialsData.map((item: any, index: number) => ({
      id: item.id || `testimonial-${index + 1}`,
      name: item.name,
      role: item.role,
      text: item.text,
      image: item.image
    }));
  }
}
