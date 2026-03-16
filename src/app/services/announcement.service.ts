import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { app_constants } from '../../constant';

export interface Announcement {
  _id?: string;
  id?: string;
  day: string;
  month: string;
  category: string;
  categoryClass: string;
  title: string;
  description: string;
  image?: string | null;
  imagePublicId?: string | null;
  link: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private apiUrl = `${app_constants.baseUrl}/announcements`;

  constructor(private http: HttpClient) {}

  // Get all active announcements (public - for frontend)
  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(this.apiUrl);
  }

  // Get all announcements including inactive (for admin)
  getAllAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}/all`);
  }

  // Create a new announcement with optional image
  createAnnouncement(announcement: Partial<Announcement>, imageFile?: File): Observable<Announcement> {
    const formData = new FormData();
    
    // Append all announcement fields
    if (announcement.day) formData.append('day', announcement.day);
    if (announcement.month) formData.append('month', announcement.month);
    if (announcement.category) formData.append('category', announcement.category);
    if (announcement.categoryClass) formData.append('categoryClass', announcement.categoryClass);
    if (announcement.title) formData.append('title', announcement.title);
    if (announcement.description) formData.append('description', announcement.description);
    if (announcement.link) formData.append('link', announcement.link);
    if (announcement.displayOrder !== undefined) formData.append('displayOrder', announcement.displayOrder.toString());
    if (announcement.isActive !== undefined) formData.append('isActive', announcement.isActive.toString());
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post<Announcement>(this.apiUrl, formData);
  }

  // Update an announcement with optional image
  updateAnnouncement(id: string, announcement: Partial<Announcement>, imageFile?: File, removeImage?: boolean): Observable<Announcement> {
    const formData = new FormData();
    
    // Append all announcement fields
    if (announcement.day) formData.append('day', announcement.day);
    if (announcement.month) formData.append('month', announcement.month);
    if (announcement.category) formData.append('category', announcement.category);
    if (announcement.categoryClass) formData.append('categoryClass', announcement.categoryClass);
    if (announcement.title) formData.append('title', announcement.title);
    if (announcement.description) formData.append('description', announcement.description);
    if (announcement.link) formData.append('link', announcement.link);
    if (announcement.displayOrder !== undefined) formData.append('displayOrder', announcement.displayOrder.toString());
    if (announcement.isActive !== undefined) formData.append('isActive', announcement.isActive.toString());
    if (announcement.image) formData.append('existingImage', announcement.image);
    if (removeImage) formData.append('removeImage', 'true');
    
    // Append new image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.put<Announcement>(`${this.apiUrl}/${id}`, formData);
  }

  // Toggle announcement active status
  toggleAnnouncementStatus(id: string): Observable<Announcement> {
    return this.http.patch<Announcement>(`${this.apiUrl}/${id}/toggle`, {});
  }

  // Delete an announcement
  deleteAnnouncement(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Save to localStorage for fallback
  saveToLocalStorage(announcements: Announcement[]): void {
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }

  // Get from localStorage
  getFromLocalStorage(): Announcement[] | null {
    const data = localStorage.getItem('announcements');
    return data ? JSON.parse(data) : null;
  }
}