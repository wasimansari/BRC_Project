import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface News {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  image: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private readonly NEWS_ENDPOINT = getFullUrl('/news');

  // Local fallback news data
  private localNews: News[] = [
    {
      id: 1,
      title: 'School Wins Best Institution Award',
      description: 'Our institution has been awarded the Best School Award for excellence in education.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'New Computer Lab Inaugurated',
      description: 'State-of-the-art computer lab with 50 latest systems inaugurated by the Chief Guest.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'Student Achieves National Rank',
      description: 'Congratulations to our student for securing national rank in the entrance examination.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      title: 'Annual Result Declaration',
      description: 'Outstanding results this year with 95% pass percentage across all classes.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop'
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get all news from API
   */
  getNews(): Observable<News[]> {
    return this.http.get<News[]>(this.NEWS_ENDPOINT).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching news from API:', error);
        return of(this.localNews);
      })
    );
  }

  /**
   * Create a new news item
   */
  createNews(news: Partial<News> | FormData): Observable<News> {
    return this.http.post<News>(this.NEWS_ENDPOINT, news);
  }

  /**
   * Delete a news item by ID
   */
  deleteNews(id: string): Observable<void> {
    return this.http.delete<void>(`${this.NEWS_ENDPOINT}/${id}`);
  }

  /**
   * Get local fallback news (for offline usage)
   */
  getLocalNews(): News[] {
    return this.localNews;
  }
}