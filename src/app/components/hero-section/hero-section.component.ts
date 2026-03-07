import { Component, OnInit } from '@angular/core';
import { BannerService, Banner } from '../../services/banner.service';
import { app_constants } from '../../../constant';

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
      },
      error: (err) => {
        console.error('Error loading banners, using defaults:', err);
        this.slides = this.defaultSlides;
      }
    });
  }
}
