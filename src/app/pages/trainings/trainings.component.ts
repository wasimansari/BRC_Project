import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { app_constants } from '../../../constant';
import { PageBackgroundService, PageBackground } from '../../services/page-background.service';

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css']
})
export class TrainingsPageComponent implements OnInit {
  @Input() showBanner: boolean = true;
  trainings: any[] = [];
  groupedTrainings: { [category: string]: any[] } = {};
  categories: string[] = [];
  isLoading: boolean = true;
  apiUrl = app_constants.baseUrl + '/trainings';

  pageBackground: PageBackground | null = null;
  backgroundImageStyle = '';

  constructor(private http: HttpClient, private pageBgService: PageBackgroundService) {}

  ngOnInit(): void {
    this.fetchTrainings();
    if (this.showBanner) {
      this.loadPageBackground();
    }
  }

  loadPageBackground() {
    this.pageBgService.getPageBackground('trainings').subscribe({
      next: (bg) => {
        if (bg && bg.isActive) {
          this.pageBackground = bg;
          this.backgroundImageStyle = bg.backgroundImage ? `url(${bg.backgroundImage})` : '';
        }
      },
      error: (err) => console.error('Error loading background:', err)
    });
  }

  fetchTrainings() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.trainings = data.filter(t => t.isActive);
        this.groupTrainings();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching trainings', err);
        this.isLoading = false;
      }
    });
  }

  groupTrainings() {
    this.groupedTrainings = {};
    this.trainings.forEach(training => {
      const cat = training.category || 'Other';
      if (!this.groupedTrainings[cat]) {
        this.groupedTrainings[cat] = [];
      }
      this.groupedTrainings[cat].push(training);
    });
    this.categories = Object.keys(this.groupedTrainings).sort();
  }

  getDocumentUrl(id: string): string {
    return `${this.apiUrl}/${id}/document`;
  }
}
