import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminSignupComponent } from './admin/admin-login/admin-signup.component';

const routes: Routes = [
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/signup', component: AdminSignupComponent },
  { path: '', redirectTo: '/admin/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }