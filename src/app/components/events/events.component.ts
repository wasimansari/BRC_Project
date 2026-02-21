import { Component } from '@angular/core';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent {
  events = [
    {
      date: '15 Jun',
      title: 'Annual Science Fair',
      description: 'Join us for our annual science fair showcasing innovative student projects and experiments.',
      image: 'assets/images/events/1.webp'
    },
    {
      date: '22 Jun',
      title: 'Sports Day',
      description: 'A day filled with exciting sports competitions and team-building activities for all students.',
      image: 'assets/images/events/2.webp'
    },
    {
      date: '30 Jun',
      title: 'Cultural Festival',
      description: 'Experience diverse cultures through music, dance, food, and traditional performances.',
      image: 'assets/images/events/3.webp'
    }
  ];
}
