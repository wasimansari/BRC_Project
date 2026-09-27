import { Component, OnInit } from '@angular/core';
import { BannerService, Banner } from '../../services/banner.service';
import { app_constants } from '../../../constant';

declare var bootstrap: any;

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent implements OnInit {
  slides: Banner[] = [];
  
  private defaultSlides: Banner[] = app_constants.defaultBanners;

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
        this.initCarousel();
      },
      error: (err) => {
        console.error('Error loading banners, using defaults:', err);
        this.slides = this.defaultSlides;
        this.initCarousel();
      }
    });
  }

  initCarousel() {
    setTimeout(() => {
      const carouselEl = document.getElementById('heroCarousel');
      if (carouselEl && typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
        const existing = bootstrap.Carousel.getInstance(carouselEl);
        if (existing) {
          existing.dispose();
        }
        const carousel = new bootstrap.Carousel(carouselEl, {
          interval: 5000,
          ride: 'carousel',
          wrap: true
        });
        carousel.cycle();
      }
    }, 150);
  }

  prevSlide() {
    const el = document.getElementById('heroCarousel');
    if (el && typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
      const carousel = bootstrap.Carousel.getOrCreateInstance(el);
      carousel.prev();
    }
  }

  nextSlide() {
    const el = document.getElementById('heroCarousel');
    if (el && typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
      const carousel = bootstrap.Carousel.getOrCreateInstance(el);
      carousel.next();
    }
  }

  goToSlide(index: number) {
    const el = document.getElementById('heroCarousel');
    if (el && typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
      const carousel = bootstrap.Carousel.getOrCreateInstance(el);
      carousel.to(index);
    }
  }
}
