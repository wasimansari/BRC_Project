import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TeacherAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isTeacherLoggedIn = localStorage.getItem('isTeacherLoggedIn') === 'true';
    if (!isTeacherLoggedIn) {
      this.router.navigate(['/teacher/login']);
      return false;
    }
    return true;
  }
}
