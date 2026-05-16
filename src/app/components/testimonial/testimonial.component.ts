import { Component, OnInit } from '@angular/core';
import { TestimonialService, Testimonial } from '../../services/testimonial.service';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.css']
})
export class TestimonialComponent implements OnInit {
  testimonials: Testimonial[] = [];

  constructor(private testimonialService: TestimonialService) {}

  ngOnInit() {
    this.testimonialService.getTestimonials().subscribe((data) => {
      this.testimonials = data;
    });
  }
}
