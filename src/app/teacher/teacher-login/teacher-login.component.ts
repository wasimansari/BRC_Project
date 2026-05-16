import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherAuthService } from '../../services/teacher-auth.service';

@Component({
  selector: 'app-teacher-login',
  templateUrl: './teacher-login.component.html',
  styleUrls: ['./teacher-login.component.css']
})
export class TeacherLoginComponent {
  udiseCode = '';
  mobileNo = '';
  otp = '';
  password = '';

  otpSent = false;
  otpVerified = false;
  isLoading = false;
  message = '';

  constructor(private authService: TeacherAuthService, private router: Router) {}

  requestOtp() {
    if (!this.udiseCode || !this.mobileNo) {
      alert('Please enter UDISE code and mobile number.');
      return;
    }

    this.isLoading = true;
    this.authService.requestOtp(this.udiseCode, this.mobileNo).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.otpSent = true;
        this.message = response.message || 'OTP has been sent to your mobile number.';
        if (response.otp) {
          this.message += ` (Test OTP: ${response.otp})`;
        }
      },
      error: (error) => {
        this.isLoading = false;
        alert(error.error?.message || 'Could not send OTP. Please try again.');
      }
    });
  }

  verifyOtp() {
    if (!this.otp) {
      alert('Please enter the OTP.');
      return;
    }

    this.isLoading = true;
    this.authService.verifyOtp(this.udiseCode, this.mobileNo, this.otp).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.otpVerified = true;
        this.message = response.message || 'OTP verified successfully. Use the generated password to login.';
        if (response.password) {
          this.password = response.password;
          this.message += ` Password: ${response.password}`;
        }
      },
      error: (error) => {
        this.isLoading = false;
        alert(error.error?.message || 'OTP verification failed. Please try again.');
      }
    });
  }

  loginWithPassword() {
    if (!this.udiseCode || !this.password) {
      alert('Please enter UDISE code and password.');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.udiseCode, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        localStorage.setItem('teacherToken', response.token || '');
        localStorage.setItem('isTeacherLoggedIn', 'true');
        localStorage.setItem('teacherUdiseCode', this.udiseCode);
        this.router.navigate(['/teacher/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        alert(error.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}
