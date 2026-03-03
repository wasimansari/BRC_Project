import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.loginData.username, this.loginData.password).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        alert('Invalid credentials. Please try again.');
      }
    });
  }
}
