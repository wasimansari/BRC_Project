import { Component } from '@angular/core';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent {
  libraryItems = [
    {
      title: 'Mathematics Textbook',
      price: '$29.99',
      image: 'assets/images/library/2.webp'
    },
    {
      title: 'Science Guide',
      price: '$34.99',
      image: 'assets/images/library/3.webp'
    },
    {
      title: 'English Literature',
      price: '$24.99',
      image: 'assets/images/library/4.webp'
    },
    {
      title: 'History Collection',
      price: '$39.99',
      image: 'assets/images/library/16.webp'
    }
  ];
}
