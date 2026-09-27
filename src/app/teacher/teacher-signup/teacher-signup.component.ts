import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherAuthService, TeacherSignupData } from '../../services/teacher-auth.service';

@Component({
  selector: 'app-teacher-signup',
  templateUrl: './teacher-signup.component.html',
  styleUrls: ['./teacher-signup.component.css']
})
export class TeacherSignupComponent {
  // Form Data
  signupData: TeacherSignupData = {
    udiseCode: '',
    mobileNo: '',
    email: '',
    fullName: ''
  };
  otp = '';
  newPassword = '';
  confirmPassword = '';

  // State
  currentStep = 1; // 1: Details, 2: OTP, 3: Password
  isLoading = false;
  message = '';
  errorMessage = '';

  // Timer
  resendCooldown = 0;
  private timerInterval: any;

  constructor(private authService: TeacherAuthService, private router: Router) {}

  // ─── STEP 1: Verify & Send OTP ─────────────────────────────
  onSignup() {
    this.errorMessage = '';
    this.message = '';

    if (!this.signupData.udiseCode || !this.signupData.mobileNo || !this.signupData.email) {
      this.errorMessage = 'Please fill in UDISE code, mobile number, and email.';
      return;
    }

    this.isLoading = true;
    this.authService.signup(this.signupData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = res.message;
        this.currentStep = 2;
        this.startResendTimer();
      },
      error: (err) => {
        this.isLoading = false;
        // err.message comes from the generic Error object thrown by our ErrorInterceptor
        // We want to display the specific backend error message
        this.errorMessage = err.message || 'Verification failed. Please check your details.';
      }
    });
  }

  // ─── STEP 2: Verify OTP ────────────────────────────────────
  onVerifyOtp() {
    this.errorMessage = '';
    this.message = '';

    if (!this.otp || this.otp.length < 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP.';
      return;
    }

    this.isLoading = true;
    this.authService.verifyOtp(this.signupData.udiseCode, this.otp).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = res.message;
        this.currentStep = 3;
        clearInterval(this.timerInterval);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'OTP verification failed.';
      }
    });
  }

  resendOtp() {
    if (this.resendCooldown > 0) return;
    
    this.isLoading = true;
    this.authService.resendOtp(this.signupData.udiseCode, this.signupData.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = res.message;
        this.startResendTimer();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to resend OTP.';
      }
    });
  }

  // ─── STEP 3: Set Password ──────────────────────────────────
  onSetPassword() {
    this.errorMessage = '';
    
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.authService.setPassword(this.signupData.udiseCode, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        alert('Account created successfully! You can now login.');
        this.router.navigate(['/teacher/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to set password.';
      }
    });
  }

  // ─── UTILS ─────────────────────────────────────────────────
  startResendTimer() {
    this.resendCooldown = 60;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
