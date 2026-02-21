import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  newsletterEmail = '';

  subscribeNewsletter() {
    if (this.newsletterEmail) {
      alert('Thank you for subscribing to our newsletter!');
      this.newsletterEmail = '';
    }
  }

  socialLinks = [
    { icon: 'fab fa-facebook-f', url: '#' },
    { icon: 'fab fa-twitter', url: '#' },
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-linkedin-in', url: '#' }
  ];

  usefulLinks = [
    { text: 'About Us', url: '#about' },
    { text: 'Courses', url: '#courses' },
    { text: 'Events', url: '#events' },
    { text: 'Blog', url: '#blog' },
    { text: 'Contact', url: '#contact' }
  ];
}
