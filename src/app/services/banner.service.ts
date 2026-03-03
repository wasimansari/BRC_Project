import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface Banner {
  _id?: string;
  title: string;
  description?: string;
  image: string;
  order?: number;
  isActive?: boolean;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private readonly BANNERS_ENDPOINT = getFullUrl('/banners');
  private readonly BANNERS_ALL_ENDPOINT = getFullUrl('/banners/all');

  // Local fallback banners data
  private localBanners: Banner[] = [
    {
      title: 'Welcome to Our School',
      description: 'Excellence in Education',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=750&fit=crop',
      order: 1,
      isActive: true
    },
    {
      title: 'Quality Education',
      description: 'Building Bright Futures',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=750&fit=crop',
      order: 2,
      isActive: true
    },
    {
      title: 'Expert Faculty',
      description: 'Learn from the best teachers',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&h=750&fit=crop',
      order: 3,
      isActive: true
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get all active banners from API
   */
  getBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.BANNERS_ENDPOINT).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching banners from API:', error);
        return of(this.localBanners);
      })
    );
  }

  /**
   * Get all banners including inactive ones
   */
  getAllBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.BANNERS_ALL_ENDPOINT).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching all banners from API:', error);
        return of(this.localBanners);
      })
    );
  }

  /**
   * Create a new banner
   */
  createBanner(banner: FormData): Observable<Banner> {
    return this.http.post<Banner>(this.BANNERS_ENDPOINT, banner);
  }

  /**
   * Update an existing banner
   */
  updateBanner(id: string, banner: FormData): Observable<Banner> {
    return this.http.put<Banner>(`${this.BANNERS_ENDPOINT}/${id}`, banner);
  }

  /**
   * Delete a banner by ID
   */
  deleteBanner(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BANNERS_ENDPOINT}/${id}`);
  }

  /**
   * Toggle banner active status
   */
  toggleBannerStatus(id: string, isActive: boolean): Observable<Banner> {
    const formData = new FormData();
    formData.append('isActive', isActive.toString());
    return this.http.put<Banner>(`${this.BANNERS_ENDPOINT}/${id}`, formData);
  }

  /**
   * Get local fallback banners (for offline usage)
   */
  getLocalBanners(): Banner[] {
    return this.localBanners;
  }
}