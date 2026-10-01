import { Component, OnInit, Input } from '@angular/core';
import { PageBackgroundService, PageBackground } from '../../services/page-background.service';

@Component({
  selector: 'app-events-page',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsPageComponent implements OnInit {
  @Input() showBanner: boolean = true;
  pageBackground: PageBackground | null = null;
  pageBackgroundLoading = true;

  constructor(private pageBackgroundService: PageBackgroundService) {}

  ngOnInit() {
    if (this.showBanner) {
      this.loadPageBackground();
    }
  }

  loadPageBackground() {
    this.pageBackgroundLoading = true;
    this.pageBackgroundService.getPageBackground('events').subscribe({
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
