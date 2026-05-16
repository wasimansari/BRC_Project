import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent {
  udiseCode = localStorage.getItem('teacherUdiseCode') || '';

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('isTeacherLoggedIn');
    localStorage.removeItem('teacherUdiseCode');
    this.router.navigate(['/teacher/login']);
  }
}
