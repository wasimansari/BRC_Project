import { Component, OnInit } from '@angular/core';
import { PageBackgroundService, PageBackground } from '../../services/page-background.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactPageComponent implements OnInit {
  pageBackground: PageBackground | null = null;
  pageBackgroundLoading = true;

  constructor(private pageBackgroundService: PageBackgroundService) {}

  ngOnInit() {
    this.loadPageBackground();
  }

  loadPageBackground() {
    this.pageBackgroundLoading = true;
    this.pageBackgroundService.getPageBackground('contact').subscribe({
      next: (data) => {
        this.pageBackground = data;
        this.pageBackgroundLoading = false;
      },
      error: (err) => {
        console.error('Error loading page background:', err);
        this.pageBackgroundLoading = false;
      }
    });
  }

  get backgroundImageStyle() {
    if (this.pageBackground?.backgroundImage) {
      return `url(${this.pageBackground.backgroundImage})`;
    }
    return '';
  }
}
