import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent {
  slides = [
    {
      title: 'Education Needs Complete Solution',
      description: 'We provide comprehensive educational services to help students achieve their full potential through innovative teaching methods and personalized learning approaches.',
      image: 'assets/images/hero/1.webp'
    },
    {
      title: 'Quality Education for Bright Future',
      description: 'Join thousands of students who have transformed their lives through our award-winning educational programs and expert mentorship.',
      image: 'assets/images/hero/2.jpg'
    }
  ];
}
