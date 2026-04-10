import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { app_constants } from '../../constant';

export interface PageBackground {
  _id?: string;
  pageName: string;
  backgroundImage: string;
  backgroundImagePublicId: string;
  isActive: boolean;
  title: string;
  subtitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageBackgroundService {
  private apiUrl = app_constants.apiUrl + '/page-backgrounds';

  constructor(private http: HttpClient) {}

  getAllPageBackgrounds(): Observable<PageBackground[]> {
    return this.http.get<PageBackground[]>(this.apiUrl);
  }

  getPageBackground(pageName: string): Observable<PageBackground> {
    return this.http.get<PageBackground>(`${this.apiUrl}/${pageName}`);
  }

  savePageBackground(pageBackground: Partial<PageBackground>, imageFile?: File): Observable<PageBackground> {
    const formData = new FormData();
    formData.append('pageName', pageBackground.pageName || '');
    if (pageBackground.title) formData.append('title', pageBackground.title);
    if (pageBackground.subtitle) formData.append('subtitle', pageBackground.subtitle);
    formData.append('isActive', String(pageBackground.isActive ?? true));
    if (pageBackground.backgroundImage) formData.append('existingBackgroundImage', pageBackground.backgroundImage);
    if (imageFile) formData.append('backgroundImage', imageFile);

    return this.http.post<PageBackground>(this.apiUrl, formData);
  }

  deletePageBackground(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  saveToLocalStorage(backgrounds: PageBackground[]) {
    localStorage.setItem('pageBackgrounds', JSON.stringify(backgrounds));
  }

  getFromLocalStorage(): PageBackground[] | null {
    const stored = localStorage.getItem('pageBackgrounds');
    return stored ? JSON.parse(stored) : null;
  }
}