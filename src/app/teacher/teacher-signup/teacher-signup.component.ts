import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherAuthService, TeacherSignupData } from '../../services/teacher-auth.service';

@Component({
  selector: 'app-teacher-signup',
  templateUrl: './teacher-signup.component.html',
  styleUrls: ['./teacher-signup.component.css']
})
export class TeacherSignupComponent {
  signupData: TeacherSignupData = {
    udiseCode: '',
    mobileNo: '',
    schoolName: '',
    fullName: ''
  };

  isLoading = false;

  constructor(private authService: TeacherAuthService, private router: Router) {}

  onSignup() {
    if (!this.signupData.udiseCode || !this.signupData.mobileNo || !this.signupData.schoolName) {
      alert('Please fill in UDISE code, mobile number, and school name.');
      return;
    }

    this.isLoading = true;
    this.authService.signup(this.signupData).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Signup successful. Please login to generate OTP.');
        this.router.navigate(['/teacher/login']);
      },
      error: (error) => {
        this.isLoading = false;
        alert(error.error?.message || 'Signup failed. Please try again.');
      }
    });
  }
}
