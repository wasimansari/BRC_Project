import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.css']
})
export class TestimonialComponent {
  testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      text: 'The education I received here has been life-changing. The teachers are dedicated, and the learning environment is exceptional. I highly recommend this institution to anyone seeking quality education.',
      image: '../../../../assets/images/testimonials/testimonial1.webp'
    },
    {
      name: 'Michael Chen',
      role: 'Business Administration',
      text: 'Outstanding curriculum and fantastic faculty members. The hands-on projects and real-world experience prepared me perfectly for my career. This institution truly cares about student success.',
      image: '../../../../assets/images/testimonials/testimonial2.webp'
    },
    {
      name: 'Emily Williams',
      role: 'Engineering Student',
      text: 'I am grateful for the excellent mentorship and state-of-the-art facilities. The collaborative atmosphere and focus on practical learning have helped me grow both personally and professionally.',
      image: '../../../../assets/images/testimonials/testimonial3.webp'
    },
    {
      name: 'David Martinez',
      role: 'Medical Science',
      text: 'The comprehensive coursework and research opportunities exceeded my expectations. The support from professors and staff made my journey here truly memorable and rewarding.',
      image: '../../../../assets/images/testimonials/testimonial4.webp'
    },
    {
      name: 'Jessica Brown',
      role: 'Arts & Design',
      text: 'Creative freedom combined with expert guidance helped me develop my unique artistic style. The campus culture fosters innovation and encourages students to think outside the box.',
      image: '../../../../assets/images/testimonials/testimonial5.webp'
    }
  ];
}
