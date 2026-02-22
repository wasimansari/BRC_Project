import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-signup',
  templateUrl: './admin-signup.component.html',
  styleUrls: ['./admin-signup.component.css']
})
export class AdminSignupComponent {
  signupData = {
    username: '',
    password: '',
    secretKey: '' // This is the special flag field
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSignup() {
    this.http.post('http://localhost:5000/api/auth/signup', this.signupData).subscribe({
      next: (response: any) => {
        alert(`Signup successful! You are registered as: ${response.role}`);
        this.router.navigate(['/admin/login']);
      },
      error: (error) => {
        alert(error.error.message || 'Signup failed');
      }
    });
  }
}