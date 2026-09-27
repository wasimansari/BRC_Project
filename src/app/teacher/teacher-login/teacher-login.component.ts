import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherAuthService } from '../../services/teacher-auth.service';

@Component({
  selector: 'app-teacher-login',
  templateUrl: './teacher-login.component.html',
  styleUrls: ['../teacher-signup/teacher-signup.component.css'] // Reusing styles from signup for consistency
})
export class TeacherLoginComponent {
  // Login Form
  udiseCode = '';
  password = '';

  // Forgot Password Flow
  isForgotMode = false;
  forgotStep = 1; // 1: request, 2: verify OTP & set new pass
  emailMasked = '';
  otp = '';
  newPassword = '';

  isLoading = false;
  message = '';
  errorMessage = '';

  constructor(private authService: TeacherAuthService, private router: Router) {}

  // ─── LOGIN FLOW ─────────────────────────────────────────────
  onLogin() {
    this.errorMessage = '';
    
    if (!this.udiseCode || !this.password) {
      this.errorMessage = 'Please enter UDISE code and password.';
      return;
    }

    this.isLoading = true;
    this.authService.login(this.udiseCode, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        // Save to local storage
        localStorage.setItem('teacherToken', res.token || '');
        localStorage.setItem('isTeacherLoggedIn', 'true');
        localStorage.setItem('teacherUdiseCode', this.udiseCode);
        if (res.teacher) {
          localStorage.setItem('teacherData', JSON.stringify(res.teacher));
        }

        this.router.navigate(['/teacher/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Invalid credentials.';
      }
    });
  }

  // ─── FORGOT PASSWORD FLOW ───────────────────────────────────
  toggleForgotMode() {
    this.isForgotMode = !this.isForgotMode;
    this.forgotStep = 1;
    this.errorMessage = '';
    this.message = '';
    this.otp = '';
    this.newPassword = '';
  }

  requestPasswordReset() {
    this.errorMessage = '';
    if (!this.udiseCode) {
      this.errorMessage = 'Please enter your UDISE code first.';
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.udiseCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = res.message;
        this.emailMasked = res.email || '';
        this.forgotStep = 2;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Could not initiate password reset.';
      }
    });
  }

  resetPassword() {
    this.errorMessage = '';
    if (!this.otp || !this.newPassword) {
      this.errorMessage = 'Please enter OTP and new password.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword(this.udiseCode, this.otp, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        alert('Password reset successfully! Please login with your new password.');
        this.toggleForgotMode();
        this.password = ''; // clear old password
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Password reset failed.';
      }
    });
  }
}
