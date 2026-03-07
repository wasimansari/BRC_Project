import { Component } from '@angular/core';
import { app_constants } from '../../../constant';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent {
  statistics = app_constants.homepageStatistics;
}
