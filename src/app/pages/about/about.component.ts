import { Component, OnInit } from '@angular/core';
import { AboutService, AboutContent } from '../../services/about.service';
import { PageBackgroundService, PageBackground } from '../../services/page-background.service';

@Component({
  selector: 'app-about-page',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  loading = true;
  aboutContent: AboutContent;
  pageBackground: PageBackground | null = null;

  constructor(
    private aboutService: AboutService,
    private pageBackgroundService: PageBackgroundService
  ) {
    // Initialize with local data to prevent template errors before the API call completes.
    this.aboutContent = this.aboutService.getLocalAbout();
  }

  ngOnInit() {
    this.loadAboutContent();
    this.loadPageBackground();
  }

  loadAboutContent() {
    this.loading = true;
    this.aboutService.getAbout().subscribe({
      next: (data) => {
        this.aboutContent = data;
        this.aboutService.saveToLocalStorage(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading about content:', err);
        // The service already handles fallbacks, so this is a last resort.
        // The content is already initialized with local data in the constructor.
        this.loading = false;
      }
    });
  }

  loadPageBackground() {
    this.pageBackgroundService.getPageBackground('about').subscribe({
      next: (data) => {
        this.pageBackground = data;
      },
      error: (err) => {
        console.error('Error loading page background:', err);
        // Try to get from localStorage as fallback
        const backgrounds = this.pageBackgroundService.getFromLocalStorage();
        if (backgrounds) {
          this.pageBackground = backgrounds.find(bg => bg.pageName === 'about') || null;
        }
      }
    });
  }

  // Convenience getters for template
  get visionMission() {
    return {
      vision: this.aboutContent.vision,
      mission: this.aboutContent.mission
    };
  }

  get beoProfile() {
    return this.aboutContent.beoProfile;
  }

  get organizationalStructure() {
    return this.aboutContent.organizationalStructure;
  }

  get staffDetails() {
    return this.aboutContent.staffDetails;
  }

  get backgroundImageStyle() {
    if (this.pageBackground?.backgroundImage) {
      return `url(${this.pageBackground.backgroundImage})`;
    }
    return '';
  }
}
