import { Component } from '@angular/core';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent {
  statistics = [
    { number: '2+', label: 'Years' },
    { number: '4+', label: 'Campuses' },
    { number: '1+', label: 'Courses' },
    { number: '0+', label: 'Country' }
  ];
}
