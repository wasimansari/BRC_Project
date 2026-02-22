import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  loginData = {
    username: '',
    password: ''
  };

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    this.http.post<any>('http://localhost:5000/api/auth/login', this.loginData).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('isAdminLoggedIn', 'true');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        alert('Invalid credentials. Please try again.');
      }
    });
  }
}
