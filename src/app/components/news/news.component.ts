import { Component, OnInit } from '@angular/core';
import { NewsService, News } from '../../services/news.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  news: News[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.newsService.getNews().subscribe({
      next: (news) => {
        this.news = news;
      },
      error: (err) => {
        console.error('Error loading news:', err);
        this.news = this.newsService.getLocalNews();
      }
    });
  }
}
