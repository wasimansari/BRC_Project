import { Component, OnInit } from '@angular/core';
import { PageBackgroundService, PageBackground } from '../../services/page-background.service';

@Component({
  selector: 'app-courses-page',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesPageComponent implements OnInit {
  pageBackground: PageBackground | null = null;
  loading = true;

  constructor(private pageBackgroundService: PageBackgroundService) {}

  ngOnInit() {
    this.loadPageBackground();
  }

  loadPageBackground() {
    this.loading = true;
    this.pageBackgroundService.getPageBackground('courses').subscribe({
      next: (data) => {
        this.pageBackground = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading page background:', err);
        this.loading = false;
      }
    });
  }
}
