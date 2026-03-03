import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface Event {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  date: string;
  image: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly EVENTS_ENDPOINT = getFullUrl('/events');

  // Local fallback events data
  private localEvents: Event[] = [
    {
      id: 1,
      title: 'Annual Sports Day',
      description: 'Join us for the annual sports day celebration with various competitions and activities.',
      date: '2024-12-15',
      image: 'https://images.unsplash.com/photo-1461896836934-4d6631364b67?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'Science Exhibition',
      description: 'Students showcase their innovative science projects and experiments.',
      date: '2024-12-20',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'Parent-Teacher Meeting',
      description: 'Interactive session for parents and teachers to discuss student progress.',
      date: '2024-12-25',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      title: 'Cultural Festival',
      description: 'Celebrate diversity with dance, music, and cultural performances by students.',
      date: '2025-01-05',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=250&fit=crop'
    },
    {
      id: 5,
      title: 'Quiz Competition',
      description: 'Inter-school quiz competition testing knowledge in various subjects.',
      date: '2025-01-10',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop'
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get all events from API
   */
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.EVENTS_ENDPOINT).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching events from API:', error);
        return of(this.localEvents);
      })
    );
  }

  /**
   * Create a new event
   */
  createEvent(event: Partial<Event> | FormData): Observable<Event> {
    return this.http.post<Event>(this.EVENTS_ENDPOINT, event);
  }

  /**
   * Delete an event by ID
   */
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.EVENTS_ENDPOINT}/${id}`);
  }

  /**
   * Get local fallback events (for offline usage)
   */
  getLocalEvents(): Event[] {
    return this.localEvents;
  }
}
