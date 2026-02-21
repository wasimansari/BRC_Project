import { Component } from '@angular/core';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent {
  news = [
    {
      title: 'New Science Lab Opening',
      description: 'We are excited to announce the opening of our new state-of-the-art science laboratory.',
      image: 'assets/images/news/1.webp'
    },
    {
      title: 'Student Achievement Awards',
      description: 'Celebrating the outstanding achievements of our students in various competitions.',
      image: 'assets/images/news/2.webp'
    },
    {
      title: 'Summer Program Launch',
      description: 'Join our exciting summer educational programs designed for all age groups.',
      image: 'assets/images/news/4.webp'
    }
  ];
}
