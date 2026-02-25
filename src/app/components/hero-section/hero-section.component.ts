import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent implements OnInit {
  slides: any[] = [];
  
  private defaultSlides = [
    {
      title: 'Education Needs Complete Solution',
      description: 'We provide comprehensive educational services to help students achieve their full potential through innovative teaching methods and personalized learning approaches.',
      image: 'assets/images/hero/1.webp'
    },
    {
      title: 'Quality Education for Bright Future',
      description: 'Join thousands of students who have transformed their lives through our award-winning educational programs and expert mentorship.',
      image: 'assets/images/hero/2.jpg'
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    // First try to load from localStorage (set by admin dashboard)
    const storedBanners = localStorage.getItem('banners');
    if (storedBanners) {
      const parsed = JSON.parse(storedBanners);
      if (parsed.length > 0) {
        this.slides = parsed;
        return;
      }
    }

    // If no stored banners, fetch from API
    this.http.get<any[]>('http://localhost:5000/api/banners').subscribe({
      next: (banners) => {
        if (banners && banners.length > 0) {
          this.slides = banners;
        } else {
          // Use default slides if no banners in database
          this.slides = this.defaultSlides;
        }
      },
      error: (err) => {
        console.error('Error loading banners, using defaults:', err);
        this.slides = this.defaultSlides;
      }
    });
  }
}
