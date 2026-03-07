import { Component, OnInit } from '@angular/core';
import { app_constants } from '../../../constant';

interface Notice {
  day: string;
  month: string;
  category: string;
  categoryClass: string;
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.css']
})
export class NoticesComponent implements OnInit {
  notices: Notice[] = app_constants.noticesData as Notice[];

  constructor() {}

  ngOnInit(): void {}
}
