import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { app_constants, galleryCategories, GalleryCategory } from '../../constant';

export interface GalleryImage {
  _id?: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GallerySettings {
  categories: GalleryCategory[];
  tabsOrder: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = `${app_constants.baseUrl}/gallery`;
  private settingsUrl = `${app_constants.baseUrl}/settings`;
  private readonly SETTINGS_KEY = 'gallery-categories';

  // Default categories as fallback
  private defaultCategories: GalleryCategory[] = [...galleryCategories];
  private defaultTabsOrder: string[] = [...app_constants.galleryTabsOrder];

  constructor(private http: HttpClient) {}

  // Gallery Images
  getAllGallery(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(this.apiUrl);
  }

  getGalleryByCategory(category: string): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${this.apiUrl}/category/${category}`);
  }

  addGalleryImage(formData: FormData): Observable<GalleryImage> {
    return this.http.post<GalleryImage>(this.apiUrl, formData);
  }

  updateGalleryImage(id: string, formData: FormData): Observable<GalleryImage> {
    return this.http.put<GalleryImage>(`${this.apiUrl}/${id}`, formData);
  }

  deleteGalleryImage(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Dynamic Category Management
  getCategories(): Observable<GallerySettings | null> {
    return this.http.get<GallerySettings | null>(`${this.settingsUrl}/${this.SETTINGS_KEY}`);
  }

  saveCategories(categories: GalleryCategory[], tabsOrder: string[]): Observable<any> {
    const settings: GallerySettings = { categories, tabsOrder };
    return this.http.post(this.settingsUrl, { key: this.SETTINGS_KEY, value: settings });
  }

  // Get categories - from server first, then fallback to defaults
  getCategoriesSync(): { categories: GalleryCategory[], tabsOrder: string[] } {
    // This will be called after component loads to merge server data with defaults
    return {
      categories: this.defaultCategories,
      tabsOrder: this.defaultTabsOrder
    };
  }

  // Merge server categories with defaults - but respect server as the source of truth
  // If server has categories, use those. Only use defaults if server returns nothing (first-time setup)
  mergeCategories(serverCategories: GalleryCategory[] | null, serverTabsOrder: string[] | null): { categories: GalleryCategory[], tabsOrder: string[] } {
    // First-time setup: server has no categories yet, use defaults
    if (!serverCategories || serverCategories.length === 0) {
      return { categories: this.defaultCategories, tabsOrder: this.defaultTabsOrder };
    }
    
    // Server has categories - use them as the primary source
    // This ensures deleted categories stay deleted
    return { categories: serverCategories, tabsOrder: serverTabsOrder || [] };
  }
}
