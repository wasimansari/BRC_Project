import { Component } from '@angular/core';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent {
  courses = [
    {
      title: 'Learn English in Class',
      description: 'Master the English language with our comprehensive classroom-based learning program designed for all skill levels.',
      image: 'assets/images/courses/1.webp',
      rating: 4.5
    },
    {
      title: 'Mathematics Fundamentals',
      description: 'Build strong mathematical foundations with our expert instructors and interactive learning methods.',
      image: 'assets/images/courses/2.webp',
      rating: 4.8
    },
    {
      title: 'Science Exploration',
      description: 'Discover the wonders of science through hands-on experiments and engaging theoretical concepts.',
      image: 'assets/images/courses/3.webp',
      rating: 4.7
    }
  ];

  getStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'fas fa-star' : 'far fa-star');
    }
    return stars;
  }
}
