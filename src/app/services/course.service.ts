import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface Course {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  image: string;
  rating: number;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly COURSES_ENDPOINT = getFullUrl('/courses');

  // Local fallback courses data
  private localCourses: Course[] = [
    {
      id: 1,
      title: 'Mathematics',
      description: 'Complete mathematics course covering algebra, geometry, and calculus fundamentals.',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Science',
      description: 'Interactive science course with experiments and practical demonstrations.',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop',
      rating: 4.6
    },
    {
      id: 3,
      title: 'English',
      description: 'Comprehensive English course focusing on grammar, writing, and communication skills.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop',
      rating: 4.7
    },
    {
      id: 4,
      title: 'Computer Science',
      description: 'Learn programming, web development, and computer fundamentals.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop',
      rating: 4.9
    },
    {
      id: 5,
      title: 'History',
      description: 'Explore world history from ancient civilizations to modern times.',
      image: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=400&h=250&fit=crop',
      rating: 4.5
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get all courses from API
   */
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.COURSES_ENDPOINT).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching courses from API:', error);
        return of(this.localCourses);
      })
    );
  }

  /**
   * Create a new course
   */
  createCourse(course: Partial<Course> | FormData): Observable<Course> {
    return this.http.post<Course>(this.COURSES_ENDPOINT, course);
  }

  /**
   * Delete a course by ID
   */
  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.COURSES_ENDPOINT}/${id}`);
  }

  /**
   * Get local fallback courses (for offline usage)
   */
  getLocalCourses(): Course[] {
    return this.localCourses;
  }
}