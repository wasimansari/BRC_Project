import { Component } from '@angular/core';
import { app_constants } from '../../../constant';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.css']
})
export class TestimonialComponent {
  testimonials = app_constants.testimonialsData;
}
