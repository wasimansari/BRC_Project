import { Component, OnInit } from '@angular/core';
import { BannerService, Banner } from '../../services/banner.service';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent implements OnInit {
  slides: Banner[] = [];
  
  private defaultSlides: Banner[] = [
    {
      title: 'Education Needs Complete Solution',
      description: 'We provide comprehensive educational services to help students achieve their full potential.',
      image: 'assets/images/hero/1.webp'
    },
    {
      title: 'Quality Education for Bright Future',
      description: 'Join thousands of students who have transformed their lives through our educational programs.',
      image: 'assets/images/hero/2.jpg'
    }
  ];

  constructor(private bannerService: BannerService) {}

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.bannerService.getBanners().subscribe({
      next: (banners) => {
        if (banners && banners.length > 0) {
          this.slides = banners;
        } else {
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
