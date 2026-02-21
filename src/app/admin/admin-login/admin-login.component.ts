import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onLogin() {
    if (this.loginData.username === 'admin' && this.loginData.password === 'admin123') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      this.router.navigate(['/admin/dashboard']);
    } else {
      alert('Invalid credentials. Please try again.');
    }
  }
}
